const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
//const cookie = require('cookie-parser');

//GET login page 
exports.getLoginPage = async (req,res) => {
    try {
        //res.status(200).json({success:true,message:'Welcom'});
        res.render('login');
    } catch (error) {
        console.log('Error',error);
        res.status(500).json({success:false,message:'Error login'});
    }
}


//POST logged in
exports.postLogin = async (req,res) => {
    const {email,password} = req.body;
    var problem = '';
    try {
        if(!email || !password){
            problem = 'Enter the email and the password';
            return res.render('login',{problem});
        }
        const user = await User.findOne({email});
        if(!user){
            problem = 'Email is not registered';
            return res.render('login',{problem});
        }
        const isMatch = await bcrypt.compare(password,user.password);
        if(!isMatch){
            problem = 'Password isnt correct try again';
            return res.render('login',{problem}); 
        }
        const token = jwt.sign({userId:user._id},process.env.JWT_SECRET_KEY,{expiresIn:'5h'});
        return res.cookie('token',token,{httpOnly:true,sameSite:'strict',maxAge: 24 * 60 * 60 * 1000 }).redirect('/home');;
    } catch (error) {
        console.log('Error',error);
        res.status(500).json({success:false,message:'Error login'});
    }
}


exports.logout = async (req,res) => {
    try {
        return res.cookie('token','',{maxAge:0}).redirect('/');
    } catch (error) {
        console.log('Error',error);
    }
}


//GET register page
exports.getRegister = async (req,res) => {
    try {
        res.render('signup');
    } catch (error) {
        console.log('Error',error);
        res.status(500).json({success:false,message:'Error login'});
    }
}



//POST post registeration
exports.postRegister = async (req,res) => {
    const {fullName,username,email,password} = req.body;
    var problem = '';
    try {
        if(!fullName || !username || !email || !password){
            problem = 'All fields are required';
            return res.render('signup',{problem});
        }
        const existingEmail = await User.findOne({email});
        if(existingEmail){
            problem = 'Email is alrady related to account';
            return res.render('signup',{problem});
        }
        const existingUserName = await User.findOne({username});
        if(existingUserName){
            problem = 'Username is alrady related to account';
            return res.render('signup',{problem});
        }
        const hashedPass = await bcrypt.hash(password,10);
        const newUser = new User({
            fullName,
            username,
            email,
            password:hashedPass
        });
        await newUser.save();
        res.redirect('/');
    } catch (error) {
        console.log('Error',error);
        res.status(500).json({success:false,message:'Error login'});
    }
}



