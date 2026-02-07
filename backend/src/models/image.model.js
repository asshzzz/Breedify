import mongoose from 'mongoose';
const imageUploadSchema = new mongoose.Schema({
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnimalRecord',
    required: true
  },
  imageType: {
    type: String,
    enum: ['front', 'side', 'back', 'head', 'udder', 'other'],
    required: true
  },
  originalName: String,
  fileName: String,
  fileSize: Number,
  mimeType: String,
  imageUrl: String,
  thumbnailUrl: String,
  
  // Image metadata
  dimensions: {
    width: Number,
    height: Number
  },
  
  // Processing status
  processed: {
    type: Boolean,
    default: false
  },
  processingStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  
  // AI extracted data
  extractedData: {
    parameters: mongoose.Schema.Types.Mixed,
    confidence: Number
  },
  
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

export const ImageUpload = mongoose.model('ImageUpload', imageUploadSchema);