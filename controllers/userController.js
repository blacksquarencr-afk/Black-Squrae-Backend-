import User from "../models/user.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import SavedProperty from "../models/saveProperty.js";
import Property from "../models/addProps.js";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import admin from "../config/firebase.js";
import UserLeadAssignment from "../models/userLeadAssignmentSchema.js";

dotenv.config();


// ==========================
// Get all users
// ==========================
// export const getAllUsers = async (req, res) => {
//   try {
//     const users = await User.find().select("-password"); // exclude password
//     const count = await User.countDocuments();
//     if (users.length === 0) {
//       return res.status(404).json({ success: false, message: "No users found" });
//     }
//     res.status(200).json({ success: true,  totalUsers: count ,users });
//   } catch (err) {
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

export const getAllUsers = async (req, res) => {
  try {
    // Get all users excluding passwords
    const users = await User.find().select("-password");
    const count = await User.countDocuments();

    if (users.length === 0) {
      return res.status(404).json({ success: false, message: "No users found" });
    }

    // Get assignment data for all users
    const userIds = users.map(user => user._id);
    const assignments = await UserLeadAssignment.find({
      userId: { $in: userIds },
      status: 'active'
    })
    .populate('employeeId', 'name email')
    .lean();

    console.log('Total users:', users.length);
    console.log('Total active assignments found:', assignments.length);
    console.log('Sample assignments:', assignments.slice(0, 2));

    // Create a map of userId to assignment
    const assignmentMap = {};
    assignments.forEach(assignment => {
      assignmentMap[assignment.userId.toString()] = assignment;
    });

    // Attach assignment data to each user
    const usersWithAssignments = users.map(user => {
      const userObj = user.toObject();
      const assignment = assignmentMap[user._id.toString()];
      
      if (assignment) {
        userObj.assignment = {
          _id: assignment._id,
          employeeId: assignment.employeeId,
          priority: assignment.priority,
          assignedDate: assignment.assignedDate,
          notes: assignment.notes,
          status: assignment.status
        };
      } else {
        userObj.assignment = null;
      }
      
      return userObj;
    });

    // 🔥 Send FCM notification to all users with a valid token
    const fcmPromises = users
      .filter(user => user.fcmToken) // only those who have FCM token
      .map(user => {
        const message = {
          token: user.fcmToken,
          notification: {
            title: "Welcome!",
            body: `Hi ${user.name || "User"}, welcome back to our platform 🎉`,
          },
        };

        // Send FCM message
        return admin.messaging().send(message)
          .then(() => console.log(`✅ Notification sent to: ${user.email}`))
          .catch(err => console.error(`❌ Failed for ${user.email}:`, err.message));
      });

    // Wait for all notifications to complete (don’t block response if needed)
    await Promise.allSettled(fcmPromises);

    // ✅ Return response
    res.status(200).json({
      success: true,
      totalUsers: count,
      message: "Users fetched successfully and welcome notifications sent.",
      users: usersWithAssignments,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================
// Get logged-in user by Token
// ==========================


export const getUserByToken = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware

    // 1 Fetch user details
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // 2 Count shortlisted (saved) properties by this user
    const shortlistedCount = await SavedProperty.countDocuments({ userId });

    // 3 Count properties added by this user
    const myListingsCount = await Property.countDocuments({ userId });

    // 4 Count number of properties this user has visited (appears in visitedBy)
    const enquiriesCount = await Property.countDocuments({
      "visitedBy.userId": userId,
    });

    // 5 Attach counts dynamically
    const userWithCounts = {
      ...user.toObject(),
      shortlistedCount,
      myListingsCount,
      enquiriesCount,
    };

    res.status(200).json({
      success: true,
      user: userWithCounts,
    });
  } catch (err) {
    console.error("Get User Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================
// Get User Profile
// ==========================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id; // from verifyToken middleware

    // Fetch user details
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    // Get user's statistics
    const [shortlistedCount, myListingsCount, enquiriesCount, assignment] = await Promise.all([
      SavedProperty.countDocuments({ userId }),
      Property.countDocuments({ userId }),
      Property.countDocuments({ "visitedBy.userId": userId }),
      UserLeadAssignment.findOne({ userId, status: 'active' })
        .populate('employeeId', 'name email phone profilePicture')
        .lean()
    ]);

    // Build profile response
    const profile = {
      ...user.toObject(),
      statistics: {
        shortlistedProperties: shortlistedCount,
        myListings: myListingsCount,
        enquiries: enquiriesCount
      },
      assignedEmployee: assignment ? {
        _id: assignment._id,
        employee: assignment.employeeId,
        priority: assignment.priority,
        assignedDate: assignment.assignedDate,
        notes: assignment.notes
      } : null
    };

    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Error fetching profile",
      error: err.message 
    });
  }
};

// ==========================
// Update user
// ==========================
export const updateUser = async (req, res) => {
  try {
    const updates = req.body;

    // Log incoming updates for debugging
    console.log("Updating user with data:", updates);

    // If password update
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Validate dob if provided (should be a valid date)
    if (updates.dob) {
      const dobDate = new Date(updates.dob);
      if (isNaN(dobDate.getTime())) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid date of birth format" 
        });
      }
      updates.dob = dobDate;
    }

    // Validate languagePreferences if provided (should be an array)
    if (updates.languagePreferences) {
      if (!Array.isArray(updates.languagePreferences)) {
        return res.status(400).json({ 
          success: false, 
          message: "Language preferences must be an array" 
        });
      }
    }

    // Handle case sensitivity: map pincode to pinCode if present
    if (updates.pincode && !updates.pinCode) {
      updates.pinCode = updates.pincode;
      delete updates.pincode;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { 
        new: true, 
        runValidators: true // Ensure validators run on update
      }
    ).select("-password");
    
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    console.log("User updated successfully:", user._id);
    res.status(200).json({ success: true, message: "User updated", user });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// ==========================
