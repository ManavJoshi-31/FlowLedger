import express from "express";

import {
  createFinancialRequest,
  getPendingRequests,
  approveFinancialRequest,
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

router.patch(
  "/:requestId/approve",
  authenticate,
  authorizeRole("DEPARTMENT_MANAGER"),
  approveFinancialRequest,
);
export default router;
