const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messages-controller');
const isAuthenticated = require('../middleware/auth-middleware');

//get the list of friends and followers
router.get('/messages',isAuthenticated,messageController.getMessagesSection);


//get the message
router.get('/messages/chat/:userId',isAuthenticated,messageController.getChat);



module.exports = router;