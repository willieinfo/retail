const { queryDatabase } = require('../../DBConnect/dbConnect'); // Import the database connection

// const sql = require('mssql');
// const bodyParser = require('body-parser');
// require('dotenv').config();

// // SQL connection configuration
// const dbConfig = {
//         user: process.env.DB_USER,
//         password: process.env.DB_PASSWORD,
//         server: process.env.DB_SERVER,
//         database: process.env.DB_DATABASE,
//         options: {
//         trustServerCertificate: true,
//         encrypt: false,
//         enableArithAbort: true
//         },
//         port: 1433,
//         requestTimeout: 600000    
// };

// // Connect once at startup
// sql.connect(dbConfig)
//    .then(() => console.log('✅ Connected to MSSQL'))
//    .catch(err => console.error('❌ MSSQL connection error:', err));


// WinChat Server
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();

// Enable JSON parsing for POST
// app.use(bodyParser.json());

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
// ===========================
// EXPRESS API ENDPOINTS
// ===========================
const loadMessages = async (req, res) => {
        const room = req.query.room;
        
        let cSql = `SELECT name, text, date, time, room, type, fileName
            FROM CHATMSGS
            WHERE 1=1
            `
        
        const params = {};
        if (room) {
                cSql += " AND CHATMSGS.room = @room";
                params.room = `${room}`;
        }
        cSql += ` ORDER BY CHATMSGS.AutIncId`;
        
        try {
            const result = await queryDatabase(cSql, params);
            res.json(result);  
        } catch (err) {
            console.error('Chat Message loading error:', err);
            res.status(500).send('Error loading chat message');
        }
  }

async function insertChatMessage({ name, text, date, time, room, type, fileName }) {
    const cSql = `
        INSERT INTO CHATMSGS (name, text, date, time, room, type, fileName)
        VALUES (@name, @text, @date, @time, @room, @type, @fileName)
    `;
    const params = { name, text, date, time, room, type, fileName };
    return await queryDatabase(cSql, params);
}  
const saveMessages = async (req, res) => {
    try {
        const result = await insertChatMessage(req.body);
        res.json(result);
    } catch (err) {
        console.error('Insert Chat Messages error:', err);
        res.status(500).json({ error: 'Error inserting CHATMSGS' });
    }
};
// const saveMessages = async (req, res) => {
//         const { name, text, date, time, room, type, fileName } = req.body;
        
//         const cSql = `
//                 INSERT INTO CHATMSGS (name, text, date, time, room, type, fileName)
//                 VALUES (@name, @text, @date, @time, @room, @type, @fileName)
//         `
//         const params = { name, text, date, time, room, type, fileName };
//         try {
//                 const result = await queryDatabase(cSql, params);
//                 res.json(result);  
//         } catch (err) {
//                 console.error('Insert Chat Messages error:', err);
//                 res.status(500).json({ error: 'Error inserting CHATMSGS' });
//         }
// }

const deleteMessages = async (req, res) => {
    const room = req.params.room;  // 🟡 now coming from URL param

    if (!room) {
        return res.status(400).json({ message: 'Room is required' });
    }

    const cSql = `DELETE FROM CHATMSGS WHERE CHATMSGS.room = @room`;
    const params = { room };

    try {
        const result = await queryDatabase(cSql, params);
        res.json({ success: true, result });
    } catch (err) {
        console.error('Delete Chat Messages error:', err);
        res.status(500).json({ error: 'Error deleting CHATMSGS' });
    }
};


const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray;
    }
};

// Store pending messages for users
const PendingMessages = {
    messages: {}, // { userId: [{ message, room, senderId }], ... }
    addMessage: function (userId, message, room, senderId) {
        if (!this.messages[userId]) {
            this.messages[userId] = [];
        }
        this.messages[userId].push({ message, room, senderId });
    },
    getMessages: function (userId, room) {
        if (!this.messages[userId]) return [];
        return this.messages[userId].filter(msg => msg.room === room);
    },
    clearMessages: function (userId, room) {
        if (this.messages[userId]) {
            this.messages[userId] = this.messages[userId].filter(msg => msg.room !== room);
            if (this.messages[userId].length === 0) {
                delete this.messages[userId];
            }
        }
    }
};

// ===========================
// SOCKET.IO
// ===========================
const SYSTEM = "Admin";
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5500',
  'http://localhost:5501',
  'http://127.0.0.1:5501',
  'http://127.0.0.1:5500',
  "file://*"   
];