// Update Employment Details
// ==========================
export const updateEmploymentDetails = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { employmentType, designation, companyName, income } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Build employment details object
    const employmentDetails = {};
    if (employmentType !== undefined) employmentDetails.employmentType = employmentType;
    if (designation !== undefined) employmentDetails.designation = designation;
    if (companyName !== undefined) employmentDetails.companyName = companyName;
    if (income !== undefined) employmentDetails.income = income;

    // Update user with employment details
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { "employmentDetails": { ...employmentDetails } } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("Employment details updated for user:", user._id);
    return res.status(200).json({
      success: true,
      message: "Employment details updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Employment Details Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update employment details",
      error: error.message 
    });
  }
};

// ==========================
// Update Property Requirement
// ==========================
export const updatePropertyRequirement = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { purchasingFor, investmentAmount } = req.body;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    // Build property requirement object
    const propertyRequirement = {};
    if (purchasingFor !== undefined) propertyRequirement.purchasingFor = purchasingFor;
    if (investmentAmount !== undefined) propertyRequirement.investmentAmount = investmentAmount;

    // Update user with property requirement details
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { "propertyRequirement": { ...propertyRequirement } } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    console.log("Property requirement updated for user:", user._id);
    return res.status(200).json({
      success: true,
      message: "Property requirement updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update Property Requirement Error:", error);
    return res.status(500).json({ 
      success: false, 
      message: "Failed to update property requirement",
      error: error.message 
    });
  }
};

// ==========================
// Delete user
// ==========================
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.status(200).json({ success: true, message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};






  // import User from "../models/user.js";
  // import bcrypt from "bcryptjs";
  // import nodemailer from "nodemailer";

// -------------------- 1. SEND FORGET PASSWORD OTP --------------------
export const forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;

    //  Check user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //  Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    //  Set OTP expiry (5 minutes)
    const otpExpiry = Date.now() + 5 * 60 * 1000;

    //  Save OTP and expiry in DB
    user.resetOtp = otp;
    user.otpExpiry = otpExpiry;
    user.isOtpVerified = false;
    await user.save();

    //  Send OTP via email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Support" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <h2>Hello ${user.fullName || "User"},</h2>
        <p>Your OTP for resetting the password is:</p>
        <h1 style="color: #2e6c80;">${otp}</h1>
        <p>This OTP will expire in <b>5 minutes</b>.</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully to your email.",
    });
  } catch (error) {
    console.error("Forget Password (Send OTP) Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- 2. VERIFY OTP --------------------
export const verifyResetToken = async (req, res) => {
  try {
    const { email, otp } = req.body;

    //  Check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //  Wrong OTP
    if (user.resetOtp !== Number(otp)) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    //  OTP expired
    if (user.otpExpiry < Date.now()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    //  OTP verified
    user.isOtpVerified = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// -------------------- 3. UPDATE PASSWORD --------------------
export const updatePassword = async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    //  Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    //  Check if OTP verified
    if (!user.isOtpVerified) {
      return res.status(400).json({ success: false, message: "OTP not verified" });
    }

    //  Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;

    //  Clear OTP data
    user.resetOtp = undefined;
    user.otpExpiry = undefined;
    user.isOtpVerified = false;

    await user.save();

    res.status(200).json({ success: true, message: "Password updated successfully" });
  } catch (error) {
    console.error("Update Password Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
