const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { placeBet, getHistory } = require("../controllers/betController");

router.post("/place", auth, placeBet);
router.get("/history", auth, getHistory);

module.exports = router;