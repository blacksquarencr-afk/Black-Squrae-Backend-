import RentReceipt from "../models/rentReceiptModel.js";
import Employee from "../models/employeeSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";

// ✅ Create Rent Receipt
export const createRentReceipt = async (req, res) => {
  try {
    const {
      fullName,
      email,
      mobileNumber,
      propertyAddress,
      landlordName,
      tenantName,
      monthlyRent,
      receiptType,
      paymentMonth,
      paymentYear,
      notes
    } = req.body;

    // Basic Validation
    if (
      !fullName ||
      !email ||
      !mobileNumber ||
      !propertyAddress ||
      !landlordName ||
      !tenantName ||
      !monthlyRent ||
      !paymentMonth ||
      !paymentYear
    ) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled"
      });
    }

    // Auto Employee Assignment (Round Robin)
    const employees = await Employee.find({ isActive: true });
    let assignedEmployeeId = null;
    let assignmentDoc = null;

    if (employees && employees.length > 0) {
      const totalReceipts = await RentReceipt.countDocuments();
      const roundRobinIndex = totalReceipts % employees.length;
      assignedEmployeeId = employees[roundRobinIndex]._id;
    }

    const rentReceipt = new RentReceipt({
      fullName,
      email,
      mobileNumber,
      propertyAddress,
      landlordName,
      tenantName,
      monthlyRent,
      receiptType,
      paymentMonth,
      paymentYear,
      notes,
      assignedToEmployee: assignedEmployeeId,
      priority: "medium"
    });

    await rentReceipt.save();

    // Create LeadAssignment for rent receipt
    if (assignedEmployeeId) {
      assignmentDoc = new LeadAssignment({
        employeeId: assignedEmployeeId,
        enquiryId: rentReceipt._id,
        enquiryType: "RentReceipt",
        status: "active",
        priority: "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by system via Round Robin"
      });
      await assignmentDoc.save();
    }

    res.status(201).json({
      success: true,
      message: "Rent receipt generated successfully",
      data: rentReceipt
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate rent receipt",
      error: error.message
    });
  }
};



// ✅ Get All Rent Receipts (Admin)
export const getAllRentReceipts = async (req, res) => {
  try {
    const receipts = await RentReceipt.find()
      .populate("assignedToEmployee", "name email")
      .populate("assignedBy", "fullName email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: receipts.length,
      data: receipts
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch rent receipts",
      error: error.message
    });
  }
};



// ✅ Get Single Receipt
export const getRentReceiptById = async (req, res) => {
  try {
    const receipt = await RentReceipt.findById(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    res.status(200).json({
      success: true,
      data: receipt
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching receipt",
      error: error.message
    });
  }
};



// ✅ Delete Receipt
export const deleteRentReceipt = async (req, res) => {
  try {
    const receipt = await RentReceipt.findByIdAndDelete(req.params.id);

    if (!receipt) {
      return res.status(404).json({
        success: false,
        message: "Receipt not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Receipt deleted successfully"
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete receipt",
      error: error.message
    });
  }
};