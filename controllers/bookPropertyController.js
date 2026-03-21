import BookPropertyEnquiry from "../models/bookPropertyEnquiry.js";
import Employee from "../models/employeeSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";

// Create new enquiry
export const createEnquiry = async (req, res) => {
  try {
    const { fullname, mobile, email } = req.body;

    if (!fullname || !mobile || !email) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // Auto Employee Assignment (Round Robin)
    const employees = await Employee.find({ isActive: true });
    let assignedEmployeeId = null;

    if (employees && employees.length > 0) {
      const totalEnquiries = await BookPropertyEnquiry.countDocuments();
      const roundRobinIndex = totalEnquiries % employees.length;
      assignedEmployeeId = employees[roundRobinIndex]._id;
    }

    const newEnquiry = await BookPropertyEnquiry.create({
      fullname,
      mobile,
      email,
      assignedToEmployee: assignedEmployeeId,
      priority: "medium"
    });

    // Create LeadAssignment
    if (assignedEmployeeId) {
      await LeadAssignment.create({
        employeeId: assignedEmployeeId,
        enquiryId: newEnquiry._id,
        enquiryType: "PropertyEnquiry",
        status: "active",
        priority: "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by system via Round Robin"
      });
    }

    res.status(201).json({
      success: true,
      message: "Property enquiry submitted successfully",
      data: newEnquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all enquiries (for admin)
export const getAllEnquiries = async (req, res) => {
  try {
    const enquiries = await BookPropertyEnquiry.find()
      .populate("assignedToEmployee", "name email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: enquiries.length,
      data: enquiries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};