import "dotenv/config";
import express from "express";
import connectDB from "./config/db.js";
//import routes
import authRoutes from "./auth/authRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import departmentRoutes from "./routes/departmentRoutes.js";
const app = express();

const PORT = process.env.PORT || 5000;

connectDB();
app.use(express.json());
//use for routing to authRoutes
app.use("/api/auth", authRoutes);
app.use("/api/organizations", organizationRoutes);
app.use("/api/departments", departmentRoutes);
app.get("/api/test", (req, res) => {
  res.status(200).json({
    success: true,
    message: "FlowLedger backend is running"
  });
});

app.listen(PORT, () => {
  console.log(`FlowLedger server running on port ${PORT}`);
});


