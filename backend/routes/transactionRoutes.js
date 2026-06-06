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

router.get("/withdrawals", authMiddleware, adminMiddleware, transactionController.getWithdrawals);
router.put("/withdrawal/approve/:id", authMiddleware, adminMiddleware, transactionController.approveWithdrawal);
router.put("/withdrawal/reject/:id", authMiddleware, adminMiddleware, transactionController.rejectWithdrawal);

router.post("/admin-deposit", authMiddleware, adminMiddleware, transactionController.adminDirectDeposit);

module.exports = router;
