const User = require("../models/User");

module.exports = async (req, res, next) => {
    try {
        // req.user is set by authMiddleware which should be run before this
        if (!req.user || !req.user.id) {
            return res.status(401).json({ message: "Not authenticated" });
        }

        const user = await User.findById(req.user.id);
        
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Strict check for the specified admin email
        if (user.email !== "sjasdaman1234@gmail.com") {
            return res.status(403).json({ message: "Access denied. Admin only." });
        }

        next();
    } catch (error) {
        console.error("Admin middleware error:", error);
        res.status(500).json({ message: "Server error in admin authorization" });
    }
};
