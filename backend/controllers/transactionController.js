const Transaction = require("../models/Transaction");
const User = require("../models/User");

exports.createManualDeposit = async (req, res) => {
    try {
        const { amount, utr, screenshot } = req.body;

        if (!amount || !utr || !screenshot) {
            return res.status(400).json({ message: "Amount, UTR, and screenshot are required" });
        }

        const transaction = new Transaction({
            userId: req.user.id,
            amount: Number(amount),
            type: "deposit",
            utr,
            screenshot,
            status: "pending"
        });

        await transaction.save();

        res.status(201).json({
            message: "Payment submitted. Waiting for admin approval.",
            transaction
        });

    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.utr) {
            return res.status(400).json({ message: "A deposit with this UTR already exists." });
        }
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.getManualDeposits = async (req, res) => {
    try {
        const transactions = await Transaction.aggregate([
            { 
                $match: { 
                    type: "deposit",
                    utr: { $exists: true, $ne: null }
                } 
            },
            { $sort: { createdAt: -1 } },
            {
                $addFields: {
                    userObjId: { $toObjectId: "$userId" }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "userObjId",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userObjId: 0,
                    "userDetails.password": 0,
                    "userDetails.balance": 0
                }
            }
        ]);

        res.json(transactions);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.approveManualDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaction is not pending" });
        }

        transaction.status = "success";
        await transaction.save();

        // Increment user balance (Add Coins)
        await User.findByIdAndUpdate(
            transaction.userId,
            { $inc: { balance: Number(transaction.amount) } }
        );

        res.json({ message: "Deposit approved and coins added successfully", transaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

exports.rejectManualDeposit = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await Transaction.findById(id);

        if (!transaction) {
            return res.status(404).json({ message: "Transaction not found" });
        }

        if (transaction.status !== "pending") {
            return res.status(400).json({ message: "Transaction is not pending" });
        }

        transaction.status = "rejected";
        await transaction.save();

        res.json({ message: "Deposit rejected", transaction });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
