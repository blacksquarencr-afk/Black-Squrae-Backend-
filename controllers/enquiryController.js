import Enquiry from "../models/enquirySchema.js";
import Employee from "../models/employeeSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";
import ManualInquiry from "../models/manualInquirySchema.js";
import RentReceipt from "../models/rentReceiptModel.js";
import BookPropertyEnquiry from "../models/bookPropertyEnquiry.js";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";

// Create new enquiry (Guest/User)
export const createEnquiry = async (req, res) => {
  try {
    const userId = req.user?.id || req.employee?._id || null;
    const body = req.body;

    // Extract countryCode (e.g. '+91') and phone number separately
    const countryCode = body.countryCode || '+91';
    const rawPhone = body.phone || body.mobileNumber || "";

    // Store full number (countryCode + phone) as mobileNumber for easy searching
    const mobileNumber = rawPhone
      ? `${countryCode}${rawPhone}`.replace(/\s+/g, '')
      : "";

    const enquiryData = {
      ...body,
      countryCode,
      mobileNumber,
      userId: userId,
      isGuestEnquiry: !userId
    };

    // --- Home Loan: map flat frontend fields to nested homeLoan object ---
    // Frontend sends: { city, agreeTerms } but schema expects: { homeLoan: { city, agreeToTerms } }
    if (body.enquiryType === "home_loan") {
      // Debug: log what city value we are receiving from frontend
      console.log("[HomeLoan] body.city =", body.city, "| body.homeLoan =", body.homeLoan);

      const cityValue =
        (body["homeLoan.city"] && String(body["homeLoan.city"]).trim()) ||
        (body.homeLoan?.city && String(body.homeLoan.city).trim()) ||
        (body.city && String(body.city).trim()) ||
        "";

      const agreeToTermsValue =
        body["homeLoan.agreeToTerms"] !== undefined ? body["homeLoan.agreeToTerms"] :
          body.homeLoan?.agreeToTerms !== undefined ? body.homeLoan.agreeToTerms :
            body.agreeTerms !== undefined ? body.agreeTerms :
              body.agreeToTerms !== undefined ? body.agreeToTerms :
                false;

      console.log("[HomeLoan] Resolved city =", cityValue, "| agreeToTerms =", agreeToTermsValue);

      enquiryData.homeLoan = {
        city: cityValue,
        agreeToTerms: Boolean(agreeToTermsValue)
      };
    }

    // Handle file uploads for vastu calculation
    if (req.files && req.files.length > 0) {
      enquiryData.attachments = req.files.map(file => ({
        fileName: file.originalname,
        filePath: file.path,
        fileType: file.mimetype
      }));

      // Set floor plan for vastu calculation
      if (enquiryData.enquiryType === "vastu_calculation" && req.files[0]) {
        enquiryData.vastuCalculation = {
          ...enquiryData.vastuCalculation,
          floorPlan: req.files[0].path
        };
      }
    }

    // Auto Employee Assignment (Round Robin to Team Leaders)
    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      enquiry._id,
      'Enquiry',
      enquiryData.priority || 'medium',
      'Auto-assigned to Team Leader via Round Robin'
    );

    if (assignment) {
      enquiry.assignedToEmployee = assignment.employeeId;
      enquiry.status = "in_progress";
      await enquiry.save();
    }

    res.status(201).json({
      message: "Enquiry submitted successfully",
      enquiry: {
        _id: enquiry._id,
        enquiryType: enquiry.enquiryType,
        status: enquiry.status,
        assignedToEmployee: assignment?.employeeId,
        createdAt: enquiry.createdAt
      }
    });
  } catch (error) {
    console.error("createEnquiry error:", error.message);
    res.status(400).json({
      message: "Failed to create enquiry",
      error: error.message
    });
  }
};

