const express = require("express");

const cors = require("cors");

require("dotenv").config();

console.log(process.env.RAZORPAY_KEY_ID);

const connectDB = require("./config/db");

const app = express();

connectDB();

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

app.use(express.json());

app.get("/", (req, res) => {

    res.send("Backend Running");
});

app.use("/api/auth",
require("./routes/authRoutes"));

app.use("/api/payment",
require("./routes/paymentRoutes"));

app.use("/api/bet",
require("./routes/betRoutes"));

app.use("/api/transactions",
require("./routes/transactionRoutes"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(`Server running on ${PORT}`);
});