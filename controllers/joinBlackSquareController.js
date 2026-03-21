import JoinBlackSquare from "../models/joinBlackSquareModel.js";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";


// ✅ Create Application
export const createApplication = async (req, res) => {
  try {
    const {
      name,
      mobileNo,
      location,
      experienceLevel,
      targetIncentivesComfortable,
      joiningTimeline
    } = req.body;

    // Validation
    if (
      !name ||
      !mobileNo ||
      !location ||
      !experienceLevel ||
      !targetIncentivesComfortable ||
      !joiningTimeline
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields are required"
      });
    }

    const application = new JoinBlackSquare({
      name,
      mobileNo,
      location,
      experienceLevel,
      targetIncentivesComfortable,
      joiningTimeline
    });

    await application.save();

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      application._id,
      'CareerApplication',
      'medium',
      'Auto-assigned to Team Leader via Round Robin'
    );

    if (assignment) {
      application.assignedTo = assignment.employeeId;
      await application.save();
      console.log(`✅ Career Application ${application._id} assigned to Team Leader`);
    }

    res.status(201).json({
      success: true,
      message: "Application submitted successfully",
      data: application,
      assignment: assignment ? { employeeId: assignment.employeeId } : null
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to submit application",
      error: error.message
    });
  }
};



// ✅ Get All Applications (Admin)
export const getAllApplications = async (req, res) => {
  try {
    const applications = await JoinBlackSquare.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch applications",
      error: error.message
    });
  }
};



// ✅ Get Single Application
export const getApplicationById = async (req, res) => {
  try {
    const application = await JoinBlackSquare.findById(req.params.id);

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
    res.status(500).json({
      success: false,
      message: "Error fetching application",
      error: error.message
    });
  }
};



// ✅ Update Status (Admin)
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await JoinBlackSquare.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!application) {
      return res.status(404).json({
        success: false,
        message: "Application not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Status updated successfully",
      data: application
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update status",
      error: error.message
    });
  }
};