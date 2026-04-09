require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const connectDB = require("./db");

const app = express();
connectDB();

app.use(bodyParser.json());

app.use("/webhook", require("./routes/webhook"));

app.get("/", (req, res) => res.send("Bot Running"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