// Get all enquiries (Admin only)
export const getAllEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      enquiryType,
      status,
      priority,
      assignedToEmployee
    } = req.query;

    let allEnquiries = [];
    let totalCount = 0;

    // Handle special enquiry types from separate collections
    if (enquiryType === 'rent_receipts') {
      // Only rent receipts
      const rentReceipts = await RentReceipt.find({})
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      allEnquiries = rentReceipts.map(receipt => ({
        _id: receipt._id,
        enquiryType: 'rent_receipts',
        fullName: receipt.fullName,
        email: receipt.email,
        mobileNumber: receipt.mobileNumber,
        phone: receipt.mobileNumber,
        status: receipt.status === 'generated' ? 'new' : receipt.status === 'emailed' ? 'contacted' : 'new',
        priority: receipt.priority || 'medium',
        createdAt: receipt.createdAt,
        updatedAt: receipt.updatedAt,
        rentReceipts: {
          propertyAddress: receipt.propertyAddress,
          landlordName: receipt.landlordName,
          tenantName: receipt.tenantName,
          monthlyRent: receipt.monthlyRent,
          receiptType: receipt.receiptType,
          paymentMonth: receipt.paymentMonth,
          paymentYear: receipt.paymentYear,
          period: `${receipt.paymentMonth} ${receipt.paymentYear}`,
          notes: receipt.notes,
          pdfUrl: receipt.pdfUrl
        },
        userId: null,
        assignedToEmployee: receipt.assignedToEmployee,
        assignedBy: receipt.assignedBy
      }));
      totalCount = allEnquiries.length;
    } else if (enquiryType === 'book_property_online') {
      // Only book property online
      const bookPropertyEnquiries = await BookPropertyEnquiry.find({})
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      allEnquiries = bookPropertyEnquiries.map(booking => ({
        _id: booking._id,
        enquiryType: 'book_property_online',
        fullName: booking.fullname,
        email: booking.email,
        mobileNumber: booking.mobile,
        phone: booking.mobile,
        status: booking.status === 'NEW' ? 'new' : booking.status === 'CONTACTED' ? 'contacted' : booking.status === 'CLOSED' ? 'completed' : 'new',
        priority: booking.priority || 'medium',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        bookPropertyOnline: {
          fullname: booking.fullname,
          mobile: booking.mobile,
          email: booking.email
        },
        userId: null,
        assignedToEmployee: booking.assignedToEmployee,
        assignedBy: booking.assignedBy
      }));
      totalCount = allEnquiries.length;
    } else if (!enquiryType || enquiryType === 'all') {
      // Showing all - fetch from all collections
      
      // Fetch rent receipts
      const rentReceipts = await RentReceipt.find({})
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      const transformedRentReceipts = rentReceipts.map(receipt => ({
        _id: receipt._id,
        enquiryType: 'rent_receipts',
        fullName: receipt.fullName,
        email: receipt.email,
        mobileNumber: receipt.mobileNumber,
        phone: receipt.mobileNumber,
        status: receipt.status === 'generated' ? 'new' : receipt.status === 'emailed' ? 'contacted' : 'new',
        priority: receipt.priority || 'medium',
        createdAt: receipt.createdAt,
        updatedAt: receipt.updatedAt,
        rentReceipts: {
          propertyAddress: receipt.propertyAddress,
          landlordName: receipt.landlordName,
          tenantName: receipt.tenantName,
          monthlyRent: receipt.monthlyRent,
          receiptType: receipt.receiptType,
          paymentMonth: receipt.paymentMonth,
          paymentYear: receipt.paymentYear,
          period: `${receipt.paymentMonth} ${receipt.paymentYear}`,
          notes: receipt.notes,
          pdfUrl: receipt.pdfUrl
        },
        userId: null,
        assignedToEmployee: receipt.assignedToEmployee,
        assignedBy: receipt.assignedBy
      }));

      // Fetch book property enquiries
      const bookPropertyEnquiries = await BookPropertyEnquiry.find({})
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      const transformedBookProperty = bookPropertyEnquiries.map(booking => ({
        _id: booking._id,
        enquiryType: 'book_property_online',
        fullName: booking.fullname,
        email: booking.email,
        mobileNumber: booking.mobile,
        phone: booking.mobile,
        status: booking.status === 'NEW' ? 'new' : booking.status === 'CONTACTED' ? 'contacted' : booking.status === 'CLOSED' ? 'completed' : 'new',
        priority: booking.priority || 'medium',
        createdAt: booking.createdAt,
        updatedAt: booking.updatedAt,
        bookPropertyOnline: {
          fullname: booking.fullname,
          mobile: booking.mobile,
          email: booking.email
        },
        userId: null,
        assignedToEmployee: booking.assignedToEmployee,
        assignedBy: booking.assignedBy
      }));

      // Fetch regular enquiries
      const filter = {};
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedToEmployee) filter.assignedToEmployee = assignedToEmployee;

      const regularEnquiries = await Enquiry.find(filter)
        .populate("userId", "fullName email phone")
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      // Combine all
      allEnquiries = [...transformedRentReceipts, ...transformedBookProperty, ...regularEnquiries];
      totalCount = allEnquiries.length;

      // Sort combined results by createdAt
      allEnquiries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else {
      // Fetch only regular enquiries with specific type
      const filter = {};
      if (enquiryType) filter.enquiryType = enquiryType;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (assignedToEmployee) filter.assignedToEmployee = assignedToEmployee;

      const regularEnquiries = await Enquiry.find(filter)
        .populate("userId", "fullName email phone")
        .populate("assignedToEmployee", "name email")
        .populate("assignedBy", "fullName email")
        .sort({ createdAt: -1 })
        .lean();

      allEnquiries = regularEnquiries;
      totalCount = regularEnquiries.length;
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedEnquiries = allEnquiries.slice(startIndex, endIndex);

    res.status(200).json({
      message: "Enquiries fetched successfully",
      enquiries: paginatedEnquiries,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: endIndex < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get all enquiries error:', error);
    res.status(500).json({
      message: "Failed to fetch enquiries",
      error: error.message
    });
  }
};

// Get enquiry by ID (Admin/Employee/Owner)
export const getEnquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id?.toString() || req.employee?._id?.toString();
    const isAdmin = !!req.admin;

    const enquiry = await Enquiry.findById(id)
      .populate("userId", "fullName email phone")
      .populate("assignedToEmployee", "name email phone")
      .populate("assignedBy", "fullName email")
      .populate("communications.communicatedBy", "name email");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Permission check
    const hasPermission =
      isAdmin ||
      enquiry.assignedToEmployee?.toString() === userId ||
      enquiry.userId?.toString() === userId;

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.status(200).json({
      message: "Enquiry fetched successfully",
      enquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enquiry",
      error: error.message
    });
  }
};

