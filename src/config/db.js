const mongoose = require('mongoose');

const connectDB = async() => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Database connected succesfully..');
    } catch (error) {
        console.log('Database isnt connected',error);
    }
}

module.exports = connectDB;