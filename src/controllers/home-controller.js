const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const Story = require('../models/Story');

const path = require('path');
const fs = require('fs');





//get the home page
exports.home = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.redirect('/');
        }

        const posts = await Post.find({}).sort({ createdAt: -1 })
            .populate({ path: 'user', select: '_id username profilePicture' })
            .populate({ path: 'likes', select: '_id username' });

        const story = await Story.findOne({ user: req.id }).sort({_id:-1});


        const stories = await Story.aggregate([
            {
                $match: {
                    $and: [
                        { user: { $in: user.following } }, // users who are being followed
                        { user: { $ne: req.id } } // exclude the current user
                    ]
                }
            },
            { $sort: { createdAt: -1 } },
            { $group: { _id: "$user", story: { $first: "$$ROOT" } } },
            { $replaceRoot: { newRoot: "$story" } },
            { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "userDetails" } },
            { $unwind: "$userDetails" }
        ]);
        
        
        

        res.render('home', { user, posts, story ,stories});
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Error loading home page' });
    }
};



//get the profile page
exports.profile = async (req, res) => {
    try {
        const user = await User.findById(req.id)
        .populate({path:'savedPosts',select:'imageUrl'});
        const posts = await Post.find({user:user._id}).sort({createdAt:-1});
        

        res.render('profile',{user,posts});
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Error saveing new info' });
    }
};


//get the edit page
exports.edit = async (req, res) => {
    try {
        var problem = '';
        const user = await User.findById(req.id);
        if (!user) {
            return res.redirect('/');
        }
        res.render('edit', { user,problem });
    } catch (error) {
        console.log('Error', error);
        res.status(500).json({ success: false, message: 'Error loading home profile' });
    }
};





// Save the new information
exports.updated = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        let newImageName = req.body.old_pic; // Default to the old picture name
        let uploadPath;

        // Check if a new file was uploaded
        if (req.file) {
            newImageName = req.file.filename;  
        }

        const { username, fullName, bio } = req.body;
        let problem = '';

        // Check if the username already exists
        const existUserName = await User.findOne({ username, _id: { $ne: req.id } });
        if (existUserName) {
            problem = 'Username is already taken. Please try another one.';
            return res.render('edit', { user, problem });
        }

        // Handle old profile picture removal
        if (newImageName !== req.body.old_pic) {
            const oldImagePath = path.join(__dirname, '..', '..', 'public', 'uploads', req.body.old_pic);
            if (fs.existsSync(oldImagePath) && req.body.old_pic !== 'default.jpg') {
                fs.unlinkSync(oldImagePath);  // Delete old profile picture if it's not the default
            }
        }

        await User.findByIdAndUpdate(req.id, {
            username,
            fullName,
            bio,
            profilePicture: newImageName,  // Update with the new picture name
        });

        // Send only one response after everything is done
        res.redirect('/home/profile');  // Redirect to profile page
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Error updating profile.' });
    }
};


//add post
exports.addpost = async (req,res) => {
    try {
        const user = await User.findById(req.id);
        let error = '';
        res.render('addpost',{error});
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Error adding post.' });
    }
}


//save post
exports.savepost = async (req,res) => {
    try {
        const user = await User.findById(req.id);
        const caption = req.body.caption;
        if(!req.file){
            return res.render('addpost',{error:'Image is required'});
        }
        const newPost = new Post({
            user:user._id,
            imageUrl:req.file.filename,
            caption
        });
        await newPost.save();

        res.redirect('/home');
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Error adding post.' });
    }
}


//get post
exports.post = async (req, res) => {
    try {
        const post = await Post.findById(req.params.postid)
            .populate({
                path: 'user', // Populate the user field to get user info (e.g., username)
                select: 'username profilePicture' // Select fields to populate
            })
            .populate({
                path: 'comments',
                populate: {
                    path: 'user',
                    select: 'username profilePicture' 
                },
                select: 'text createdAt' 
            });

        const user = await User.findById(req.id);

        res.render('post', { post, user });
    } catch (error) {
        console.log('Error:', error);
        res.status(500).json({ success: false, message: 'Error loading post.' });
    }
}



