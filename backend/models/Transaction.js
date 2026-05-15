const mongoose = require("mongoose");

const TransactionSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['deposit', 'withdraw'],
        required: true
    },
    paymentId: {
        type: String
    },
    utr: {
        type: String,
        unique: true,
        sparse: true
    },
    screenshot: {
        type: String
    },
    status: {
        type: String,
        enum: ["pending", "success", "rejected"],
        default: "pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Transaction", TransactionSchema);