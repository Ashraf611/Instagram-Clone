const express = require('express');
const router = express.Router();
const storyController = require('../controllers/story-controller');
const isAuthenticated = require('../middleware/auth-middleware');
const multer = require('../config/multer-stories');



//get story page to add one
router.get('/story',isAuthenticated,storyController.addStory);

//share the story
router.post('/add-story',multer.single('image'),isAuthenticated,storyController.saveStory);

//get my story
router.get('/mystories',isAuthenticated,storyController.myStory);

//get stories of a user
router.get('/mystories/:userId',isAuthenticated,storyController.getStoriesOfUser);

module.exports = router;