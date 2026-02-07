import express from "express";
import { AnimalRecord } from "../models/record.model.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Create animal record
router.post("/", verifyJWT, async (req, res) => {
  try {
    const {
      animalId,
      tagNumber,
      animalType,
      breed,
      sex,
      dateOfBirth,
      ownerName,
      ownerContact,
      center
    } = req.body;

    const record = await AnimalRecord.create({
      animalId,
      tagNumber,
      animalType,
      breed,
      sex,
      dateOfBirth,
      ownerName,
      ownerContact,
      center,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Animal record created successfully",
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating record",
      error: error.message
    });
  }
});

// Get all records
router.get("/", verifyJWT, async (req, res) => {
  try {
    const records = await AnimalRecord.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: records.length,
      data: records
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching records",
      error: error.message
    });
  }
});

// Get single record
router.get("/:id", verifyJWT, async (req, res) => {
  try {
    const record = await AnimalRecord.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found"
      });
    }

    res.status(200).json({
      success: true,
      data: record
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching record",
      error: error.message
    });
  }
});

export default router;