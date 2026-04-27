const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMapImage } = require('../middleware/uploadMiddleware');

// Public
router.get('/map', mapController.getMap);

// Admin — create map (supports file upload OR json url)
router.post('/map', authMiddleware(['admin']), uploadMapImage.single('image'), mapController.createMap);

// Admin — update map image (supports file upload OR json url)
router.put('/maps/:id', authMiddleware(['admin']), uploadMapImage.single('image'), mapController.updateMap);

// Admin — markers
router.post('/maps/:mapId/markers', authMiddleware(['admin']), mapController.createMarker);
router.put('/markers/:id', authMiddleware(['admin']), mapController.updateMarker);
router.delete('/markers/:id', authMiddleware(['admin']), mapController.deleteMarker);

module.exports = router;
