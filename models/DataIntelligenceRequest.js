import mongoose from "mongoose";

const dataIntelligenceSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address"],
    },
    phone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
      minlength: [10, "Phone must be at least 10 digits"],
    },
    organizationName: {
      type: String,
      required: [true, "Organization name is required"],
      trim: true,
    },
    projectType: {
      type: String,
      required: [true, "Project type is required"],
      enum: [
        "Residential Development",
        "Commercial Development",
        "Mixed-use Project",
        "Investment Analysis",
        "Portfolio Management",
        "Consulting Services",
        "Other",
      ],
    },
    targetLocation: {
      type: String,
      required: [true, "Target location is required"],
      trim: true,
    },
    dataRequirement: {
      type: String,
      required: [true, "Data requirement is required"],
      enum: [
        "Market Trends & Analysis",
        "Pricing Data & Insights",
        "Demand-Supply Analytics",
        "Location Intelligence",
        "Predictive Analytics",
        "Custom Research Report",
        "API Integration",
        "Full Data Intelligence Suit",
        "Other",
      ],
    },
    additionalDetails: {        // ✅ New optional field
      type: String,
      trim: true,
      maxlength: [2000, "Additional details cannot exceed 2000 characters"],
      default: "",
    },
    status: {
      type: String,
      enum: ["NEW", "CONTACTED", "IN_PROGRESS", "COMPLETED", "CANCELLED"],
      default: "NEW",
    },
  },
  { timestamps: true }
);

export default mongoose.model("DataIntelligenceRequest", dataIntelligenceSchema);