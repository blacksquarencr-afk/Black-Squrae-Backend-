import mongoose from "mongoose";

const propertyManagementRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    countryCode: { type: String, default: "+91" },
    phone: { type: String, required: true },
    city: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("PropertyManagementRequest", propertyManagementRequestSchema);