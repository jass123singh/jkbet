const Razorpay =
require("razorpay");

const razorpay =
new Razorpay({

    key_id:
    process.env.RAZORPAY_KEY_ID,

    key_secret:
    process.env.RAZORPAY_KEY_SECRET
});

exports.createOrder =
async (req, res) => {

    try {

        const options = {

            amount:
            req.body.amount * 100,

            currency: "INR"
        };

        const order =
        await razorpay.orders.create(options);

        res.json({ order, key_id: process.env.RAZORPAY_KEY_ID });

    } catch (error) {

        res.status(500).json(error);
    }
};

const User = require("../models/User");

const crypto = require("crypto");

exports.deposit = async (req, res) => {
    try {
        const { amount, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
        
        if (razorpay_order_id && razorpay_payment_id && razorpay_signature) {
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
                .update(body.toString())
                .digest("hex");

            if (expectedSignature !== razorpay_signature) {
                return res.status(400).json({ message: "Invalid payment signature" });
            }
        } else {
            return res.status(400).json({ message: "Payment verification failed: missing parameters" });
        }

        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        user.balance += Number(amount);
        await user.save();

        const Transaction = require("../models/Transaction");
        const transaction = new Transaction({
            userId: user._id,
            amount: Number(amount),
            type: "deposit",
            paymentId: razorpay_payment_id,
            status: "success"
        });
        await transaction.save();
        
        res.json({ newBalance: user.balance, message: "Deposit successful" });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.withdraw = async (req, res) => {
    try {
        const { amount } = req.body;
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: "User not found" });
        
        if (user.balance < Number(amount)) {
            return res.status(400).json({ message: "Insufficient balance" });
        }
        
        user.balance -= Number(amount);
        await user.save();
        
        const Transaction = require("../models/Transaction");
        const transaction = new Transaction({
            userId: user._id,
            amount: Number(amount),
            type: "withdraw",
            status: "success"
        });
        await transaction.save();
        
        res.json({ newBalance: user.balance, message: "Withdrawal successful" });
    } catch (error) {
        res.status(500).json(error);
    }
};

exports.getTransactions = async (req, res) => {
    try {
        const Transaction = require("../models/Transaction");
        const transactions = await Transaction.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(transactions);
    } catch (error) {
        res.status(500).json(error);
    }
};