import User from "../models/user.js";

/**
 * Middleware to check if user has completed full registration
 * Returns registration status and user info
 * Use this before property upload or other protected actions
 */
export const checkRegistration = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id || req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - Please login first",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if user has completed registration
    const isComplete =
      user.fullName &&
      user.email &&
      user.phone &&
      user.isPhoneVerified;

    if (!isComplete) {
      return res.status(403).json({
        success: false,
        needsRegistration: true,
        message: "Please complete your registration to upload property",
        user: {
          _id: user._id,
          phone: user.phone,
          fullName: user.fullName || null,
          email: user.email || null,
        },
      });
    }

    // Attach complete user to request for next middleware
    req.user.fullData = user;
    next();
  } catch (error) {
    console.error("Check Registration Error:", error);
    return res.status(500).json({
      success: false,
      message: "Error checking registration status",
    });
  }
};

/**
 * Optional middleware - warns if registration incomplete but allows action
 */
export const warnIncompleteRegistration = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (userId) {
      const user = await User.findById(userId);
      const isComplete = user?.fullName && user?.email && user?.phone;

      req.user.registrationComplete = isComplete;
      req.user.fullData = user;
    }

    next();
  } catch (error) {
    next(); // Don't block on error
  }
};
