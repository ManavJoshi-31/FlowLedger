import express from "express";

import {
  createDepartment,
  updateDepartment,
  getDepartments,
} from "../controllers/departmentController.js";
import { authenticate, authorizeRole } from "../auth/authMiddleware.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN"),
  createDepartment,
);
router.patch(
  "/:departmentId",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN"),
  updateDepartment,
);
router.get(
  "/",
  authenticate,
  authorizeRole("FINANCE_MANAGER", "ORGANIZATION_ADMIN"),
  getDepartments,
);
export default router;
