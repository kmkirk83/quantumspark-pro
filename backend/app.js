const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./src/routes/auth");
const billingRoutes = require("./src/routes/billing");
const marketRoutes = require("./src/routes/market");
const webhookRoutes = require("./src/routes/webhook");

const app = express();

app.use(cors());
app.use("/webhook", webhookRoutes);
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api", billingRoutes);
app.use("/api", marketRoutes);

app.get("/", (_req, res) => {
  res.send("QuantumSpark Pro API is running...");
});

module.exports = app;
