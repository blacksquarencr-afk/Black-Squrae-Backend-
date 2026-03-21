import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    clientName: {
      type: String,
      required: true,
    },
    clientPhone: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "cancelled", "sold"],
      default: "pending",
    },
    priority: {
      type: String,
      enum: ["high", "medium", "low"],
      default: "medium",
    },
    assignedEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    soldAt: {
      type: Date,
    },
    soldBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
    },
    source: {
      type: String,
      enum: ["chatbot", "manual", "other"],
      default: "other",
    },
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);

export default Lead;   // ✅ IMPORTANT