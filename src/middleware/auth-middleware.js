const jwt = require('jsonwebtoken');

const isAuthenticated = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            console.log('invalid');
            return res.redirect('/');
        }
        const decode = await jwt.verify(token,process.env.JWT_SECRET_KEY);
        if(!decode){
            console.log('invalid');
            return res.redirect('/');
        }
        req.id = decode.userId;
        next();
    } catch (error) {
        console.log('Error',error);
    }
};

module.exports = isAuthenticated;
