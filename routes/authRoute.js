import express from "express";
import {
    sendPhoneOtp,
    verifyPhoneOtp,
    signup,
    loginUser,
    googleLogin,
    completeRegistration,
    sendChatbotOtp,
    verifyChatbotOtp
} from "../controllers/authControlllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/send-phone-otp", sendPhoneOtp);
router.post("/verify-phone-otp", verifyPhoneOtp);

// Chatbot-specific OTP routes
router.post("/chatbot/send-otp", sendChatbotOtp);
router.post("/chatbot/verify-otp", verifyChatbotOtp);

router.post("/complete-registration", verifyToken, completeRegistration); // New route
router.post("/signup", signup);
router.post("/login", loginUser);
router.post("/google-login", googleLogin);

export default router;
