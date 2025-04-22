const multer = require('multer');
const path = require('path');

// Set up storage for Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Define the folder to store uploaded files
        cb(null, path.join(__dirname, '..', '..', 'public', 'stories'));  // Use absolute path
    },
    filename: function (req, file, cb) {
        // Generate a unique filename for each uploaded file
        cb(null, Date.now() + path.extname(file.originalname)); // Add extension based on the original file
    }
});

// Initialize multer with storage configuration
const upload = multer({ storage: storage });

module.exports = upload;
