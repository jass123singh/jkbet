const Bet = require("../models/Bet");
const User = require("../models/User");

exports.placeBet =
async (req, res) => {

    try {
        const userId = req.user.id;
        const { numbers, amount } = req.body;

        const user = await User.findById(userId);
        if (!user || user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }


        let draw = [];
        
        // Dynamic force win probability based on how many numbers are selected
        let forceWinProb = 0.45;
        if (numbers.length === 3) {
            forceWinProb = 0.10; // 10% chance for 3 numbers
        } else if (numbers.length === 2) {
            forceWinProb = 0.30; // 30% chance for 2 numbers
        } else if (numbers.length === 1) {
            forceWinProb = 0.45; // 45% chance for 1 number
        }

        const forceWin = Math.random() < forceWinProb;
        
        if (forceWin) {
            draw = [...numbers]; // Start the draw with the player's numbers
        }

        while(draw.length < 3){
            const num = Math.floor(Math.random() * 9) + 1;
            if(!draw.includes(num)){
                draw.push(num);
            }
        }
        
        // Shuffle the draw array so the user's numbers aren't always first
        draw = draw.sort(() => Math.random() - 0.5);

        const matchedNumbers = numbers.filter(num => draw.includes(num));
        const matchCount = matchedNumbers.length;
        
        // User must match ALL the numbers they selected to win!
        const matched = matchCount === numbers.length;

        let multiplier = 0;

        if (matched) {
            if (numbers.length === 1) {
                multiplier = 2;
            } else if (numbers.length === 2) {
                multiplier = 4;
            } else if (numbers.length === 3) {
                multiplier = 10;
            }
        }

        const winnings = amount * multiplier;

        const bet =
        await Bet.create({
            userId,
            numbers,
            amount,
            result: matched ? "won" : "lost",
            payout: winnings,
            multiplier,
            matchCount
        });

        user.balance -= amount;
        if (winnings > 0) {
            user.balance += winnings;
        }
        await user.save();

        res.json({
            draw,
            winnings,
            bet,
            newBalance: user.balance,
            status: matched ? 'won' : 'lost',
            payout: winnings,
            drawResult: draw.join(', ')
        });

    } catch (error) {

        res.status(500).json(error);
    }
};

exports.getHistory = async (req, res) => {
    try {
        const bets = await Bet.find({ userId: req.user.id }).sort({ createdAt: -1 });
        res.json(bets);
    } catch (error) {
        res.status(500).json(error);
    }
};