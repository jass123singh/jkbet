const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// @route   POST /api/transactions/manual-deposit
// @desc    Submit a manual deposit
// @access  Private
router.post("/manual-deposit", authMiddleware, upload.single('screenshot'), transactionController.createManualDeposit);

// @route   GET /api/transactions/manual-deposits
// @desc    Get all manual deposits (Admin)
// @access  Private/Admin
// TODO: Add admin protection middleware if available
router.get("/manual-deposits", authMiddleware, transactionController.getManualDeposits);

// @route   PUT /api/transactions/manual-deposit/approve/:id
// @desc    Approve a manual deposit (Admin)
// @access  Private/Admin
// TODO: Add admin protection middleware if available
router.put("/manual-deposit/approve/:id", authMiddleware, transactionController.approveManualDeposit);

// @route   PUT /api/transactions/manual-deposit/reject/:id
// @desc    Reject a manual deposit (Admin)
// @access  Private/Admin
// TODO: Add admin protection middleware if available
router.put("/manual-deposit/reject/:id", authMiddleware, transactionController.rejectManualDeposit);

router.get("/manual-withdraws", authMiddleware, transactionController.getManualWithdraws);
router.put("/manual-withdraw/approve/:id", authMiddleware, transactionController.approveManualWithdraw);
router.put("/manual-withdraw/reject/:id", authMiddleware, transactionController.rejectManualWithdraw);

module.exports = router;
