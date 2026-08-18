import express from "express";

const app = express();

const PORT = process.env.PORT || 5000;

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