// Assign enquiry to employee (Admin only)
export const assignEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId, priority } = req.body;
    const adminId = req.admin?.id;

    // Verify employee exists
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const enquiry = await Enquiry.findByIdAndUpdate(
      id,
      {
        assignedToEmployee: employeeId,
        assignedBy: adminId,
        priority: priority || "medium",
        status: "in_progress"
      },
      { new: true }
    ).populate("assignedToEmployee", "name email");

    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    res.status(200).json({
      message: "Enquiry assigned successfully",
      enquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to assign enquiry",
      error: error.message
    });
  }
};

// Update enquiry status (Admin/Assigned Employee)
export const updateEnquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, adminNotes, followUpDate } = req.body;
    const userId = req.user?.id || req.user?._id?.toString() || req.employee?._id?.toString();
    const isAdmin = !!req.admin;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Permission check
    const hasPermission =
      isAdmin ||
      enquiry.assignedToEmployee?.toString() === userId;

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    const updateData = { status };
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (followUpDate) updateData.followUpDate = new Date(followUpDate);

    const updatedEnquiry = await Enquiry.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    res.status(200).json({
      message: "Enquiry status updated successfully",
      enquiry: updatedEnquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update enquiry status",
      error: error.message
    });
  }
};

// Add communication log (Admin/Assigned Employee)
export const addCommunication = async (req, res) => {
  try {
    const { id } = req.params;
    const { message, communicationType, response } = req.body;
    const userId = req.user?.id || req.user?._id?.toString() || req.employee?._id?.toString();
    const isAdmin = !!req.admin;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Permission check
    const hasPermission =
      isAdmin ||
      enquiry.assignedToEmployee?.toString() === userId;

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    enquiry.communications.push({
      message,
      communicationType,
      communicatedBy: userId,
      response
    });

    await enquiry.save();

    res.status(200).json({
      message: "Communication added successfully",
      enquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to add communication",
      error: error.message
    });
  }
};

