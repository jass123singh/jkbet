const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Create manual deposit
exports.createManualDeposit = async (req, res) => {
    try {
        const { amount, utr } = req.body;
        const userId = req.user.id;
        
        const screenshot = req.file ? `/uploads/payment-screenshots/${req.file.filename}` : null;

        if (!amount || !utr || !screenshot) {
            return res.status(400).json({ message: "Amount, UTR, and screenshot are required" });
        }

        const existingTransaction = await Transaction.findOne({ utr });
        if (existingTransaction) {
            return res.status(400).json({ message: "UTR already exists" });
        }

        const transaction = new Transaction({
            userId,
            amount,
            type: "deposit",
            utr,
            screenshot,
            status: "pending"
        });

        await transaction.save();
        res.status(201).json({ message: "Deposit request submitted successfully", transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Get all manual deposits (Admin)
exports.getManualDeposits = async (req, res) => {
    try {
        // Fetch all deposits (can filter by status if needed, but requirements ask for pending or all)
        const deposits = await Transaction.find({ type: "deposit", utr: { $exists: true, $ne: null } }).sort({ createdAt: -1 });

        // Populate user details manually since userId is a String and not an ObjectId ref in the schema
        const depositsWithUser = await Promise.all(deposits.map(async (deposit) => {
            const user = await User.findById(deposit.userId).select('name email');
            return {
                ...deposit.toObject(),
                user: user || null
            };
        }));

        res.status(200).json(depositsWithUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Approve manual deposit (Admin)
exports.approveManualDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaction is already processed" });
        }

        transaction.status = "success";
        await transaction.save();

        // Increment user balance
        const updatedUser = await User.findByIdAndUpdate(
            transaction.userId, 
            { $inc: { balance: Number(transaction.amount) } },
            { new: true }
        );

        if (!updatedUser) {
            transaction.status = "pending"; // rollback
            await transaction.save();
            return res.status(404).json({ message: "User not found to update balance" });
        }

        res.status(200).json({ 
            message: "Deposit approved successfully", 
            transaction,
            newBalance: updatedUser.balance 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};

// Reject manual deposit (Admin)
exports.rejectManualDeposit = async (req, res) => {
    try {
        const { id } = req.params;
        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaction is already processed" });
        }

        transaction.status = "rejected";
        await transaction.save();

        res.status(200).json({ message: "Deposit rejected successfully", transaction });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
};
