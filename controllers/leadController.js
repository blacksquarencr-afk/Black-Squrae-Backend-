 import axios from "axios";
import Lead from "../models/Lead.js";

// MARK LEAD AS SOLD
export const markLeadAsSold = async (req, res) => {
  try {
    console.log("MARK SOLD API HIT");
    console.log("Logged in admin:", req.user?._id);

    const { id } = req.params;

    const lead = await Lead.findById(id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found",
      });
    }

    // ✅ IMPORTANT: Allow admin directly
    // Do NOT check assignedTo
    // Your verifyAdminToken already verified admin

    lead.status = "sold";
    lead.soldAt = new Date();
    lead.soldBy = req.user._id;

    await lead.save();

    return res.status(200).json({
      success: true,
      message: "Lead marked as sold successfully",
      data: lead,
    });

  } catch (error) {
    console.error("Mark as sold error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};