import mongoose from 'mongoose';

const listingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 120
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
  age: {
    years: { type: Number, min: 0, max: 50 },
   
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  location: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  images: [{
    imageUrl: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
  animalRecord: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AnimalRecord'
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'sold', 'withdrawn'],
    default: 'active'
  }
}, { timestamps: true });

listingSchema.index({ status: 1, animalType: 1, createdAt: -1 });
listingSchema.index({ seller: 1, createdAt: -1 });

export const Listing = mongoose.model('Listing', listingSchema);