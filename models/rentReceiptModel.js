import mongoose from "mongoose";

const rentReceiptSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    mobileNumber: { type: String, required: true },

    propertyAddress: { type: String, required: true },
    landlordName: { type: String, required: true },
    tenantName: { type: String, required: true },

    monthlyRent: { type: Number, required: true },

    receiptType: {
      type: String,
      enum: ["monthly", "quarterly", "yearly"],
      default: "monthly"
    },

    paymentMonth: { type: String, required: true },
    paymentYear: { type: Number, required: true },

    notes: { type: String, default: "" },

    pdfUrl: { type: String },

    status: {
      type: String,
      enum: ["generated", "emailed"],
      default: "generated"
    },

    // Assignment fields
    assignedToEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium"
    }
  },
  { timestamps: true }
);

const RentReceipt = mongoose.model("RentReceipt", rentReceiptSchema);

export default RentReceipt;