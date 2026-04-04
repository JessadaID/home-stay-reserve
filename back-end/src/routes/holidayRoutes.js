const express = require('express');
const router = express.Router();
const holidayController = require('../controllers/holidayController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', holidayController.getHolidays);
router.post('/', authMiddleware(['admin']), holidayController.addHoliday);
router.delete('/:id', authMiddleware(['admin']), holidayController.deleteHoliday);

module.exports = router;
