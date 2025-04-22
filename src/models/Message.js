const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },  // New field to track read/unread status
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
