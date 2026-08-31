import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";

const app = express();

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());

app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FlowLedger backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`FlowLedger server running on port ${PORT}`);
});