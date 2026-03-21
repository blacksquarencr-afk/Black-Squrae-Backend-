import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    property: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
      index: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    photos: {
      type: [String],
      default: [],
    },
    // Aspects of the property
    aspects: {
      location: { type: Number, min: 1, max: 5 },
      amenities: { type: Number, min: 1, max: 5 },
      valueForMoney: { type: Number, min: 1, max: 5 },
      connectivity: { type: Number, min: 1, max: 5 },
    },
    // Review status
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve by default, can be changed
    },
    // Helpful count (other users can mark review as helpful)
    helpfulCount: {
      type: Number,
      default: 0,
    },
    helpfulBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Admin/Employee response
    response: {
      text: { type: String },
      respondBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
      respondedAt: { type: Date },
    },
  },
  { timestamps: true }
);

// Compound index to ensure a user can only review a property once
reviewSchema.index({ property: 1, user: 1 }, { unique: true });

// Virtual for formatted rating
reviewSchema.virtual("ratingDisplay").get(function () {
  return this.rating.toFixed(1);
});

export default mongoose.model("Review", reviewSchema);