initializeChatServer = (server) => {
    const io = socketIo(server, {
        cors: {
        //     origin: (origin, callback) => {
        //         // console.log('Received origin:', origin);
        //         if (!origin || allowedOrigins.includes(origin)) {
        //             callback(null, true);
        //         } else {
        //             callback(new Error("Not allowed by CORS"));
        //         }
        //     },
            origin: "*",   // ✅ allow all origins
            methods: ["GET", "POST"],
            credentials: true
            },
            allowEIO3: true,   // ✅ support Electron clients using older Engine.IO
            maxHttpBufferSize: 10e6
        });



    // io Connection
    io.on('connection', async socket => {
        socket.emit('message', buildMsg(SYSTEM, "Welcome to WinChat!"));

            socket.on('login', ({ name }) => {
                socket.data.name = name; // store username in socket
                console.log(`User logged in: ${name} (${socket.id})`);
            });


            // Attach socket IDs for matched users
            UsersState.users.forEach(user => {
                if (user.name && !user.id) {
                    user.id = socket.id; // Basic attach, can refine
                }
            });



        socket.on('requestUserList', async () => {
            try {
                socket.emit('userList', {
                    users: getAllUsers(),
                    pendingMessages: getPendingMessagesForAllUsers()
                });
            } catch (err) {
                console.error("Error sending user list:", err);
            }
        });


        socket.on('enterApp', ({ name }) => {
            const user = activateUser(socket.id, name, null);
            io.emit('userList', {
                users: getAllUsers(),
                pendingMessages: getPendingMessagesForAllUsers()
            });
            // socket.emit('message', buildMsg(SYSTEM, `You have joined WinChat`));
            socket.broadcast.emit('message', buildMsg(SYSTEM, `${user.name} has joined WinChat`));
        });

        socket.on('joinPrivateRoom', ({ name, targetUser }) => {
            const user = getUser(socket.id);
            if (!user) return;

            const room = getPrivateRoomId(name, targetUser);
            const prevRoom = user.room;

            if (prevRoom) {
                socket.leave(prevRoom);
            }

            user.room = room;
            UsersState.setUsers([...UsersState.users]);

            socket.join(room);

            // Deliver any pending messages for this room
            const pendingMessages = PendingMessages.getMessages(socket.id, room);
            pendingMessages.forEach(({ message }) => {
                socket.emit('message', message);
            });
            PendingMessages.clearMessages(socket.id, room);

            // Update user list with pending message counts
            io.emit('userList', {
                users: getAllUsers(),
                pendingMessages: getPendingMessagesForAllUsers()
            });
        });

        socket.on('disconnect', () => {
            const user = getUser(socket.id);
            userLeavesApp(socket.id);
            if (user) {
                io.emit('message', buildMsg(SYSTEM, `${user.name} has left WinChat`));
                io.emit('userList', {
                    users: getAllUsers(),
                    pendingMessages: getPendingMessagesForAllUsers()
                });
                // Clear pending messages for disconnected user
                delete PendingMessages.messages[socket.id];
            }
        });

        socket.on('message', async ({ name, text, room, type, fileName }) => {
            const message = buildMsg(name, text, room, type, fileName);

            try {
                await insertChatMessage(message);
            } catch (err) {
                console.error('❌ Error inserting chat message:', err);
            }            

            if (room) {
                // Find the target user (other user in the private room)
                const usersInRoom = room.split('_');
                const targetUserName = usersInRoom.find(u => u !== name);
                const targetUser = UsersState.users.find(u => u.name === targetUserName);
                
                if (targetUser) {
                    // Check if target user is in the same room
                    if (targetUser.room === room) {
                        io.to(room).emit('message', message);
                    } else {
                        // Queue the message and notify the target user
                        PendingMessages.addMessage(targetUser.id, message, room, socket.id);
                        io.to(targetUser.id).emit('notification', {
                            from: name,
                            room
                        });
                        // Emit to sender to display the message immediately
                        socket.emit('message', message);
                    }
                } else {
                    // If target user is not found, still emit to sender
                    socket.emit('message', message);
                }
            } else {
                // Broadcast to all users
                io.emit('message', message);
            }
        });


        socket.on('activity', ({ name, room }) => {
            if (room) {
                socket.broadcast.to(room).emit('activity', name);
            } else {
                socket.broadcast.emit('activity', name);
            }
        });

        // Voice call handlers 
        socket.on('voice-offer', ({ target, offer }) => {
            const targetSocket = getUserSocketIdByName(target);
            if (targetSocket) {
                io.to(targetSocket).emit('voice-offer', {
                    from: getUser(socket.id).name,
                    offer
                });
            }
        });

        socket.on('voice-reject', ({ target }) => {
            const targetSocket = getUserSocketIdByName(target);
            if (targetSocket) {
                io.to(targetSocket).emit('voice-rejected', {
                    message: "The call was rejected."
                });
            }
        });

        socket.on('voice-answer', ({ target, answer }) => {
            const targetSocket = getUserSocketIdByName(target);
            if (targetSocket) {
                io.to(targetSocket).emit('voice-answer', {
                    answer
                });
            }
        });

        socket.on('ice-candidate', ({ target, candidate }) => {
            const targetSocket = getUserSocketIdByName(target);
            if (targetSocket) {
                io.to(targetSocket).emit('ice-candidate', {
                    candidate
                });
            }
        });

        
    });

    return io; // Optionally return io for further use if needed
};
// ===========================

function getPrivateRoomId(user1, user2) {
    return [user1, user2].sort().join('_');
}

function getUserSocketIdByName(name) {
    const user = UsersState.users.find(u => u.name === name);
    return user?.id;
}

function buildMsg(name, text, room = null, type = 'text', fileName = '') {
    return {
        name,
        text,
        date: new Intl.DateTimeFormat('default', {
            year: 'numeric',
            month: 'numeric',
            day: 'numeric'
        }).format(new Date()),
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date()),
        room,
        type,
        fileName
    };
}

function activateUser(id, name, room) {
    const user = { id, name, room };
    UsersState.setUsers([...UsersState.users.filter(user => user.id !== id),user]);
    return user;
}

function userLeavesApp(id) {
    UsersState.setUsers(
        UsersState.users.filter(user => user.id !== id)
    );
}

function getUser(id) {
    return UsersState.users.find(user => user.id === id);
}

function getAllUsers() {
    return UsersState.users;
}

// Helper function to get pending message counts for all users
function getPendingMessagesForAllUsers() {
    const pendingCounts = {};
    Object.keys(PendingMessages.messages).forEach(userId => {
        const user = getUser(userId);
        if (user) {
            const counts = {};
            PendingMessages.messages[userId].forEach(({ room }) => {
                const otherUser = room.split('_').find(name => name !== user.name);
                counts[otherUser] = (counts[otherUser] || 0) + 1;
            });
            pendingCounts[user.name] = counts;
        }
    });
    return pendingCounts;
}

module.exports = { initializeChatServer, loadMessages, saveMessages, deleteMessages };