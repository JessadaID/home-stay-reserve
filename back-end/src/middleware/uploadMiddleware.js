const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const mapUploadDir = path.join(__dirname, '../../uploads/maps');
if (!fs.existsSync(mapUploadDir)) {
    fs.mkdirSync(mapUploadDir, { recursive: true });
}

// Storage config for map images
const mapStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, mapUploadDir);
    },
    filename: (req, file, cb) => {
        // Name file as timestamp + original extension
        const ext = path.extname(file.originalname);
        cb(null, `map_${Date.now()}${ext}`);
    }
});

// File filter: images only
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

const uploadMapImage = multer({
    storage: mapStorage,
    fileFilter: imageFilter,
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

module.exports = { uploadMapImage };
