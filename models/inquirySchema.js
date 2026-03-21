import mongoose from "mongoose";

const inquirySchema = new mongoose.Schema(
  {
    //  Existing Fields
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      required: true,
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
      default: null
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    contactNumber: {
      type: String,
      required: true,
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
    assignmentStatus: {
      type: String,
      enum: ["unassigned", "assigned", "in-progress", "completed", "closed"],
      default: "unassigned"
    }
  },
  { timestamps: true }
);

export default mongoose.model("Inquiry", inquirySchema);
