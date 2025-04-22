const User = require('../models/User');
const Message = require('../models/Message');



exports.getMessagesSection = async (req, res) => {
    try {
        const user = await User.findById(req.id)
            .populate('following')
            .populate('followers');

        const followingUsers = user.following;

        const followersUsers = user.followers.filter(follower =>
            !user.following.some(followed => followed._id.toString() === follower._id.toString()));

        // Find unread messages from users you follow
        const unreadMessages = await Message.find({
            receiverId: user._id,
            isRead: false,
        });

        res.render('messages-section', { user, followersUsers, followingUsers, unreadMessages });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};



//get chat 
exports.getChat = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        const other = await User.findById(req.params.userId);

        // Fetch messages between the current user and the other user
        const messages = await Message.find({
            $or: [
                { senderId: user._id, receiverId: other._id },
                { senderId: other._id, receiverId: user._id }
            ]
        }).sort({ createdAt: 1 });

        // Mark messages as read when the user opens the chat
        await Message.updateMany(
            { senderId: other._id, receiverId: user._id, isRead: false },
            { $set: { isRead: true } }
        );

        res.render('messages-chat', { user, other, messages });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
