import express from "express";
import {
  createBudget,
  getBudgetById,
  getBudgets,
} from "../controllers/budgetController.js";
import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("FINANCE_MANAGER", "ORGANIZATION_ADMIN"),
  createBudget,
);
router.get(
  "/",
  authenticate,
  authorizeRole("FINANCE_MANAGER", "ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  getBudgets,
);
router.get(
  "/:budgetId",
  authenticate,
  authorizeRole("FINANCE_MANAGER", "ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  getBudgetById,
);
export default router;
