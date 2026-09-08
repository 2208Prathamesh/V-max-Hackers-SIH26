import mongoose from 'mongoose';

const newsArticleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    summary: {
      type: String,
      trim: true,
      default: ''
    },
    content: {
      type: String,
      default: ''
    },
    url: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    scope: {
      type: String,
      enum: ['india', 'global'],
      required: true,
      index: true
    },
    category: {
      type: String,
      enum: ['monsoon', 'cyclone', 'heatwave', 'climate', 'agriculture'],
      default: 'climate',
      index: true
    },
    impactLevel: {
      type: String,
      enum: ['Low', 'Moderate', 'High', 'Severe'],
      default: 'Moderate'
    },
    isBreaking: {
      type: Boolean,
      default: false
    },
    location: {
      type: String,
      default: 'Regional'
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1000&q=80'
    },
    source: {
      name: { type: String, default: 'Meteorological Wire' },
      code: { type: String, default: 'WIRE' },
      url: { type: String, default: '' },
      type: { type: String, default: 'news_media' },
      verified: { type: Boolean, default: true }
    },
    tags: [{ type: String, trim: true }],
    publishedAt: {
      type: Date,
      required: true,
      index: true
    }
  },
  {
    timestamps: true
  }
);

// Compound index for fast filtered sorting
newsArticleSchema.index({ scope: 1, category: 1, publishedAt: -1 });

export default mongoose.model('NewsArticle', newsArticleSchema);
