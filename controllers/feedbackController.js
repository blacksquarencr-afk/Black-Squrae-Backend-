import Feedback from "../models/feedbackSchema.js";
import User from "../models/user.js";
import Employee from "../models/employeeSchema.js";

// User submits feedback
export const submitFeedback = async (req, res) => {
  try {
    const {
      issueType,
      issueDetails,
      contactInfo,
      relatedProperty,
      relatedEnquiry,
      attachments
    } = req.body;

    // Validate required fields
    if (!issueType || !issueDetails) {
      return res.status(400).json({
        success: false,
        message: "Issue type and details are required."
      });
    }

    // Get user info
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required."
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found."
      });
    }

    // Create feedback
    const feedback = new Feedback({
      user: userId,
      contactInfo: {
        name: contactInfo?.name || user.fullName || "N/A",
        email: contactInfo?.email || user.email || "N/A",
        phone: contactInfo?.phone || user.phone
      },
      issueType,
      issueDetails,
      relatedProperty: relatedProperty || null,
      relatedEnquiry: relatedEnquiry || null,
      attachments: attachments || [],
      status: 'pending',
      priority: 'medium'
    });

    await feedback.save();

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully. Our team will review it soon.",
      data: feedback
    });
  } catch (error) {
    console.error("Error submitting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error submitting feedback.",
      error: error.message
    });
  }
};

// Get all feedbacks (Admin/Employee with permission)
export const getAllFeedbacks = async (req, res) => {
  try {
    const {
      status,
      priority,
      issueType,
      assignedTo,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build filter
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (issueType) filter.issueType = issueType;
    if (assignedTo) filter.assignedTo = assignedTo;

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === 'asc' ? 1 : -1;

    // Get feedbacks
    const feedbacks = await Feedback.find(filter)
      .populate('user', 'fullName email phone')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedbacks.",
      error: error.message
    });
  }
};

// Get feedback by ID
export const getFeedbackById = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id)
      .populate('user', 'fullName email phone avatar')
      .populate('assignedTo', 'name email phone profilePicture')
      .populate('assignedBy', 'name email')
      .populate('resolvedBy', 'name email')
      .populate('internalNotes.addedBy', 'name email');

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error("Error fetching feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback.",
      error: error.message
    });
  }
};

// Get user's own feedbacks
export const getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { status, page = 1, limit = 20 } = req.query;

    const filter = { user: userId };
    if (status) filter.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error("Error fetching user feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching your feedbacks.",
      error: error.message
    });
  }
};

// Assign feedback to employee (Admin only)
export const assignFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignedTo, priority } = req.body;

    if (!assignedTo) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required for assignment."
      });
    }

    // Verify employee exists
    const employee = await Employee.findById(assignedTo);
    if (!employee || !employee.isActive) {
      return res.status(404).json({
        success: false,
        message: "Employee not found or inactive."
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    // Update assignment
    feedback.assignedTo = assignedTo;
    feedback.assignedBy = req.employee?._id || null; // Admin might not have employee ID
    feedback.assignedAt = new Date();
    feedback.status = 'assigned';
    
    if (priority) {
      feedback.priority = priority;
    }

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('user', 'fullName email phone')
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Feedback assigned successfully.",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Error assigning feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error assigning feedback.",
      error: error.message
    });
  }
};

// Update feedback status
export const updateFeedbackStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.body;

    const validStatuses = ['pending', 'assigned', 'in-progress', 'resolved', 'closed', 'rejected'];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    // Check if admin or assigned employee
    const isAdmin = req.isAdmin || req.admin;
    const employeeId = req.employee?._id?.toString();
    const isAssigned = employeeId && feedback.assignedTo && feedback.assignedTo.toString() === employeeId;
    const hasAdminAccess = req.employee?.giveAdminAccess;

    if (!isAdmin && !isAssigned && !hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to update this feedback."
      });
    }

    if (status) feedback.status = status;
    if (priority) feedback.priority = priority;

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('user', 'fullName email phone')
      .populate('assignedTo', 'name email');

    res.status(200).json({
      success: true,
      message: "Feedback status updated successfully.",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Error updating feedback status:", error);
    res.status(500).json({
      success: false,
      message: "Error updating feedback status.",
      error: error.message
    });
  }
};

