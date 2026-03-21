import mongoose from "mongoose";

const chatbotQASchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
      trim: true,
    },
    answer: {
      type: String,
      required: true,
      trim: true,
    },
    // Keywords for better matching
    keywords: {
      type: [String],
      default: [],
    },
    // Category for organization
    category: {
      type: String,
      default: "general",
      trim: true,
    },
    // Priority for displaying most relevant answers first
    priority: {
      type: Number,
      default: 0,
    },
    // Track usage
    usageCount: {
      type: Number,
      default: 0,
    },
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    // Track who created/updated
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'createdByType',
    },
    createdByType: {
      type: String,
      enum: ['Admin', 'Employee'],
    },
  },
  { timestamps: true }
);

// Index for text search
chatbotQASchema.index({ question: 'text', keywords: 'text', answer: 'text' });

// Pre-save hook to extract keywords from question
chatbotQASchema.pre('save', function(next) {
  if (this.isModified('question') && this.keywords.length === 0) {
    // Auto-generate keywords from question (remove common words)
    const commonWords = ['what', 'when', 'where', 'who', 'how', 'is', 'are', 'the', 'a', 'an', 'do', 'does', 'can', 'will', 'would'];
    const words = this.question.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !commonWords.includes(word));
    
    this.keywords = [...new Set(words)]; // Remove duplicates
  }
  next();
});

export default mongoose.model("ChatbotQA", chatbotQASchema);
