import express from "express";

import {
  createDepartment,
  updateDepartment,
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
export default router;
