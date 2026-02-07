import mongoose from 'mongoose';
const reportSchema = new mongoose.Schema({
  reportType: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'yearly', 'custom'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  
  // Date range
  dateRange: {
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    }
  },
  
  // Filters
  filters: {
    center: [String],
    animalType: [String],
    breed: [String],
    evaluator: [mongoose.Schema.Types.ObjectId]
  },
  
  // Statistics
  statistics: {
    totalAnimals: Number,
    totalEvaluations: Number,
    averageScore: Number,
    gradeDistribution: {
      aPlus: Number,
      a: Number,
      bPlus: Number,
      b: Number,
      cPlus: Number,
      c: Number,
      d: Number
    },
    animalTypeBreakdown: {
      cattle: Number,
      buffalo: Number
    }
  },
  
  // Chart data
  chartData: mongoose.Schema.Types.Mixed,
  
  // File info (if exported)
  exportedFile: {
    fileName: String,
    fileUrl: String,
    format: {
      type: String,
      enum: ['pdf', 'excel', 'csv']
    },
    generatedAt: Date
  },
  
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },
  
  status: {
    type: String,
    enum: ['generating', 'completed', 'failed'],
    default: 'generating'
  }
});

export const Report = mongoose.model('Report', reportSchema);
