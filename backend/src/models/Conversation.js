import mongoose from 'mongoose';
import { CONVERSATION_CATEGORIES } from '../config/constants.js';

/**
 * WeatherGPT Conversation Schema
 */
const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
      default: 'New Conversation'
    },

    category: {
      type: String,
      enum: CONVERSATION_CATEGORIES,
      default: 'general'
    }
  },
  {
    timestamps: true
  }
);

conversationSchema.index({ userId: 1, updatedAt: -1 });

const Conversation = mongoose.model('Conversation', conversationSchema);

export default Conversation;
