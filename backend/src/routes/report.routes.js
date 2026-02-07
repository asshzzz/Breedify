import express from "express";
import {
  createReport,
  getReports,
  getReportById,
  updateReportStatus,
} from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", verifyJWT, createReport);
router.get("/", verifyJWT, getReports);
router.get("/:id", verifyJWT, getReportById);
router.put("/:id/status", verifyJWT, updateReportStatus);

export default router;
