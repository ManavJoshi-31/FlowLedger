import express from "express";

import { createUser } from "../controllers/userController.js";

import { authenticate, authorizeRole } from "../auth/authMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorizeRole("ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"),
  createUser,
);

export default router;
