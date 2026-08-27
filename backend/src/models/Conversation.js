import mongoose from 'mongoose'

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    category: {
      type: String,
      enum: [
        'weather',
        'forecast',
        'alerts',
        'climate',
        'travel',
        'agriculture',
        'general'
      ],
      default: 'general'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('Conversation', conversationSchema)
