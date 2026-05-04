const express = require('express');
const router = express.Router();
const { 
    registerAdmin, 
    loginAdmin, 
    registerCustomer, 
    loginCustomer 
} = require('../controller/authController');

// Admin Auth
router.post('/admin/register', registerAdmin);
router.post('/admin/login', loginAdmin);

// Customer Auth
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);

module.exports = router;