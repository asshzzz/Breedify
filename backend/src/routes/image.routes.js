import express from "express";
import multer from 'multer';
import {
  uploadImage,
  getImagesByAnimal,
  updateProcessingStatus,
} from "../controllers/image.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Simple multer setup
const upload = multer({ storage: multer.memoryStorage() });

router.post("/upload", verifyJWT, upload.single('image'), uploadImage);
router.get("/animal/:id", verifyJWT, getImagesByAnimal);
router.put("/:id/status", verifyJWT, updateProcessingStatus);

export default router;