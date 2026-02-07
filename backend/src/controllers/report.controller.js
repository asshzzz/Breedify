import { Report } from "../models/report.model.js";

// Create Report
export const createReport = async (req, res) => {
  try {
    const report = await Report.create({
      ...req.body,
      generatedBy: req.user.id,
    });
    res.status(201).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find().populate("generatedBy", "name email");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Report
export const getReportById = async (req, res) => {
  try {
    const report = await Report.findById(req.params.id).populate("generatedBy", "name email");
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Report Status (after generation)
export const updateReportStatus = async (req, res) => {
  try {
    const { status, exportedFile } = req.body;
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, exportedFile },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
