import express from "express";
import { verifyEmployeeToken, checkPermission } from "../middlewares/roleMiddleware.js";
import {
  getAllProperties,
  getAllOtherProperties,
  getSubCategoryCounts
} from "../controllers/getControllers.js";
import { getBoughtProperties } from "../controllers/boughtPropertyController.js";
import { getAllRentProperties } from "../controllers/rentController.js";
import { getRevenueStatus } from "../controllers/revenueController.js";

const router = express.Router();

// Apply employee token verification to all routes
router.use(verifyEmployeeToken);

// Dashboard routes with permission checks
router.get("/properties/all", 
  checkPermission("properties", "read"), 
  getAllProperties
);

router.get("/properties/bought", 
  checkPermission("properties", "read"), 
  getBoughtProperties
);

router.get("/properties/rent", 
  checkPermission("properties", "read"), 
  getAllRentProperties
);

router.get("/properties/recent", 
  checkPermission("properties", "read"), 
  async (req, res) => {
    try {
      // Import and call the recent properties controller
      const { getRecentProperties } = await import("../controllers/recentController.js");
      await getRecentProperties(req, res);
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error fetching recent properties",
        error: error.message
      });
    }
  }
);

router.get("/subcategory-counts", 
  checkPermission("properties", "read"), 
  getSubCategoryCounts
);

router.get("/revenue", 
  checkPermission("dashboard", "read"), 
  getRevenueStatus
);

// Dashboard stats endpoint
router.get("/stats", 
  checkPermission("dashboard", "read"), 
  async (req, res) => {
    try {
      // Import models directly for stats calculation
      const Property = (await import("../models/addProps.js")).default;
      const BoughtProperty = (await import("../models/buyPropertySchema.js")).default;
      const RentProperty = (await import("../models/addProps.js")).default; // Assuming rent uses same model

      // Get counts directly from database
        const [totalProperties, boughtPropertiesCount, rentPropertiesCount] = await Promise.all([
        Property.countDocuments(),
        BoughtProperty.countDocuments(),
        Property.countDocuments({ type: "rent" }) // Adjust this based on your rent property logic
      ]);      res.json({
        success: true,
        data: {
          totalProperties,
          boughtProperties: boughtPropertiesCount,
          rentProperties: rentPropertiesCount,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching dashboard statistics",
        error: error.message
      });
    }
  }
);

// Employee Overview Stats - leads, follow-ups, site visits, deals, revenue
router.get("/overview-stats",
  checkPermission("dashboard", "read"),
  async (req, res) => {
    try {
      const employeeId = req.employee._id;

      const LeadAssignment = (await import("../models/leadAssignmentSchema.js")).default;
      const FollowUp = (await import("../models/followUpSchema.js")).default;

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const [
        totalLeads,
        newLeadsToday,
        followUpLeads,
        siteVisitsCompleted,
        totalFollowUpsCompleted,
        dealsClosed,
        dealsLost,
        revenueAgg
      ] = await Promise.all([
        // Total leads assigned to this employee
        LeadAssignment.countDocuments({ employeeId }),

        // New leads assigned today
        LeadAssignment.countDocuments({
          employeeId,
          assignedDate: { $gte: today, $lt: tomorrow }
        }),

        // Follow-up leads (open follow-ups for this agent)
        FollowUp.countDocuments({
          assignedAgent: employeeId,
          caseStatus: "open",
          isActive: true
        }),

        // Site visits completed (leads where action is "Visited")
        LeadAssignment.countDocuments({
          employeeId,
          action: { $regex: /visited/i }
        }),

        // Total follow-ups completed (closed follow-ups)
        FollowUp.countDocuments({
          assignedAgent: employeeId,
          caseStatus: "close"
        }),

        // Deals closed (converted outcomes)
        FollowUp.countDocuments({
          assignedAgent: employeeId,
          outcome: "converted"
        }),

        // Deals lost
        FollowUp.countDocuments({
          assignedAgent: employeeId,
          outcome: "lost"
        }),

        // Revenue generated from conversions
        FollowUp.aggregate([
          {
            $match: {
              assignedAgent: employeeId,
              outcome: "converted",
              "conversionDetails.amount": { $gt: 0 }
            }
          },
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: "$conversionDetails.amount" }
            }
          }
        ])
      ]);

      const revenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      res.json({
        success: true,
        data: {
          totalLeads,
          newLeadsToday,
          followUpLeads,
          siteVisits: siteVisitsCompleted,
          followUpsCompleted: totalFollowUpsCompleted,
          dealsClosed,
          dealsLost,
          revenueGenerated: revenue,
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      console.error("Employee overview stats error:", error);
      res.status(500).json({
        success: false,
        message: "Error fetching employee overview statistics",
        error: error.message
      });
    }
  }
);

export default router;