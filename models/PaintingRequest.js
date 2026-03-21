import mongoose from "mongoose";

const paintingRequestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  propertyType: { type: String, required: true },
  paintingType: { type: String, required: true },
  additionalRequirements: { type: String },
  status: {
    type: String,
    enum: ["NEW", "CONTACTED", "QUOTED", "COMPLETED", "CANCELLED"],
    default: "NEW",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("PaintingRequest", paintingRequestSchema);