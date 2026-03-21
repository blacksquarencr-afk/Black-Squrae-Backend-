import User from "../models/user.js";
import ChatbotLead from "../models/chatbotLead.js";
import Lead from "../models/Lead.js";
import Counter from "../models/counterModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import dotenv from "dotenv";
import axios from "axios";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";




dotenv.config();




let otpStore = {}; // temporary in-memory OTP store

// ====================== SEND OTP ======================
export const sendPhoneOtp = async (req, res) => {
  try {
    const { phone, role, city, propertyInterest } = req.body;

    // Validation
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    // Validate role if provided
    if (role && !["user", "owner", "agent"].includes(role)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid role. Role must be 'user', 'owner' or 'agent'" });
    }

    // Validate propertyInterest if provided
    if (propertyInterest && !["rent", "sell"].includes(propertyInterest)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid property interest. Must be 'rent' or 'sell'" });
    }

    // 🔹 Generate dynamic 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);

    // 🔹 Store OTP temporarily (for both registered and unregistered users)
    otpStore[phone] = {
      otp: otp,
      expiry: new Date(Date.now() + 5 * 60 * 1000),
      role: role || "owner",
      city: city || "",
      propertyInterest: propertyInterest || "sell"
    };

    // 🔹 If user exists, also save OTP in DB for additional verification
    let existingUser = await User.findOne({ phone });
    let isRegistered = false;

    if (existingUser) {
      existingUser.resetOtp = otp;
      existingUser.otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
      await existingUser.save();
      isRegistered = true;
    }

    // 🔹 Send OTP via Renflair SMS
    let smsSuccess = false;
    let smsError = null;

    try {
      // Renflair API format: https://sms.renflair.in/V1.php?API=API_KEY&PHONE=NUMBER&OTP=CODE
      const smsUrl = `${process.env.RENFLAIR_SMS_URL}?API=${process.env.RENFLAIR_API_KEY}&PHONE=${phone}&OTP=${otp}`;

      console.log(`Attempting to send SMS to ${phone}`);
      console.log(`SMS URL: ${smsUrl.replace(process.env.RENFLAIR_API_KEY, '***KEY***')}`);

      const smsResponse = await axios.get(smsUrl, { timeout: 10000 });
      console.log(`SMS Response for ${phone}:`, smsResponse.data);

      // Check if SMS was actually sent successfully
      const responseText = typeof smsResponse.data === 'string'
        ? smsResponse.data
        : JSON.stringify(smsResponse.data);

      if (smsResponse.status === 200 && !responseText.toLowerCase().includes('failed') && !responseText.toLowerCase().includes('error')) {
        smsSuccess = true;
      }
    } catch (error) {
      smsError = error.message;
      console.error("SMS Error Details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
    }

    console.log(`OTP for ${phone}: ${otp}`); // Log for debugging

    return res.status(200).json({
      success: true,
      message: smsSuccess
        ? `OTP sent successfully to ${phone}`
        : `OTP generated but SMS failed: ${smsError || 'Unknown error'}. OTP: ${otp}`,
      smsSuccess,
      isRegistered, // Tell frontend if user is already registered
      role: role || "owner",
      city: city || "",
      propertyInterest: propertyInterest || "sell",
      ...(process.env.NODE_ENV === 'development' && { otp }) // Only in dev mode
    });
  } catch (error) {
    console.error("Send OTP Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};

// ====================== VERIFY OTP + GENERATE TOKEN ======================
export const verifyPhoneOtp = async (req, res) => {
  try {
    const { phone, otp, role, isChatbot } = req.body;

    // Validation
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    // 🔹 Verify OTP from memory store
    let storedData = otpStore[phone];
    let isOtpValid = false;

    if (storedData && storedData.otp == otp && new Date(storedData.expiry) > new Date()) {
      isOtpValid = true;
    } else {
      // 🔹 Fallback: Check if OTP is in database
      const existingUser = await User.findOne({ phone });

      if (
        existingUser &&
        existingUser.resetOtp == otp &&
        new Date(existingUser.otpExpiry) > new Date()
      ) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }


    // 🔹 Check if user exists
    let user = await User.findOne({ phone });

    if (user) {
      // 🔹 Existing user - update verification status AND user preferences
      user.isPhoneVerified = true;
      user.isOtpVerified = true;
      user.resetOtp = null;
      user.lastLogin = new Date();
      // Normal login route → always "manual" regardless of profile state
      user.loginProvider = "manual";
      
      // 🔥 Generate customUserId if not already assigned (for older users)
      if (!user.customUserId) {
        const counter = await Counter.findOneAndUpdate(
          { name: "userIdCounter" },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
        user.customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;
      }
      
      // 🔥 UPDATE: Save role, city, and propertyInterest from OTP data if provided
      if (storedData) {
        if (storedData.role && ["owner", "agent"].includes(storedData.role)) {
          user.role = storedData.role;
        }
        if (storedData.city) {
          user.city = storedData.city;
        }
        if (storedData.propertyInterest && ["rent", "sell"].includes(storedData.propertyInterest)) {
          user.propertyInterest = storedData.propertyInterest;
        }
      }
      
      await user.save();
    } else {
        
      const counter = await Counter.findOneAndUpdate(
        { name: "userIdCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;

      // 🔹 New user - create minimal user record with just phone number
      const newUserData = {
        phone: phone,
        customUserId,
        isPhoneVerified: true,
        isOtpVerified: true,
        isEmailVerified: false,
        fullName: "", // Empty - to be filled during registration
        email: "", // Empty - to be filled during registration
        city: "", // Empty - to be filled during registration
        role: (storedData?.role && ["owner", "agent"].includes(storedData.role)) ? storedData.role : "owner",
        loginProvider: "manual", // Created via normal login route
      };
      
      // 🔥 ADD: Include city and propertyInterest from OTP data if available
      if (storedData) {
        if (storedData.city) {
          newUserData.city = storedData.city;
        }
        if (storedData.propertyInterest && ["rent", "sell"].includes(storedData.propertyInterest)) {
          newUserData.propertyInterest = storedData.propertyInterest;
        }
      }
      
      user = await User.create(newUserData);
    }

    // 🔹 Check if user has completed registration (has required fields)
    const hasCompletedRegistration = !!(user.fullName && user.email && user.city);

    // 🔹 OTP verified → remove it from memory
    delete otpStore[phone];

    // 🔹 Generate JWT Token
    const token = jwt.sign(
      { id: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // 🔹 Return success response
    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token,
      isRegistered: hasCompletedRegistration,
      user: {
        _id: user._id,
        fullName: user.fullName || null,
        customUserId: user.customUserId || null,
        email: user.email || null,
        phone: user.phone,
        city: user.city || null,
        role: user.role,
        needsRegistration: !hasCompletedRegistration
      },
    });
  } catch (error) {
    console.error("Verify OTP Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying OTP" });
  }
};


// ====================== SEND CHATBOT OTP ======================
export const sendChatbotOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Phone number is required" });
    }

    // Extract only last 10 digits
    const cleanedPhone = phone.replace(/\D/g, "");
    const normalizedPhone = cleanedPhone.slice(-10);

    // 🔹 Generate dynamic 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000);
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

    // 🔹 Store OTP in memory (fast lookup)
    otpStore[normalizedPhone] = { otp, expiry: otpExpiry };

    // 🔹 Also save/update OTP in ChatbotLead collection (persistent fallback)
    await ChatbotLead.findOneAndUpdate(
      { phone: normalizedPhone },
      { resetOtp: otp, otpExpiry },
      { upsert: true, new: true }
    );

    // 🔹 Send OTP via Renflair SMS
    let smsSuccess = false;
    let smsError = null;

    try {
      const smsUrl = `${process.env.RENFLAIR_SMS_URL}?API=${process.env.RENFLAIR_API_KEY}&PHONE=${normalizedPhone}&OTP=${otp}`;
      const smsResponse = await axios.get(smsUrl, { timeout: 10000 });

      const responseText = typeof smsResponse.data === 'string'
        ? smsResponse.data
        : JSON.stringify(smsResponse.data);

      if (smsResponse.status === 200 && !responseText.toLowerCase().includes('failed') && !responseText.toLowerCase().includes('error')) {
        smsSuccess = true;
      } else {
        smsError = responseText;
      }
    } catch (error) {
      smsError = error.response?.data || error.message;
      console.error("Chatbot SMS Error:", smsError);
    }

    return res.status(200).json({
      success: true,
      message: smsSuccess
        ? `OTP sent successfully to ${normalizedPhone}`
        : `OTP generated but SMS failed: ${smsError || 'Unknown error'}. OTP: ${otp}`,
      smsSuccess,
      ...(process.env.NODE_ENV === 'development' && { otp })
    });
  } catch (error) {
    console.error("Send Chatbot OTP Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Failed to send OTP" });
  }
};


// ====================== VERIFY CHATBOT OTP ======================
export const verifyChatbotOtp = async (req, res) => {
  try {
    const { phone, otp, clientName } = req.body;

    // Validation
    if (!phone || !otp) {
      return res
        .status(400)
        .json({ success: false, message: "Phone and OTP are required" });
    }

    // 🔥 Extract only last 10 digits
    const cleanedPhone = phone.replace(/\D/g, "");
    const normalizedPhone = cleanedPhone.slice(-10);

    // 🔹 Step 1: Check memory store
    let isOtpValid = false;
    const storedData = otpStore[normalizedPhone] || otpStore[phone];

    if (storedData && storedData.otp == otp && new Date(storedData.expiry) > new Date()) {
      isOtpValid = true;
    } else {
      // 🔹 Step 2: Fallback - check ChatbotLead temp collection
      const chatbotRecord = await ChatbotLead.findOne({ phone: normalizedPhone }) ||
        await ChatbotLead.findOne({ phone });

      if (
        chatbotRecord &&
        chatbotRecord.resetOtp == otp &&
        new Date(chatbotRecord.otpExpiry) > new Date()
      ) {
        isOtpValid = true;
      }
    }

    if (!isOtpValid) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or expired OTP" });
    }

    // 🔹 OTP Valid - Create Lead in leads collection (if not already exists)
    let lead = await Lead.findOne({ clientPhone: normalizedPhone });

    if (!lead) {
      lead = await Lead.create({
        clientName: clientName || "Chatbot Visitor",
        clientPhone: normalizedPhone,
        status: "pending",
        priority: "medium",
        source: "chatbot",
      });
      console.log(`✅ New lead created for chatbot user: ${normalizedPhone}`);

      // Auto-assign to Team Leader using Round Robin
      const assignment = await autoAssignToTeamLeader(
        lead._id,
        'Lead',
        'medium',
        'Auto-assigned to Team Leader via Round Robin (Chatbot)'
      );

      if (assignment) {
        lead.assignedEmployee = assignment.employeeId;
        await lead.save();
        console.log(`✅ Chatbot Lead ${lead._id} assigned to Team Leader`);
      }
    } else {
      console.log(`ℹ️ Lead already exists for: ${normalizedPhone}`);
    }

    // 🔹 Delete temporary ChatbotLead OTP record (no longer needed)
    await ChatbotLead.deleteOne({ phone: normalizedPhone });
    await ChatbotLead.deleteOne({ phone });

    // 🔹 Clear from memory store
    delete otpStore[normalizedPhone];
    delete otpStore[phone];

    // 🔹 Generate JWT Token
    const token = jwt.sign(
      { id: lead._id, phone: normalizedPhone, source: "chatbot" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully. Lead captured.",
      token,
      lead: {
        _id: lead._id,
        clientPhone: lead.clientPhone,
        clientName: lead.clientName,
        status: lead.status,
        loginProvider: "chatbot",
      },
    });
  } catch (error) {
    console.error("Verify Chatbot OTP Error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: "Error verifying OTP" });
  }
};


// ====================== COMPLETE REGISTRATION ======================
// This endpoint completes the registration for users who only verified phone
export const completeRegistration = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { fullName, email, city, role, propertyInterest } = req.body;

    // Validation for required fields
    if (!fullName || !email || !city || !role) {
      return res.status(400).json({
        success: false,
        message: "Full Name, Email, City, and Role are required"
      });
    }

    // Validate role
    if (!["user", "owner", "agent"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role. Role must be 'user', 'owner' or 'agent'"
      });
    }

    // Validate propertyInterest if provided
    if (propertyInterest && !["rent", "sell"].includes(propertyInterest)) {
      return res.status(400).json({
        success: false,
        message: "Invalid property interest. Must be 'rent' or 'sell'"
      });
    }

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Find user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Check if email is already taken by another user
    const emailExists = await User.findOne({ email, _id: { $ne: userId } });
    if (emailExists) {
      return res.status(400).json({
        success: false,
        message: "Email already in use"
      });
    }

    // Update user with registration details
    user.fullName = fullName;
    user.email = email;
    user.city = city;
    user.role = role;
    user.isEmailVerified = true;
    user.loginProvider = "manual"; // Once registration is complete, they are marked as manual
    
    // 🔥 UPDATE: Save propertyInterest if provided
    if (propertyInterest) {
      user.propertyInterest = propertyInterest;
    }

    await user.save();

    return res.status(200).json({
      success: true,
      message: "Registration completed successfully",
      user: {
        _id: user._id,
        customUserId: user.customUserId || null,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        city: user.city,
        role: user.role,
        propertyInterest: user.propertyInterest,
      },
    });
  } catch (error) {
    console.error("Complete Registration Error:", error);
    return res.status(500).json({ success: false, message: "Registration failed" });
  }
};

