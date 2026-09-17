import express from "express";

import { createUser, updateUser } from "../controllers/userController.js";

import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

// Create user (Admin or Dept Manager)
router.post(
  "/",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  createUser,
);
router.patch(
  "/:userId",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  updateUser,
);
export default router;
