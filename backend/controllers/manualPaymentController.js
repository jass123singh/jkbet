const ManualPayment = require('../models/ManualPayment');
const User = require('../models/User');

// Create a new manual payment request (User)
exports.createRequest = async (req, res) => {
    try {
        const { amount, utrNumber, screenshot } = req.body;
        
        if (!amount || !utrNumber) {
            return res.status(400).json({ message: "Amount and UTR number are required" });
        }

        const newRequest = new ManualPayment({
            userId: req.user.id,
            amount: Number(amount),
            utrNumber,
            screenshot
        });

        await newRequest.save();

        res.status(201).json({ message: "Payment request submitted successfully", data: newRequest });
    } catch (error) {
        console.error("Create manual payment error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get my manual payment requests (User)
exports.getMyRequests = async (req, res) => {
    try {
        const requests = await ManualPayment.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({ data: requests });
    } catch (error) {
        console.error("Get my requests error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all manual payment requests (Admin)
exports.getAllRequests = async (req, res) => {
    try {
        const requests = await ManualPayment.find().populate('userId', 'email name').sort({ createdAt: -1 });
        res.status(200).json({ data: requests });
    } catch (error) {
        console.error("Get all requests error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve a manual payment request (Admin)
exports.approveRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ManualPayment.findById(id);

        if (!request) {
            return res.status(404).json({ message: "Payment request not found" });
        }

        if (request.status === 'approved') {
            return res.status(400).json({ message: "Payment request is already approved" });
        }

        request.status = 'approved';
        await request.save();

        // Add balance to user
        const user = await User.findById(request.userId);
        if (user) {
            user.balance = (user.balance || 0) + request.amount;
            await user.save();
        }

        res.status(200).json({ message: "Payment approved successfully", data: request });
    } catch (error) {
        console.error("Approve request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};

// Reject a manual payment request (Admin)
exports.rejectRequest = async (req, res) => {
    try {
        const { id } = req.params;
        const request = await ManualPayment.findById(id);

        if (!request) {
            return res.status(404).json({ message: "Payment request not found" });
        }

        if (request.status === 'approved') {
            return res.status(400).json({ message: "Cannot reject an already approved request" });
        }

        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: "Payment rejected successfully", data: request });
    } catch (error) {
        console.error("Reject request error:", error);
        res.status(500).json({ message: "Server error" });
    }
};
