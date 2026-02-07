import mongoose from 'mongoose';

const animalRecordSchema = new mongoose.Schema({
  // Basic Information
  animalId: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  tagNumber: {
    type: String,
    required: true,
    trim: true
  },
  animalType: {
    type: String,
    enum: ['cattle', 'buffalo'],
    required: true
  },
  breed: {
    type: String,
    required: true,
    trim: true
  },
  sex: {
    type: String,
    enum: ['male', 'female'],
    required: true
  },
  dateOfBirth: Date,
  age: {
    years: Number,
    months: Number
  },
  
  // Owner Information
  ownerName: {
    type: String,
    required: true,
    trim: true
  },
  ownerContact: String,
  ownerAddress: {
    village: String,
    district: String,
    state: String,
    pincode: String
  },
  
  // Location Information
  center: {
    type: String,
    required: true
  },
  station: String,
  
  // Images
  images: [{
    imageType: {
      type: String,
      enum: ['front', 'side', 'back', 'head', 'udder', 'other']
    },
    imageUrl: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Body Measurements (AI Extracted)
  bodyParameters: {
    bodyLength: Number,
    heartGirth: Number,
    height: Number,
    width: Number,
    neckLength: Number,
    legLength: Number,
    tailLength: Number,
    earLength: Number,
    hornLength: Number,
    
    // Additional parameters
    chestDepth: Number,
    shoulderWidth: Number,
    hipWidth: Number,
    bodyWeight: Number
  },
  
  // Classification Scores
  scores: {
    general: {
      bodyStructure: Number,
      temperament: Number,
      overall: Number
    },
    dairy: {
      udderQuality: Number,
      teats: Number,
      milkVeins: Number,
      total: Number
    },
    conformation: {
      legs: Number,
      feet: Number,
      back: Number,
      rump: Number,
      total: Number
    },
    finalScore: Number,
    grade: {
      type: String,
      enum: ['A+', 'A', 'B+', 'B', 'C+', 'C', 'D']
    }
  },
  
  // AI Analysis
  aiAnalysis: {
    confidence: Number,
    processingTime: Number,
    modelVersion: String,
    analyzedAt: Date,
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    errors: [String]
  },
  
  // Evaluation Details
  evaluation: {
    evaluatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    evaluatedAt: Date,
    remarks: String,
    verified: {
      type: Boolean,
      default: false
    }
  },
  
  // Status
  status: {
    type: String,
    enum: ['draft', 'submitted', 'evaluated', 'approved', 'rejected'],
    default: 'draft'
  },
  
  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
animalRecordSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const AnimalRecord = mongoose.model('AnimalRecord', animalRecordSchema);