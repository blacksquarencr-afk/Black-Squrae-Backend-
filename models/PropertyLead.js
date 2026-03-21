import mongoose from "mongoose";

const propertyLeadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String, required: true },
    propertyType: {
      type: String,
      enum: ["Residential", "Commercial", "Industrial"],
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
  },
  { timestamps: true }
);

export default mongoose.models.PropertyLead ||
  mongoose.model("PropertyLead", propertyLeadSchema);