// Resolve enquiry (Admin/Assigned Employee)
export const resolveEnquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolutionNotes } = req.body;
    const userId = req.user?.id || req.user?._id?.toString() || req.employee?._id?.toString();
    const isAdmin = !!req.admin;

    const enquiry = await Enquiry.findById(id);
    if (!enquiry) {
      return res.status(404).json({ message: "Enquiry not found" });
    }

    // Permission check
    const hasPermission =
      isAdmin ||
      enquiry.assignedToEmployee?.toString() === userId;

    if (!hasPermission) {
      return res.status(403).json({ message: "Access denied" });
    }

    enquiry.status = "completed";
    enquiry.resolution = {
      isResolved: true,
      resolutionNotes,
      resolvedBy: userId,
      resolvedAt: new Date()
    };

    await enquiry.save();

    res.status(200).json({
      message: "Enquiry resolved successfully",
      enquiry
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to resolve enquiry",
      error: error.message
    });
  }
};

// Get my enquiries (User/Employee)
export const getMyEnquiries = async (req, res) => {
  try {
    const userId = req.user?.id || req.employee?._id;
    const isEmployee = req.employee?._id || req.user?.permissions;

    let filter = {};
    if (isEmployee) {
      filter.assignedToEmployee = userId;
    } else {
      filter.userId = userId;
    }

    const enquiries = await Enquiry.find(filter)
      .populate("assignedToEmployee", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      message: "Enquiries fetched successfully",
      count: enquiries.length,
      enquiries
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch enquiries",
      error: error.message
    });
  }
};

// Get enquiry analytics (Admin only)
export const getEnquiryAnalytics = async (req, res) => {
  try {
    const totalEnquiries = await Enquiry.countDocuments();

    const statusCounts = await Enquiry.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]);

    const typeCounts = await Enquiry.aggregate([
      { $group: { _id: "$enquiryType", count: { $sum: 1 } } }
    ]);

    const monthlyTrends = await Enquiry.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 12 }
    ]);

    res.status(200).json({
      message: "Analytics fetched successfully",
      analytics: {
        totalEnquiries,
        statusBreakdown: statusCounts,
        typeBreakdown: typeCounts,
        monthlyTrends
      }
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch analytics",
      error: error.message
    });
  }
};

