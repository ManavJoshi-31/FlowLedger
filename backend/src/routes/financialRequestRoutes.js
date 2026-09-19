import express from "express";

import {
  createFinancialRequest,
  getPendingRequests,
} from "../controllers/financialRequestController.js";

import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("EMPLOYEE"),
  createFinancialRequest,
);

router.get(
  "/pending",
  authenticate,
  authorizeRole("DEPARTMENT_MANAGER"),
  getPendingRequests,
);

export default router;