//  Legacy Signup (keep for backward compatibility)
export const signup = async (req, res) => {
  try {
    const { fullName, email, phone, state, city, street, pinCode, password } =
      req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      fullName,
      email,
      phone,
      state,
      city,
      street,
      pinCode,
      password: hashedPassword,
      isEmailVerified: true, //  after OTP flow
      isPhoneVerified: true,
    });
    
    if (!newUser.customUserId) {
      const counter = await Counter.findOneAndUpdate(
        { name: "userIdCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      newUser.customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;
    }

    const savedUser = await newUser.save();

    console.log("Saved user:", savedUser);
    res.json({ success: true, user: newUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// LOGIN CONTROLLER
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1 Check if email and password provided
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 2 Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3 Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 4 Update last login date
    user.lastLogin = new Date();

    // Generate customUserId if not already assigned
    if (!user.customUserId) {
      const counter = await Counter.findOneAndUpdate(
        { name: "userIdCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      user.customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;
    }

    await user.save();

    // 5 Generate JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "24h" }
    );

    // 6 Send response
    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        customUserId: user.customUserId || null,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        date: user.createdAt, // user registration date
        lastLogin: user.lastLogin, // recently added
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};


// google auth
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ success: false, message: "Token missing" });
    }

    //  Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    //  Check if user already exists
    let user = await User.findOne({ email });

    if (!user) {
       const counter = await Counter.findOneAndUpdate(
        { name: "userIdCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      const customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;
      // Create new user
      user = await User.create({
        name,
        email,
        googleId: sub,
        customUserId,
      });
    } else if (!user.customUserId) {
      // Assign customUserId to existing Google users who don't have one
      const counter = await Counter.findOneAndUpdate(
        { name: "userIdCounter" },
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      user.customUserId = `USR-${String(counter.seq).padStart(4, "0")}`;
      await user.save();
    }

    // Generate JWT token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.status(200).json({
      success: true,
      message: "Google login successful",
      user: {
        name: user.name,
        email: user.email,
      },
      token,
    });
  } catch (error) {
    console.error("Google Login Error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid Google token",
      error: error.message,
    });
  }
};
