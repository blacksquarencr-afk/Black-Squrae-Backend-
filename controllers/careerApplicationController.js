import CareerApplication from "../models/careerApplicationSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";

// Create new career application (Public)
export const createCareerApplication = async (req, res) => {
  try {
    const { name, mobileNo, location, experienceLevel, comfortableWithTargets, joiningAvailability } = req.body;

    // Validate required fields
    if (!name || !mobileNo || !location || !experienceLevel || !comfortableWithTargets || !joiningAvailability) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    // Create new application
    const application = new CareerApplication({
      name,
      mobileNo,
      location,
      experienceLevel,
      comfortableWithTargets,
      joiningAvailability,
      position: "Client Relationship Consultant"
    });

    await application.save();

    res.status(201).json({
      success: true,
      message: "Application submitted successfully! We will contact you soon.",
      data: {
        _id: application._id,
        name: application.name,
        position: application.position,
        status: application.status,
        createdAt: application.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
};

// Get all career applications (Admin sees unassigned, Employee sees their assigned)
export const getAllCareerApplications = async (req, res) => {
  try {
    const { status, position, experienceLevel, page = 1, limit = 10, sortBy = "-createdAt" } = req.query;

    const query = {};
    if (status) query.status = status;
    if (position) query.position = position;
    if (experienceLevel) query.experienceLevel = experienceLevel;

    if (req.employee) {
      // --- EMPLOYEE: show only career applications assigned to this employee ---
      const assignments = await LeadAssignment.find({
        employeeId: req.employee._id,
        enquiryType: 'CareerApplication'
      }).select('enquiryId');

      const assignedIds = assignments.map(a => a.enquiryId);
      query._id = { $in: assignedIds };
    } else {
      // --- ADMIN: show only UNASSIGNED career applications ---
      const allAssignments = await LeadAssignment.find({
        enquiryType: 'CareerApplication'
      }).select('enquiryId');

      const alreadyAssignedIds = allAssignments.map(a => a.enquiryId.toString());
      if (alreadyAssignedIds.length > 0) {
        query._id = { $nin: alreadyAssignedIds };
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const applications = await CareerApplication.find(query)
      .sort(sortBy)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await CareerApplication.countDocuments(query);

    res.status(200).json({
      success: true,
      data: applications,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error("Error fetching career applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};

// Get single career application by ID (Admin)
export const getCareerApplicationById = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await CareerApplication.findById(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error("Error fetching career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch application",
      error: error.message
    });
  }
};

// Update application status (Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const validStatuses = ["Pending", "Reviewed", "Interviewed", "Shortlisted", "Rejected", "Hired"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const application = await CareerApplication.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Application updated successfully",
      data: application
    });
  } catch (error) {
    console.error("Error updating career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update application",
      error: error.message
    });
  }
};

// Delete career application (Admin)
export const deleteCareerApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await CareerApplication.findByIdAndDelete(id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Application deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting career application:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete application",
      error: error.message
    });
  }
};

// Get application statistics (Admin or Employee scoped)
export const getApplicationStatistics = async (req, res) => {
  try {
    const baseQuery = {};

    if (req.employee) {
      // Employee: count only their assigned applications
      const assignments = await LeadAssignment.find({
        employeeId: req.employee._id,
        enquiryType: 'CareerApplication'
      }).select('enquiryId');

      const assignedIds = assignments.map(a => a.enquiryId);
      baseQuery._id = { $in: assignedIds };
    } else {
      // Admin: count only unassigned applications
      const allAssignments = await LeadAssignment.find({
        enquiryType: 'CareerApplication'
      }).select('enquiryId');

      const alreadyAssignedIds = allAssignments.map(a => a.enquiryId.toString());
      if (alreadyAssignedIds.length > 0) {
        baseQuery._id = { $nin: alreadyAssignedIds };
      }
    }

    const totalApplications = await CareerApplication.countDocuments(baseQuery);
    const pendingApplications = await CareerApplication.countDocuments({ ...baseQuery, status: "Pending" });
    const reviewedApplications = await CareerApplication.countDocuments({ ...baseQuery, status: "Reviewed" });
    const shortlistedApplications = await CareerApplication.countDocuments({ ...baseQuery, status: "Shortlisted" });
    const rejectedApplications = await CareerApplication.countDocuments({ ...baseQuery, status: "Rejected" });
    const hiredApplications = await CareerApplication.countDocuments({ ...baseQuery, status: "Hired" });

    const experienceLevelBreakdown = await CareerApplication.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$experienceLevel", count: { $sum: 1 } } }
    ]);

    const targetComfortBreakdown = await CareerApplication.aggregate([
      { $match: baseQuery },
      { $group: { _id: "$comfortableWithTargets", count: { $sum: 1 } } }
    ]);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentApplications = await CareerApplication.countDocuments({
      ...baseQuery,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.status(200).json({
      success: true,
      data: {
        total: totalApplications,
        totalApplications,
        byStatus: {
          Pending: pendingApplications,
          pending: pendingApplications,
          reviewed: reviewedApplications,
          Shortlisted: shortlistedApplications,
          shortlisted: shortlistedApplications,
          Rejected: rejectedApplications,
          rejected: rejectedApplications,
          Hired: hiredApplications,
          hired: hiredApplications
        },
        byExperienceLevel: experienceLevelBreakdown,
        byTargetComfort: targetComfortBreakdown,
        recentApplications
      }
    });
  } catch (error) {
    console.error("Error fetching application statistics:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch statistics",
      error: error.message
    });
  }
};

// Bulk update application status (Admin)
export const bulkUpdateApplicationStatus = async (req, res) => {
  try {
    const { applicationIds, status, notes } = req.body;

    if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Application IDs array is required"
      });
    }

    const validStatuses = ["Pending", "Reviewed", "Shortlisted", "Rejected", "Hired"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`
      });
    }

    const updateData = { status };
    if (notes) updateData.notes = notes;

    const result = await CareerApplication.updateMany(
      { _id: { $in: applicationIds } },
      updateData
    );

    res.status(200).json({
      success: true,
      message: `${result.modifiedCount} application(s) updated successfully`,
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount
      }
    });
  } catch (error) {
    console.error("Error bulk updating applications:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update applications",
      error: error.message
    });
  }
};
