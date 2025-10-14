const { queryDatabase } = require('../../DBConnect/dbConnect'); // Import the database connection

// ===========================
// WinChat Server with MSSQL
// ===========================
const socketIo = require('socket.io');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// ===========================
const SYSTEM = "Admin";
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5500',
    'http://localhost:5501',
    'http://127.0.0.1:5500',
    'http://127.0.0.1:5501',
    "file://*"
];


// ===========================
// Users and Pending Messages
// ===========================
const UsersState = {
    users: [],
    setUsers: function (newUsersArray) {
        this.users = newUsersArray;
    }
};

const PendingMessages = {
    messages: {},
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
// EXPRESS API ENDPOINTS
// ===========================

// Load messages for a room
app.get('/api/messages/:room', async (req, res) => {
    try {
        const room = req.params.room;
        const result = await sql.query`
            SELECT name, text, date, time, room, type
            FROM ChatMessages
            WHERE room = ${room}
            ORDER BY ID ASC
        `;
        res.json(result.recordset);
    } catch (err) {
        console.error('❌ Error loading messages:', err);
        res.status(500).send('Database error');
    }
});

// Save a new message
app.post('/api/messages', async (req, res) => {
    try {
        const { name, text, date, time, room, type } = req.body;
        await sql.query`
            INSERT INTO ChatMessages (name, text, date, time, room, type)
            VALUES (${name}, ${text}, ${date}, ${time}, ${room}, ${type})
        `;
        res.sendStatus(200);
    } catch (err) {
        console.error('❌ Error saving message:', err);
        res.status(500).send('Database error');
    }
});

// Delete messages for a room
app.delete('/api/messages/:room', async (req, res) => {
    try {
        const room = req.params.room;
        await sql.query`
            DELETE FROM ChatMessages WHERE room = ${room}
        `;
        res.sendStatus(200);
    } catch (err) {
        console.error('❌ Error deleting messages:', err);
        res.status(500).send('Database error');
    }
});

// ===========================
// SOCKET.IO
// ===========================
initializeChatServer = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            credentials: true
        },
        allowEIO3: true,
        maxHttpBufferSize: 10e6
    });

    io.on('connection', async socket => {
        socket.emit('message', buildMsg(SYSTEM, "Welcome to WinChat!"));

        socket.on('login', ({ name }) => {
            socket.data.name = name;
            console.log(`User logged in: ${name} (${socket.id})`);
        });

        UsersState.users.forEach(user => {
            if (user.name && !user.id) {
                user.id = socket.id;
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

            // Deliver pending messages
            const pendingMessages = PendingMessages.getMessages(socket.id, room);
            pendingMessages.forEach(({ message }) => {
                socket.emit('message', message);
            });
            PendingMessages.clearMessages(socket.id, room);

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
                delete PendingMessages.messages[socket.id];
            }
        });

        socket.on('message', async ({ name, text, room, type, fileName }) => {
            const message = buildMsg(name, text, room, type, fileName);

            // 💾 Save to DB
            try {
                await sql.query`
                    INSERT INTO ChatMessages (name, text, date, time, room, type, fileName)
                    VALUES (${message.name}, ${message.text}, ${message.date}, ${message.time},
                            ${message.room}, ${message.type}, ${message.fileName})
                `;
            } catch (err) {
                console.error('❌ Failed to save message to DB:', err);
            }

            // 🔔 Send to receiver
            if (room) {
                const usersInRoom = room.split('_');
                const targetUserName = usersInRoom.find(u => u !== name);
                const targetUser = UsersState.users.find(u => u.name === targetUserName);

                if (targetUser) {
                    if (targetUser.room === room) {
                        io.to(room).emit('message', message);
                    } else {
                        PendingMessages.addMessage(targetUser.id, message, room, socket.id);
                        io.to(targetUser.id).emit('notification', {
                            from: name,
                            room
                        });
                        socket.emit('message', message);
                    }
                } else {
                    socket.emit('message', message);
                }
            } else {
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

        // some Voice call handlers ... here
    });

    return io;
};

// ===========================
// HELPER FUNCTIONS
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
    UsersState.setUsers([...UsersState.users.filter(user => user.id !== id), user]);
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

module.exports = { initializeChatServer, app };
