const router =
require("express").Router();

const {

    createOrder,
    deposit,
    withdraw,
    getTransactions

} = require("../controllers/paymentController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/create-order",
createOrder);

router.post("/deposit", authMiddleware, deposit);
router.post("/withdraw", authMiddleware, withdraw);
router.get("/transactions", authMiddleware, getTransactions);

module.exports = router;