import mongoose from 'mongoose';
const settingsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  
  // System Settings
  systemSettings: {
    language: {
      type: String,
      default: 'en'
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata'
    },
    dateFormat: {
      type: String,
      default: 'DD/MM/YYYY'
    }
  },
  
  // Notification Settings
  notifications: {
    email: {
      enabled: {
        type: Boolean,
        default: true
      },
      newEvaluation: Boolean,
      reportGenerated: Boolean,
      statusUpdate: Boolean
    },
    sms: {
      enabled: {
        type: Boolean,
        default: false
      },
      criticalAlerts: Boolean
    },
    inApp: {
      enabled: {
        type: Boolean,
        default: true
      }
    }
  },
  
  
  // Display Settings
  displaySettings: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'auto'],
      default: 'light'
    },
    compactMode: {
      type: Boolean,
      default: false
    },
    itemsPerPage: {
      type: Number,
      default: 20
    }
  },
  
  // Default Values
  defaults: {
    center: String,
    animalType: String,
    breed: String
  },
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

settingsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

export const Settings = mongoose.model('Settings', settingsSchema);