// Create women property enquiry
export const createWomenPropertyEnquiry = async (req, res) => {
  try {
    const { fullName, email, mobileNumber, interestedIn } = req.body;

    // Validation
    if (!fullName || !mobileNumber || !interestedIn) {
      return res.status(400).json({
        message: "Full name, mobile number, and interested in are required"
      });
    }

    if (!["Buying", "Selling", "Home Loan", "Interiors"].includes(interestedIn)) {
      return res.status(400).json({
        message: "Invalid interested in value. Must be: Buying, Selling, Home Loan, or Interiors"
      });
    }

    const enquiry = new Enquiry({
      fullName,
      email: email || "",
      mobileNumber,
      enquiryType: "women_property",
      isGuestEnquiry: !req.user?.id,
      userId: req.user?.id || null,
      womenProperty: {
        interestedIn
      }
    });

    // Auto Employee Assignment (Round Robin)
    const employees = await Employee.find({ isActive: true });
    let assignedEmployeeId = null;

    if (employees && employees.length > 0) {
      const totalEnquiries = await Enquiry.countDocuments();
      const roundRobinIndex = totalEnquiries % employees.length;
      assignedEmployeeId = employees[roundRobinIndex]._id;

      enquiry.assignedToEmployee = assignedEmployeeId;
      enquiry.status = "in_progress";
    }

    await enquiry.save();

    // Create a LeadAssignment to log it and allow it to show in My Leads
    if (assignedEmployeeId) {
      const assignmentDoc = new LeadAssignment({
        employeeId: assignedEmployeeId,
        enquiryId: enquiry._id,
        enquiryType: "Enquiry", // Using base Enquiry type
        status: "active",
        priority: enquiry.priority || "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by system via Round Robin"
      });
      await assignmentDoc.save();
    }

    res.status(201).json({
      success: true,
      message: "Women property enquiry submitted successfully",
      enquiry: {
        _id: enquiry._id,
        fullName: enquiry.fullName,
        email: enquiry.email,
        mobileNumber: enquiry.mobileNumber,
        interestedIn: enquiry.womenProperty.interestedIn,
        status: enquiry.status,
        createdAt: enquiry.createdAt
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: "Failed to create women property enquiry",
      error: error.message
    });
  }
};

// Get all women property enquiries
export const getWomenPropertyEnquiries = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      interestedIn
    } = req.query;

    const filter = { enquiryType: "women_property" };
    if (status) filter.status = status;
    if (interestedIn) filter["womenProperty.interestedIn"] = interestedIn;

    const enquiries = await Enquiry.find(filter)
      .populate("userId", "fullName email phone")
      .populate("assignedToEmployee", "name email")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Enquiry.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Women property enquiries fetched successfully",
      enquiries: enquiries.map(enq => ({
        _id: enq._id,
        fullName: enq.fullName,
        email: enq.email,
        mobileNumber: enq.mobileNumber,
        interestedIn: enq.womenProperty?.interestedIn,
        status: enq.status,
        priority: enq.priority,
        assignedToEmployee: enq.assignedToEmployee,
        createdAt: enq.createdAt,
        updatedAt: enq.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch women property enquiries",
      error: error.message
    });
  }
};

// Get my women property enquiries (Employee)
export const getMyWomenPropertyEnquiries = async (req, res) => {
  try {
    const employeeId = req.employee?._id;
    const {
      page = 1,
      limit = 20,
      status,
      interestedIn
    } = req.query;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Employee not found."
      });
    }

    const filter = {
      enquiryType: "women_property",
      assignedToEmployee: employeeId
    };
    if (status) filter.status = status;
    if (interestedIn) filter["womenProperty.interestedIn"] = interestedIn;

    const enquiries = await Enquiry.find(filter)
      .populate("userId", "fullName email phone")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const totalCount = await Enquiry.countDocuments(filter);

    res.status(200).json({
      success: true,
      message: "Your women property enquiries fetched successfully",
      enquiries: enquiries.map(enq => ({
        _id: enq._id,
        fullName: enq.fullName,
        email: enq.email,
        mobileNumber: enq.mobileNumber,
        interestedIn: enq.womenProperty?.interestedIn,
        status: enq.status,
        priority: enq.priority,
        adminNotes: enq.adminNotes,
        followUpDate: enq.followUpDate,
        createdAt: enq.createdAt,
        updatedAt: enq.updatedAt
      })),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch your women property enquiries",
      error: error.message
    });
  }
};

