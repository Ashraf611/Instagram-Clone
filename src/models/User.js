const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username:{type:String,required:true,unique:true},
    fullName:{type:String,required:true},
    email:{type:String,required:true,unique:true},
    password:{type:String,required:true},
    profilePicture:{type:String,default:'default.jpg'},
    bio:{type:String,default:''},
    followers:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    following:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}],
    posts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    stories:[{type:mongoose.Schema.Types.ObjectId,ref:'Story'}],
    savedPosts:[{type:mongoose.Schema.Types.ObjectId,ref:'Post'}],
    isPrivate:{type:Boolean,default:false},
    createdAt:{type:Date,default:Date.now}
});

module.exports = mongoose.model('User',userSchema);