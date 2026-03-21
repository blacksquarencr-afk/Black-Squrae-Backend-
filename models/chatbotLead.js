import mongoose from "mongoose";

const chatbotLeadSchema = new mongoose.Schema(
    {
        phone: { type: String, required: true, unique: true },
        fullName: { type: String, default: "" },
        email: { type: String, default: "" },
        city: { type: String, default: "" },

        // OTP fields
        resetOtp: { type: Number },
        otpExpiry: { type: Date },
        isPhoneVerified: { type: Boolean, default: false },

        // Always chatbot
        loginProvider: { type: String, default: "chatbot" },

        lastLogin: { type: Date, default: null },
    },
    { timestamps: true }
);

export default mongoose.model("ChatbotLead", chatbotLeadSchema);
