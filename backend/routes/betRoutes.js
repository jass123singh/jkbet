const router = require("express").Router();
const auth = require("../middleware/authMiddleware");
const { placeBet, getHistory, placePlinkoBet } = require("../controllers/betController");

router.post("/place", auth, placeBet);
router.post("/plinko", auth, placePlinkoBet);
router.get("/history", auth, getHistory);

module.exports = router;