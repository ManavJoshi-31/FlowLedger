import express from "express";

import { createFinancialRequest } from "../controllers/financialRequestController.js";
import { authenticate, authorizeRole } from "../auth/authMiddleware.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("EMPLOYEE"),
  createFinancialRequest,
);

export default router;
