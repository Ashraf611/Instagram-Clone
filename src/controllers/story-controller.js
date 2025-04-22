const User = require('../models/User');
const Story = require('../models/Story');






//add a story
exports.addStory = async (req,res) => {
    try {
        const user = await User.findById(req.id);

        res.render('add-story',{user});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


//share the Story
exports.saveStory = async (req,res) => {
    try {
        if(!req.file){
            console.log('You did not add a story');
            return res.redirect('/home');
        }
        const newStory = new Story({
            user: req.id,
            image: req.file.filename
        });
        await newStory.save();
        res.redirect('/home');
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


exports.myStory = async (req,res) => {
    try {
        const story = await Story.find({user:req.id})
        .populate({ path: 'viewers', select: 'username profilePicture' })
        .populate({path:'user',select:'username profilePicture'});
        
        res.render('mystory',{story});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}


exports.getStoriesOfUser = async (req,res) => {
    try {
        const story = await Story.find({user:req.params.userId})
        .populate({path:'user',select:'username profilePicture'});
        
        const isAlradyViewed = story[0].viewers.some(v => v.toString() === req.id);

        if(!isAlradyViewed){
            story[0].viewers.push(req.id);
            await story[0].save();
        }

        res.render('user-stories',{story});
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
}