//likes on posts
exports.postLikes =  async (req, res) => {
    try {
        const postId = req.params.postId;  // Post ID from URL parameter
        const userId = req.id;  // Logged in user's ID

        // Find the post by ID
        const post = await Post.findById(postId);

        if (!post) {
            return res.status(404).json({ success: false, message: 'Post not found' });
        }

        // Check if the user already liked the post
        const alreadyLiked = post.likes.includes(userId);

        if (alreadyLiked) {
            // If already liked, remove the user's ID from the likes array (unlike the post)
            post.likes = post.likes.filter(like => like.toString() !== userId.toString());
        } else {
            // If not liked, add the user's ID to the likes array (like the post)
            post.likes.push(userId);
        }

        // Save the post
        await post.save();

        // Return the updated number of likes
        res.json({
            success: true,
            likesCount: post.likes.length,  // Send the updated like count back to the client
            liked: !alreadyLiked  // Send if the post is now liked or unliked
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


//get profiles
exports.getuserprofile = async (req,res) => {
    try {
        const user = await User.findById(req.id);
        const other = await User.findById(req.params.userId);
        const posts = await Post.find({user:req.params.userId});
        return res.render('userProfile',{user,posts,other});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


//following and followers
exports.follow = async (req, res) => {
    try {
        const userId = req.id;
        const otherUser = req.params.userId;
        const posts = await Post.find({ user: otherUser });

        if (userId.toString() === otherUser) {
            return res.status(400).json({ error: "You cannot follow yourself." });
        }

        const user = await User.findById(userId);
        const other = await User.findById(otherUser);

        // Ensure followers and following arrays are defined
        if (!other.followers) other.followers = [];
        if (!user.following) user.following = [];

        const isFollowing = user.following.includes(otherUser);
        if (isFollowing) {
            user.following = user.following.filter(id => id.toString() !== otherUser);
            other.followers = other.followers.filter(id => id.toString() !== userId);
        } else {
            user.following.push(otherUser);
            other.followers.push(userId);            
        }

        await user.save();
        await other.save();
        return res.redirect(`/home/user-profile/${otherUser}`);
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};


//add comment
exports.addComment = async (req,res) => {
    try {
        const postId = req.params.postId;
        const {comment} = req.body;
        if(!comment){
            return res.redirect(`/home/post/${postId}`);
        }
        const newComment = new Comment({
            user:req.id,
            post:postId,
            text:comment
        });
        await newComment.save();
        await Post.findByIdAndUpdate(postId,{
            $push:{
                comments:newComment._id
            }
        });
        res.redirect(`/home/post/${postId}`); 

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}




//search
exports.search = async (req,res) => {
    try {
        const users = '';
        res.render('search',{users});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}

//post search
exports.postSearch = async (req,res) => {
    try {
        const users = await User.find({
            username:{
                $regex:req.body.username,
                $options:'i'
            }
        });

        res.render('search',{users});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}



//ai
exports.ai = async (req,res) => {
    try {
        res.render('ai',{response:null,error:null});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


//post ai response
const axios = require('axios');
exports.postAi = async(req,res)=>{
    const MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions";
    const API_KEY = process.env.MISTRAL_KEY;
    const userMessage = req.body.message;
    try {
        const response = await axios.post(
            MISTRAL_API_URL,
            {
                "model": "mistral-tiny",
                "messages": [{"role": "user", "content": userMessage}]
            },
            {
                headers:{
                    Authorization:`Bearer ${API_KEY}`,
                    'Content-Type':'application/json'
                }
            }
        );
        const botResponse = response.data.choices[0].message.content;
        res.render('ai',{response:botResponse,error:null});
    } catch (error) {
        console.log('Error',error);
        res.render('ai',{response:null,error:'Failed to find a response'});
    }
}


//save post
exports.savePost = async (req, res) => {
    try {
        const user = await User.findById(req.id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const postId = req.params.postId;
        const isSaved = user.savedPosts.includes(postId);

        if (isSaved) {
            user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
        } else {
            user.savedPosts.push(postId);
        }

        await user.save();
        return res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};
