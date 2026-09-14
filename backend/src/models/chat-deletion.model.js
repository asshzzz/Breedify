import mongoose from 'mongoose';

const chatDeletionSchema = new mongoose.Schema({
  listing: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, { timestamps: true });

chatDeletionSchema.index({ listing: 1, user: 1 }, { unique: true });

export const ChatDeletion = mongoose.model('ChatDeletion', chatDeletionSchema);
