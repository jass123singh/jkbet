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

        while(draw.length < numbers.length){
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

        const netBalanceChange = winnings > 0 ? winnings - amount : -amount;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: netBalanceChange } },
            { new: true }
        );

        res.json({
            draw,
            winnings,
            bet,
            newBalance: updatedUser.balance,
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

exports.placePlinkoBet = async (req, res) => {
    try {
        const userId = req.user.id;
        const { amount, mode } = req.body; // mode: 'easy', 'medium', 'hard', 'expert'

        const user = await User.findById(userId);
        if (!user || user.balance < amount) {
            return res.status(400).json({ message: "Insufficient balance" });
        }

        const validModes = ['easy', 'medium', 'hard', 'expert'];
        if (!validModes.includes(mode)) {
            return res.status(400).json({ message: "Invalid mode" });
        }

        const multipliers = {
            easy:   [2, 1.5, 1.2, 1.1, 1, 0.8, 0.5, 0.8, 1, 1.1, 1.2, 1.5, 2],
            medium: [4, 2, 1.5, 1.2, 0.8, 0.4, 0.2, 0.4, 0.8, 1.2, 1.5, 2, 4],
            hard:   [10, 5, 2, 1.2, 0.5, 0.2, 0.2, 0.2, 0.5, 1.2, 2, 5, 10],
            expert: [29, 8, 3, 1, 0.2, 0.2, 0.2, 0.2, 0.2, 1, 3, 8, 29]
        };

        const currentMultipliers = multipliers[mode];
        const rows = 12;
        
        // Plinko math: 12 rows, chance to go left (0) or right (1) at each pin
        // We'll generate an array of paths for the frontend to animate!
        let position = 0; // starts at 0 right-moves
        const path = [];
        
        for (let i = 0; i < rows; i++) {
            const goesRight = Math.random() > 0.5 ? 1 : 0;
            position += goesRight;
            path.push(goesRight);
        }

        // position is now between 0 and 12
        const multiplier = currentMultipliers[position];
        const winnings = amount * multiplier;
        const won = winnings > amount; // Consider it a win if we get more than our bet

        const bet = await Bet.create({
            userId,
            amount,
            gameType: 'plinko',
            mode,
            result: won ? "won" : "lost",
            payout: winnings,
            multiplier,
            matchCount: position // store the resulting bucket index here for reference
        });

        const netBalanceChange = winnings - amount;
        
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $inc: { balance: netBalanceChange } },
            { new: true }
        );

        res.json({
            path,
            bucketIndex: position,
            multiplier,
            winnings,
            bet,
            newBalance: updatedUser.balance,
            status: won ? 'won' : 'lost'
        });

    } catch (error) {
        res.status(500).json({ error: error.message || error });
    }
};