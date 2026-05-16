const mongoose = require("mongoose");

const BetSchema = new mongoose.Schema({

    userId: {

        type: String,
        required: true
    },

    gameType: {
        type: String,
        default: "numberPredictor"
    },

    mode: {
        type: String
    },

    numbers: {

        type: [Number],
        default: []
    },

    amount: {

        type: Number,
        required: true
    },

    result: {
        type: String,
        default: "pending"
    },

    payout: {
        type: Number,
        default: 0
    },

    multiplier: {
        type: Number,
        default: 0
    },

    matchCount: {
        type: Number,
        default: 0
    }

}, {
    timestamps: true
});

module.exports =
mongoose.model("Bet", BetSchema);