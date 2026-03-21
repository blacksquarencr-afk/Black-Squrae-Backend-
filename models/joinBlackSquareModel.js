import mongoose from "mongoose";

const joinBlackSquareSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    mobileNo: {
      type: String,
      required: true
    },

    location: {
      type: String,
      required: true
    },

    experienceLevel: {
      type: String,
      enum: [
        "Fresher",
        "0-1 Years",
        "1-3 Years",
        "3-5 Years",
        "5+ Years"
      ],
      required: true
    },

    targetIncentivesComfortable: {
      type: String,
      enum: ["Yes", "No"],
      required: true
    },

    joiningTimeline: {
      type: String,
      enum: [
        "Immediately",
        "Within 15 Days",
        "Within 1 Month",
        "1-3 Months"
      ],
      required: true
    },

    status: {
      type: String,
      enum: ["new", "contacted", "selected", "rejected"],
      default: "new"
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    }
  },
  { timestamps: true }
);

joinBlackSquareSchema.index({ mobileNo: 1 });
joinBlackSquareSchema.index({ createdAt: -1 });

const JoinBlackSquare = mongoose.model(
  "JoinBlackSquare",
  joinBlackSquareSchema
);

export default JoinBlackSquare;