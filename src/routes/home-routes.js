const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home-controller');
const isAuthenticated = require('../middleware/auth-middleware');
const multer = require('../config/multer-storage');

//home page
router.get('/',isAuthenticated,homeController.home);

//profile page
router.get('/profile',isAuthenticated,homeController.profile);

//edit profile
router.get('/edit',isAuthenticated,homeController.edit);
router.post('/updateProfile',multer.single('image'),isAuthenticated,homeController.updated);

//create post
router.get('/addpost',isAuthenticated,homeController.addpost);
router.post('/savepost',isAuthenticated,multer.single('image'),homeController.savepost);

//get post
router.get('/post/:postid',isAuthenticated,homeController.post);
router.post('/post/like/:postId',isAuthenticated,homeController.postLikes);

//get profile
router.get('/user-profile/:userId',isAuthenticated,homeController.getuserprofile);

//follow
router.post('/follow/:userId',isAuthenticated,homeController.follow);


//comment
router.post('/post-comment/:postId/comment',isAuthenticated,homeController.addComment);

//search
router.get('/search',isAuthenticated,homeController.search);
router.post('/search',isAuthenticated,homeController.postSearch);


//ai
router.get('/ai',isAuthenticated,homeController.ai);
router.post('/ask',isAuthenticated,homeController.postAi);

//save post 
router.post('/save-post/:postId',isAuthenticated,homeController.savePost);

module.exports = router;