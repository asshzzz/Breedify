// src/routes/predict.routes.js
import express from 'express';
import multer from 'multer';
import { predictBreed } from "../controllers/predict.controller.js";

const router = express.Router();

// Configure multer for file upload
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// ✅ TEST ROUTE - Check if API is configured
router.get('/test', (req, res) => {
    res.json({
        message: 'Breed API is running!',
        apiKey: process.env.ROBOFLOW_API_KEY ? 'Configured ✅' : 'Missing ❌',
        endpoint: 'https://serverless.roboflow.com/asheer/workflows/detect-and-classify',
    });
});

// ✅ MAIN PREDICTION ROUTE
router.post('/predict', upload.single('image'), predictBreed);

export default router;