import mongoose from "mongoose";

const careerApplicationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true
    },
    mobileNo: {
      type: String,
      required: [true, "Mobile number is required"],
      trim: true,
      validate: {
        validator: function(v) {
          return /^[0-9]{10}$/.test(v);
        },
        message: props => `${props.value} is not a valid 10-digit mobile number!`
      }
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true
    },
    experienceLevel: {
      type: String,
      required: [true, "Experience level is required"],
      enum: {
        values: ["Fresher", "1-3 Years", "5 Years", "5+ Years", "3-5 Years"],
        message: "{VALUE} is not a valid experience level"
      }
    },
    comfortableWithTargets: {
      type: String,
      required: [true, "Please specify if you are comfortable with target-based incentives"],
      enum: {
        values: ["Yes", "No"],
        message: "{VALUE} is not a valid option"
      }
    },
    joiningAvailability: {
      type: String,
      required: [true, "Joining availability is required"],
      enum: {
        values: ["Immediately", "Within 15 Days", "Within 30 Days"],
        message: "{VALUE} is not a valid joining availability option"
      }
    },
    position: {
      type: String,
      default: "Client Relationship Consultant",
      trim: true
    },
    status: {
      type: String,
      enum: ["Pending", "Reviewed", "Interviewed", "Shortlisted", "Rejected", "Hired"],
      default: "Pending"
    },
    notes: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Index for faster queries
careerApplicationSchema.index({ status: 1, createdAt: -1 });
careerApplicationSchema.index({ mobileNo: 1 });
careerApplicationSchema.index({ position: 1 });

const CareerApplication = mongoose.model("CareerApplication", careerApplicationSchema);

export default CareerApplication;
