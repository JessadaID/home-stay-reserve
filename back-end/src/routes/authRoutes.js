const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// Admin Auth
router.post('/admin/register', authController.registerAdmin);
router.post('/admin/login', authController.loginAdmin);

// Customer Auth
router.post('/customer/register', authController.registerCustomer);
router.post('/customer/login', authController.loginCustomer);

module.exports = router;
