import express from "express";

import { createDepartment } from "../controllers/departmentController.js";

const router = express.Router();

router.post("/", createDepartment);

export default router;