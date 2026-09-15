import express from "express";

import { createBudget } from "../controllers/budgetController.js";
import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("FINANCE_MANAGER", "ORGANIZATION_ADMIN"),
  createBudget,
);

export default router;
