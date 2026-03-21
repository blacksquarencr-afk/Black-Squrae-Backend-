import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, default: "" }, // Made optional for OTP-only users
    email: { type: String, default: "", sparse: true }, // Made optional, sparse allows multiple empty strings
    phone: { type: String, required: true, unique: true },
    state: String,
    city: String,
    street: String,
    pinCode: String,
    password: { type: String }, // Made optional for OTP-only users

    //  Avatar field (already present)
    avatar: {
      type: String,
      default: "https://abc.ridealmobility.com/uploads/default-avatar.jpg",
    },

    photosAndVideo: {
      type: [String],
      default: [],
    },

    lastLogin: { type: Date, default: null },

    //  Date of Birth
    dob: { type: Date, default: null },

    //  Language Preferences (array of strings)
    languagePreferences: {
      type: [String],
      default: [],
    },

    //  Employment Details
    employmentDetails: {
      employmentType: { type: String, default: "" },
      designation: { type: String, default: "" },
      companyName: { type: String, default: "" },
      income: { type: String, default: "" },
    },

    //  Property Requirement
    propertyRequirement: {
      purchasingFor: { type: String, default: "" },
      investmentAmount: { type: String, default: "" },
    },

    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },

    resetOtp: { type: Number },
    otpExpiry: { type: Date },
    isOtpVerified: { type: Boolean, default: false },
    //  Device FCM Token for push notifications
    fcmToken: { type: String, default: "" },

    //  Google Auth fields (newly added)
    googleId: { type: String, default: null },
    loginProvider: {
      type: String,
      enum: ["manual", "google", "chatbot"],
      default: "manual",
    },

    //  User Role
    role: {
      type: String,
      enum: ["owner", "agent"],
      default: "owner",
    },

    //  Property Interest (for rent or sell)
    propertyInterest: {
      type: String,
      enum: ["rent", "sell"],
      default: "sell",
    },

    // ⭐ User Property Listing Tracking
    serialId: { type: Number }, // Unique serial ID for generating property IDs
    myListingsCount: { type: Number, default: 0 }, // Count of properties listed by user
    shortlistedCount: { type: Number, default: 0 }, // Count of shortlisted properties
    enquiriesCount: { type: Number, default: 0 }, // Count of enquiries made
  },
  { timestamps: true }
);

//  Pre-save hook for avatar
userSchema.pre("save", function (next) {
  if (
    this.avatar &&
    this.avatar !== "https://abc.ridealmobility.com/uploads/default-avatar.jpg"
  ) {
    return next();
  }

  if (this.photosAndVideo.length > 0) {
    this.avatar = this.photosAndVideo[0];
  } else {
    this.avatar = "https://abc.ridealmobility.com/uploads/default-avatar.jpg";
  }

  next();
});

export default mongoose.models.User || mongoose.model("User", userSchema);

