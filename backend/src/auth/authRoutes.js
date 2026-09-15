import express from "express";

import { register, login } from "./authController.js";
import {
  authenticate,
  authorizeRole
} from "./authMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);

router.get(
  "/protected",
  authenticate,
  authorizeRole("FINANCE_MANAGER"),
  (req, res) => {
    return res.status(200).json({
      message: "You are authorized",
      user: req.user
    });
  }
);

export default router;