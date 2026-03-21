// models/ServiceRequest.js
import mongoose from "mongoose";

const serviceRequestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true },
    countryCode: { type: String, default: "+91" },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    status: { type: String, enum: ["NEW", "CONTACTED", "CLOSED"], default: "NEW" },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
  },
  { timestamps: true }
);

// ✅ Export default for ES Module
export default mongoose.model("ServiceRequest", serviceRequestSchema);