// Get enquiries assigned to employee (Employee with token)
export const getEmployeeEnquiries = async (req, res) => {
  try {
    const employeeId = req.employee?._id || req.user?._id;

    if (!employeeId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Employee authentication required."
      });
    }

    const {
      page = 1,
      limit = 20,
      status,
      priority,
      assignmentStatus = 'active'
    } = req.query;

    // Build filter for lead assignments
    const assignmentFilter = {
      employeeId: employeeId
    };

    if (assignmentStatus && assignmentStatus !== 'all') {
      assignmentFilter.status = assignmentStatus;
    }

    // Get all assignments for this employee with pagination
    const assignments = await LeadAssignment.find(assignmentFilter)
      .sort({ assignedDate: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('assignedBy', 'fullName email')
      .lean();

    const totalCount = await LeadAssignment.countDocuments(assignmentFilter);

    // Populate enquiry details based on type
    const populatedAssignments = await Promise.all(
      assignments.map(async (assignment) => {
        let enquiryDetails = null;

        try {
          // Handle different enquiry types
          if (assignment.enquiryType === 'Enquiry' || assignment.enquiryType === 'Inquiry') {
            enquiryDetails = await Enquiry.findById(assignment.enquiryId)
              .populate('userId', 'fullName email phone')
              .lean();
          } else if (assignment.enquiryType === 'ManualInquiry') {
            enquiryDetails = await ManualInquiry.findById(assignment.enquiryId)
              .lean();
          }

          // Apply additional filters if enquiry was found
          if (enquiryDetails) {
            // Filter by status if provided
            if (status && enquiryDetails.status !== status) {
              return null;
            }

            // Filter by priority if provided
            if (priority && enquiryDetails.priority !== priority) {
              return null;
            }
          }

        } catch (err) {
          console.error(`Error fetching enquiry ${assignment.enquiryId}:`, err);
        }

        return {
          assignmentId: assignment._id,
          enquiryId: assignment.enquiryId,
          enquiryType: assignment.enquiryType,
          enquiry: enquiryDetails,
          assignmentStatus: assignment.status,
          priority: assignment.priority,
          assignedDate: assignment.assignedDate,
          dueDate: assignment.dueDate,
          notes: assignment.notes,
          assignedBy: assignment.assignedBy
        };
      })
    );

    // Filter out null entries (failed to fetch or filtered out)
    const validAssignments = populatedAssignments.filter(a => a !== null && a.enquiry !== null);

    res.status(200).json({
      success: true,
      message: "Employee enquiries fetched successfully",
      data: validAssignments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasNext: page * limit < totalCount,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error in getEmployeeEnquiries:', error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch employee enquiries",
      error: error.message
    });
  }
};

// Create property management enquiry
export const createPropertyManagementEnquiry = async (req, res) => {
  try {
    const { fullName, mobileNumber, email, propertyId } = req.body;

    // Validation
    if (!fullName || !mobileNumber || !propertyId) {
      return res.status(400).json({
        message: "Missing required fields: fullName, mobileNumber, and propertyId are required"
      });
    }

    // Create enquiry
    const enquiryData = {
      fullName,
      mobileNumber,
      email: email || "",
      enquiryType: "property_management",
      propertyManagement: {
        propertyId
      },
      isGuestEnquiry: true,
      status: "pending",
      priority: "medium"
    };

    // Auto Employee Assignment (Round Robin)
    const employees = await Employee.find({ isActive: true });
    let assignedEmployeeId = null;

    if (employees && employees.length > 0) {
      const totalEnquiries = await Enquiry.countDocuments();
      const roundRobinIndex = totalEnquiries % employees.length;
      assignedEmployeeId = employees[roundRobinIndex]._id;

      enquiryData.assignedToEmployee = assignedEmployeeId;
      enquiryData.status = "in_progress";
    }

    const enquiry = new Enquiry(enquiryData);
    await enquiry.save();

    // Create a LeadAssignment to log it and allow it to show in My Leads
    if (assignedEmployeeId) {
      const assignmentDoc = new LeadAssignment({
        employeeId: assignedEmployeeId,
        enquiryId: enquiry._id,
        enquiryType: "Enquiry",
        status: "active",
        priority: enquiryData.priority || "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by system via Round Robin"
      });
      await assignmentDoc.save();
    }

    // Populate property details for response
    await enquiry.populate('propertyManagement.propertyId', 'customPropertyId propertyLocation propertyType price');

    res.status(201).json({
      success: true,
      message: "Property management enquiry submitted successfully",
      enquiry: {
        _id: enquiry._id,
        fullName: enquiry.fullName,
        mobileNumber: enquiry.mobileNumber,
        email: enquiry.email,
        enquiryType: enquiry.enquiryType,
        propertyDetails: enquiry.propertyManagement.propertyId,
        status: enquiry.status,
        createdAt: enquiry.createdAt
      }
    });
  } catch (error) {
    console.error("Property Management Enquiry Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create property management enquiry",
      error: error.message
    });
  }
};
