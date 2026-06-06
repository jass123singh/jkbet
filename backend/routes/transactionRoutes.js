const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const transactionController = require("../controllers/transactionController");

// User routes
router.post("/manual-deposit", authMiddleware, transactionController.createManualDeposit);

// Admin routes
router.get("/manual-deposits", authMiddleware, adminMiddleware, transactionController.getManualDeposits);
router.put("/manual-deposit/approve/:id", authMiddleware, adminMiddleware, transactionController.approveManualDeposit);
router.put("/manual-deposit/reject/:id", authMiddleware, adminMiddleware, transactionController.rejectManualDeposit);

module.exports = router;
