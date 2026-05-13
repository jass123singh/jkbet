const User = require("../models/User");

exports.createOrder = async (req, res) => {

    try {

        res.json({

            message: "Payment temporarily disabled"

        });

    } catch (error) {

        res.status(500).json(error);
    }
};

exports.deposit = async (req, res) => {

    try {

        const { amount } = req.body;

        const user =
        await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                message: "User not found"
            });
        }

        user.balance += Number(amount);

        await user.save();

        res.json({

            newBalance: user.balance,

            message: "Deposit successful"
        });

    } catch (error) {

        res.status(500).json(error);
    }
};

exports.withdraw = async (req, res) => {

    try {

        const { amount } = req.body;

        const user =
        await User.findById(req.user.id);

        if (!user) {

            return res.status(404).json({

                message: "User not found"
            });
        }

        if (user.balance < Number(amount)) {

            return res.status(400).json({

                message: "Insufficient balance"
            });
        }

        user.balance -= Number(amount);

        await user.save();

        res.json({

            newBalance: user.balance,

            message: "Withdrawal successful"
        });

    } catch (error) {

        res.status(500).json(error);
    }
};

exports.getTransactions = async (req, res) => {

    try {

        const Transaction =
        require("../models/Transaction");

        const transactions =
        await Transaction.find({

            userId: req.user.id

        }).sort({ createdAt: -1 });

        res.json(transactions);

    } catch (error) {

        res.status(500).json(error);
    }
};