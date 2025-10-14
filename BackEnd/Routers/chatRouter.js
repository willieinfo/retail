const express = require('express');
const router = express.Router();
const { loadMessages, saveMessages, deleteMessages } = require('../Controllers/WinChat/ChatServer');

router.get('/loadMessages', loadMessages)
router.post('/saveMessages', saveMessages)
router.delete('/deleteMessages/:room', deleteMessages);

module.exports = router;