// Add internal note to feedback
export const addInternalNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { note } = req.body;

    if (!note || note.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Note content is required."
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    // Check permission
    const isAdmin = req.isAdmin || req.admin;
    const employeeId = req.employee?._id?.toString();
    const isAssigned = employeeId && feedback.assignedTo && feedback.assignedTo.toString() === employeeId;
    const hasAdminAccess = req.employee?.giveAdminAccess;

    if (!isAdmin && !isAssigned && !hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to add notes to this feedback."
      });
    }

    feedback.internalNotes.push({
      note: note.trim(),
      addedBy: req.employee?._id || req.admin?._id || null,
      addedAt: new Date()
    });

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('internalNotes.addedBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Internal note added successfully.",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Error adding internal note:", error);
    res.status(500).json({
      success: false,
      message: "Error adding internal note.",
      error: error.message
    });
  }
};

// Resolve feedback
export const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    if (!resolution || resolution.trim() === '') {
      return res.status(400).json({
        success: false,
        message: "Resolution details are required."
      });
    }

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    // Check permission
    const isAdmin = req.isAdmin || req.admin;
    const employeeId = req.employee?._id?.toString();
    const isAssigned = employeeId && feedback.assignedTo && feedback.assignedTo.toString() === employeeId;
    const hasAdminAccess = req.employee?.giveAdminAccess;

    if (!isAdmin && !isAssigned && !hasAdminAccess) {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to resolve this feedback."
      });
    }

    feedback.resolution = resolution.trim();
    feedback.resolvedBy = req.employee?._id || req.admin?._id || null;
    feedback.resolvedAt = new Date();
    feedback.status = 'resolved';

    await feedback.save();

    const updatedFeedback = await Feedback.findById(id)
      .populate('user', 'fullName email phone')
      .populate('assignedTo', 'name email')
      .populate('resolvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: "Feedback resolved successfully.",
      data: updatedFeedback
    });
  } catch (error) {
    console.error("Error resolving feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error resolving feedback.",
      error: error.message
    });
  }
};

// Get feedbacks assigned to logged-in employee
export const getMyAssignedFeedbacks = async (req, res) => {
  try {
    const employeeId = req.employee._id;
    const { status, priority, page = 1, limit = 20 } = req.query;

    const filter = { assignedTo: employeeId };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const feedbacks = await Feedback.find(filter)
      .populate('user', 'fullName email phone avatar')
      .populate('assignedBy', 'name email')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Feedback.countDocuments(filter);

    // Get counts by status
    const statusCounts = await Feedback.aggregate([
      { $match: { assignedTo: employeeId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      data: feedbacks,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      statusCounts: statusCounts.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {})
    });
  } catch (error) {
    console.error("Error fetching assigned feedbacks:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching assigned feedbacks.",
      error: error.message
    });
  }
};

// Get feedback statistics (Admin)
export const getFeedbackStats = async (req, res) => {
  try {
    const stats = await Feedback.aggregate([
      {
        $facet: {
          byStatus: [
            { $group: { _id: '$status', count: { $sum: 1 } } }
          ],
          byPriority: [
            { $group: { _id: '$priority', count: { $sum: 1 } } }
          ],
          byIssueType: [
            { $group: { _id: '$issueType', count: { $sum: 1 } } }
          ],
          totalFeedbacks: [
            { $count: 'total' }
          ],
          pendingFeedbacks: [
            { $match: { status: 'pending' } },
            { $count: 'total' }
          ],
          resolvedFeedbacks: [
            { $match: { status: { $in: ['resolved', 'closed'] } } },
            { $count: 'total' }
          ]
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: stats[0]
    });
  } catch (error) {
    console.error("Error fetching feedback stats:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching feedback statistics.",
      error: error.message
    });
  }
};

// Delete feedback (Admin only)
export const deleteFeedback = async (req, res) => {
  try {
    const { id } = req.params;

    const feedback = await Feedback.findById(id);
    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found."
      });
    }

    await Feedback.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Feedback deleted successfully."
    });
  } catch (error) {
    console.error("Error deleting feedback:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting feedback.",
      error: error.message
    });
  }
};
