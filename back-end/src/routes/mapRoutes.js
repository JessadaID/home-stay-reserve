const express = require('express');
const router = express.Router();
const mapController = require('../controllers/mapController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/map', mapController.getMap);
router.post('/map', authMiddleware(['admin']), mapController.createMap);
router.put('/maps/:id', authMiddleware(['admin']), mapController.updateMap);
router.post('/maps/:mapId/markers', authMiddleware(['admin']), mapController.createMarker);
router.put('/markers/:id', authMiddleware(['admin']), mapController.updateMarker);
router.delete('/markers/:id', authMiddleware(['admin']), mapController.deleteMarker);

module.exports = router;
