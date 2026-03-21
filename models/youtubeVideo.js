import mongoose from "mongoose";

const youtubeVideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    videoLink: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function(v) {
          // Validate YouTube URL format
          return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/.test(v);
        },
        message: 'Invalid YouTube URL format'
      }
    },
    // Extract video ID from URL for easier embedding
    videoId: {
      type: String,
      trim: true,
    },
    // Track who uploaded (admin or employee)
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'uploaderType',
    },
    uploaderType: {
      type: String,
      enum: ['Admin', 'Employee'],
    },
    // Optional: Status for visibility control
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Pre-save hook to extract video ID from YouTube URL
youtubeVideoSchema.pre('save', function(next) {
  if (this.videoLink) {
    // Extract video ID from various YouTube URL formats
    let videoId = null;
    
    // Format: https://www.youtube.com/watch?v=VIDEO_ID
    const match1 = this.videoLink.match(/[?&]v=([^&]+)/);
    if (match1) {
      videoId = match1[1];
    }
    
    // Format: https://youtu.be/VIDEO_ID
    const match2 = this.videoLink.match(/youtu\.be\/([^?]+)/);
    if (match2) {
      videoId = match2[1];
    }
    
    // Format: https://www.youtube.com/embed/VIDEO_ID
    const match3 = this.videoLink.match(/youtube\.com\/embed\/([^?]+)/);
    if (match3) {
      videoId = match3[1];
    }
    
    if (videoId) {
      this.videoId = videoId;
    }
  }
  next();
});

export default mongoose.model("YoutubeVideo", youtubeVideoSchema);
