const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const authMiddleware = require('../middleware/authMiddleware');

// Get Rooms
router.get('/', roomController.getAllRooms);
router.get('/:id', roomController.getRoomById);

// Admin Routes (Rooms)
router.post('/', authMiddleware(['admin']), roomController.createRoom);
router.put('/:id', authMiddleware(['admin']), roomController.updateRoom);
router.delete('/:id', authMiddleware(['admin']), roomController.deleteRoom);

// Admin Routes (Images)
router.post('/:roomId/images', authMiddleware(['admin']), roomController.addImageToRoom);
router.delete('/images/:id', authMiddleware(['admin']), roomController.deleteImage);

module.exports = router;
