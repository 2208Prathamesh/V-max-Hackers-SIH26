import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: true
    },

    sender: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },

    content: {
      type: String,
      required: true,
      trim: true
    },

    messageType: {
      type: String,
      enum: ['text', 'weather', 'forecast', 'alert', 'climate', 'advisory'],
      default: 'text'
    },

    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: {
      createdAt: true,
      updatedAt: false
    }
  }
)

export default mongoose.model('Message', messageSchema)
