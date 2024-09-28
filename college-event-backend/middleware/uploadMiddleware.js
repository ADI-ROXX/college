// middleware/uploadMiddleware.js

const multer = require('multer');
const path = require('path');
const { addRandomStringToFilename } = require('../utils/utils');

// Define storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.UPLOADS_FOLDER || 'uploads/');
    },
    filename: function (req, file, cb) {
        // Generate a unique filename
        const uniqueFilename = addRandomStringToFilename(file.originalname);
        cb(null, uniqueFilename);
    },
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Only .jpeg, .jpg and .png files are allowed.'));
    }
};

// Initialize Multer with storage, file filter, and limits
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit per file
    fileFilter: fileFilter,
}).fields([
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
]);

module.exports = upload;
