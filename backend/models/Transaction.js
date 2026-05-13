const mongoose = require("mongoose");

const TransactionSchema =
new mongoose.Schema({

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

    status: {
        type: String,
        default: "success"
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model("Transaction",
TransactionSchema);