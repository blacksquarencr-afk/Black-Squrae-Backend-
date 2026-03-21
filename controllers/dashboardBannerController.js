import DashboardBanner from "../models/dashboardBannerSchema.js";

// ====================== CREATE/UPDATE DASHBOARD BANNER ======================
export const updateDashboardBanner = async (req, res) => {
  try {
    const { heading, subheadingPrefix, rotatingTexts } = req.body;
    
    // Validation
    if (!heading || !subheadingPrefix || !rotatingTexts) {
      return res.status(400).json({
        success: false,
        message: "Heading, subheadingPrefix, and rotatingTexts are required"
      });
    }

    // Parse rotatingTexts if it's a string
    let textsArray = rotatingTexts;
    if (typeof rotatingTexts === 'string') {
      try {
        textsArray = JSON.parse(rotatingTexts);
      } catch (e) {
        textsArray = [rotatingTexts];
      }
    }

    // Check if image is uploaded
    const imagePath = req.file ? `/uploads/${req.file.filename}` : null;

    // Find existing banner or create new
    let banner = await DashboardBanner.findOne({ isActive: true });

    if (banner) {
      // Update existing
      banner.heading = heading;
      banner.subheadingPrefix = subheadingPrefix;
      banner.rotatingTexts = textsArray;
      if (imagePath) {
        banner.image = imagePath;
      }
      await banner.save();
    } else {
      // Create new
      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: "Image is required for first-time setup"
        });
      }
      banner = await DashboardBanner.create({
        image: imagePath,
        heading,
        subheadingPrefix,
        rotatingTexts: textsArray
      });
    }

    return res.status(200).json({
      success: true,
      message: "Dashboard banner updated successfully",
      data: banner
    });
  } catch (error) {
    console.error("Update Dashboard Banner Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to update dashboard banner",
      error: error.message
    });
  }
};

// ====================== GET DASHBOARD BANNER ======================
export const getDashboardBanner = async (req, res) => {
  try {
    const banner = await DashboardBanner.findOne({ isActive: true });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "No dashboard banner found"
      });
    }

    return res.status(200).json({
      success: true,
      data: banner
    });
  } catch (error) {
    console.error("Get Dashboard Banner Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard banner",
      error: error.message
    });
  }
};

// ====================== DELETE DASHBOARD BANNER ======================
export const deleteDashboardBanner = async (req, res) => {
  try {
    const banner = await DashboardBanner.findOne({ isActive: true });

    if (!banner) {
      return res.status(404).json({
        success: false,
        message: "No dashboard banner found"
      });
    }

    await banner.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Dashboard banner deleted successfully"
    });
  } catch (error) {
    console.error("Delete Dashboard Banner Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Failed to delete dashboard banner",
      error: error.message
    });
  }
};
