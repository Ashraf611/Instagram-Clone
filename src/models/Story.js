const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    image: { type: String, required: true },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    expiresAt: { type: Date, default: () => new Date(Date.now() + 5 * 60 * 60 * 1000), index: { expires: 0 } }
});


//    expiresAt: {type: Date,default: () => new Date(Date.now() + 1 * 60 * 1000),index:{expires:0}} one minute
//    expiresAt:{type:Date,default:()=> new Date(Date.now+24*60*60*1000),index:{expires:0}}  24 hours

module.exports = mongoose.model('Story',storySchema);