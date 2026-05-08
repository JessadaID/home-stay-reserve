const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/mock", authMiddleware(["customer", "admin"]), paymentController.mockPayment);

module.exports = router;