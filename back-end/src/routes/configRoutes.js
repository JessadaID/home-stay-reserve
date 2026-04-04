const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', configController.getConfig);
router.put('/', authMiddleware(['admin']), configController.updateConfig);

module.exports = router;
