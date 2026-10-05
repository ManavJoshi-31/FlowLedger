import express from "express";

import {
  createUser,
  updateUser,
  getDepartmentManagers,
} from "../controllers/userController.js";
import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

// Create user (Admin or Dept Manager)
router.post(
  "/",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  createUser,
);
router.get(
  "/department-managers",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN"),
  getDepartmentManagers,
);
router.patch(
  "/:userId",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  updateUser,
);
export default router;
