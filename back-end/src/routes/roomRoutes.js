const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');
const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// Get Rooms
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Admin Routes (Rooms)
router.post('/', authMiddleware(['admin']), upload.array('images', 10), roomController.createRoom);
router.put('/:id', authMiddleware(['admin']), upload.array('images', 10), roomController.updateRoom);
router.delete('/:id', authMiddleware(['admin']), roomController.deleteRoom);


module.exports = router;
