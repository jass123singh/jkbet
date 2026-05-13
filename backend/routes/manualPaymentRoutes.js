const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const {
    createRequest,
    getMyRequests,
    getAllRequests,
    approveRequest,
    rejectRequest
} = require('../controllers/manualPaymentController');

// User routes
router.post('/create', authMiddleware, createRequest);
router.get('/my-requests', authMiddleware, getMyRequests);

// Admin routes (ideally should have an adminMiddleware, but using authMiddleware per request)
router.get('/all', authMiddleware, getAllRequests);
router.put('/approve/:id', authMiddleware, approveRequest);
router.put('/reject/:id', authMiddleware, rejectRequest);

module.exports = router;
