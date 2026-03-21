import Inquiry from "../models/inquirySchema.js";
import Property from "../models/addProps.js";
import ManualInquiry from "../models/manualInquirySchema.js";
import User from "../models/user.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";
import { sendPushNotification } from "../utils/sendNotification.js";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";
import xlsx from "xlsx";
import fs from "fs";

//  Add new Inquiry (prevent duplicates)
// export const addInquiry = async (req, res) => {
//   try {
//     const buyerId = req.user.id; // logged-in user
//     const { propertyId, fullName, email, contactNumber } = req.body;

//     // 1 Validation
//     if (!propertyId || !fullName || !email || !contactNumber) {
//       return res.status(400).json({ message: "All required fields must be filled" });
//     }

//     // 2 Find property
//     const property = await Property.findById(propertyId);
//     if (!property) {
//       return res.status(404).json({ message: "Property not found" });
//     }

//     // 3 Prevent owner from sending inquiry to own property
//     if (property.userId.toString() === buyerId) {
//       return res.status(400).json({ message: "You cannot inquire about your own property" });
//     }

//     // 4 Check if inquiry already exists (buyer → same property)
//     const existingInquiry = await Inquiry.findOne({ buyerId, propertyId });
//     if (existingInquiry) {
//       return res.status(400).json({
//         message: "You have already submitted an inquiry for this property.",
//         alreadyInquired: true,
//       });
//     }

//     // 5 Create new inquiry
//     const inquiry = new Inquiry({
//       propertyId,
//       buyerId,
//       ownerId: property.userId, // property owner
//       fullName,
//       email,
//       contactNumber,
//     });

//     await inquiry.save();

//     // 6 Response
//     res.status(201).json({
//       message: "Inquiry submitted successfully",
//       inquiry,
//     });
//   } catch (error) {
//     console.error("Add Inquiry Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

export const addInquiry = async (req, res) => {
  try {
    const buyerId = req.user?.id || req.employee?._id || null; // Logged-in user/employee or null for guest
    const { propertyId, fullName, email, contactNumber } = req.body;

    // 1️⃣ Validation
    if (!propertyId || !fullName || !email || !contactNumber) {
      return res
        .status(400)
        .json({ message: "All required fields must be filled" });
    }

    // 2️⃣ Find property
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // 3️⃣ Prevent owner from sending inquiry to own property (only if logged in)
    if (buyerId && property.userId && property.userId.toString() === buyerId) {
      return res
        .status(400)
        .json({ message: "You cannot inquire about your own property" });
    }

    // 4️⃣ Check if inquiry already exists (only for logged-in users)
    if (buyerId) {
      const existingInquiry = await Inquiry.findOne({ buyerId, propertyId });
      if (existingInquiry) {
        return res.status(400).json({
          message: "You have already submitted an inquiry for this property.",
          alreadyInquired: true,
        });
      }
    }

    // 5️⃣ Create new inquiry
    const inquiry = new Inquiry({
      propertyId,
      buyerId, // Will be null for guest users
      ownerId: property.userId || null, // property owner (can be null)
      fullName,
      email,
      contactNumber,
    });

    await inquiry.save();

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      inquiry._id,
      'Inquiry',
      'medium',
      'Auto-assigned to Team Leader via Round Robin'
    );

    if (assignment) {
      inquiry.assignedTo = assignment.employeeId;
      inquiry.assignmentStatus = 'assigned';
      await inquiry.save();
      console.log(`✅ Inquiry ${inquiry._id} assigned to Team Leader`);
    }

    // 6️⃣ Send Push Notification to Property Owner
    let fcmTokenFound = false;
    let notificationStatus = "not_sent";

    const owner = await User.findById(property.userId);

    if (owner) {
      if (owner.fcmToken) {
        fcmTokenFound = true;

        // Determine which type field to show
        const propertyTypeDetail =
          property.propertyType === "Residential"
            ? property.residentialType
            : property.commercialType;

        const title = "New Property Inquiry 🏠";
        const body = `You received a new inquiry for your property in ${property.propertyLocation}.
Property Type: ${property.propertyType} (${propertyTypeDetail})
From: ${fullName}
Email: ${email}
Contact: ${contactNumber}`;

        const data = {
          type: "property_inquiry",
          propertyLocation: property.propertyLocation,
          propertyType: property.propertyType,
          propertyTypeDetail,
          fullName,
          email,
          contactNumber,
        };

        try {
          await sendPushNotification(owner.fcmToken, title, body, data);
          notificationStatus = "sent";
          console.log(
            `✅ Notification sent to owner (${owner._id}) for property at ${property.propertyLocation}`
          );
        } catch (err) {
          console.error("❌ Notification Send Error:", err);
          notificationStatus = "failed";
        }
      } else {
        console.warn(
          `⚠️ No FCM token found for owner (${owner._id}) - cannot send notification`
        );
      }
    }

    // 7️⃣ Final Response
    res.status(201).json({
      message: "Inquiry submitted successfully",
      inquiry,
      fcmTokenFound,
      notificationStatus,
    });
  } catch (error) {
    console.error("Add Inquiry Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


//  Delete Inquiry
export const deleteInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const buyerId = req.user?.id || req.employee?._id;

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({ message: "Inquiry not found" });
    }

    // only the buyer who created it can delete it
    if (inquiry.buyerId.toString() !== buyerId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to delete this inquiry" });
    }

    await Inquiry.findByIdAndDelete(id);
    res.status(200).json({ message: "Inquiry deleted successfully" });
  } catch (error) {
    console.error("Delete Inquiry Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//  Get Enquiries with filters and populated data
export const getEnquiries = async (req, res) => {
  try {
    const { buyerId, ownerId, propertyId, status, assignedTo, assignmentStatus, propertyLocation } = req.query;

    //  Step 1: Build dynamic filter object
    const filter = {};
    if (buyerId) filter.buyerId = buyerId;
    if (ownerId) filter.ownerId = ownerId;
    if (propertyId) filter.propertyId = propertyId;
    if (status) filter.status = status;
    if (assignedTo) filter.assignedTo = assignedTo;
    if (assignmentStatus) filter.assignmentStatus = assignmentStatus;

    //  Step 2: Fetch enquiries with full populated data (no pagination limits)
    let enquiries = await Inquiry.find(filter)
      .populate("buyerId", "fullName email phone avatar city state")
      .populate("ownerId", "fullName email phone avatar city state")
      .populate("assignedTo", "name email phone")
      .populate("propertyId")
      .sort({ createdAt: -1 });

    //  Step 2.5: Filter by property location if provided
    if (propertyLocation) {
      enquiries = enquiries.filter(
        (enquiry) => 
          enquiry.propertyId && 
          enquiry.propertyId.propertyLocation && 
          enquiry.propertyId.propertyLocation.toLowerCase().includes(propertyLocation.toLowerCase())
      );
    }

    //  Step 3: Add assignment information to each enquiry
    const enquiriesWithAssignment = await Promise.all(
      enquiries.map(async (enquiry) => {
        // Find active assignment for this enquiry
        const assignment = await LeadAssignment.findOne({
          enquiryId: enquiry._id,
          enquiryType: 'Inquiry',
          status: { $in: ['active', 'pending', 'in-progress'] }
        }).populate('employeeId', 'name email');

        return {
          ...enquiry.toObject(),
          propertyDetails: enquiry.propertyId ? {
            _id: enquiry.propertyId._id,
            propertyLocation: enquiry.propertyId.propertyLocation,
            propertyType: enquiry.propertyId.propertyType,
            residentialType: enquiry.propertyId.residentialType,
            commercialType: enquiry.propertyId.commercialType,
            price: enquiry.propertyId.price,
            bhk: enquiry.propertyId.bhk,
            area: enquiry.propertyId.area,
            city: enquiry.propertyId.city,
            state: enquiry.propertyId.state,
            propertyPurpose: enquiry.propertyId.propertyPurpose,
            images: enquiry.propertyId.images
          } : null,
          assignment: assignment ? {
            employeeId: assignment.employeeId._id,
            employeeName: assignment.employeeId.name,
            employeeEmail: assignment.employeeId.email,
            status: assignment.status,
            assignedDate: assignment.assignedDate,
            priority: assignment.priority
          } : null
        };
      })
    );

    const totalCount = await Inquiry.countDocuments(filter);

    //  Step 4: Return response
    res.status(200).json({
      message: "Enquiries fetched successfully",
      count: enquiriesWithAssignment.length,
      total: totalCount,
      data: enquiriesWithAssignment,
    });
  } catch (error) {
    console.error(" Error fetching enquiries:", error);
    res.status(500).json({
      message: "Server error while fetching enquiries",
      error: error.message,
    });
  }
};

// manual add enquiry (admin use)

// ===========================
//  Create Manual Inquiry
// ===========================
export const createManualInquiry = async (req, res) => {
  try {
    const {
      s_No,
      clientName,
      contactNumber,
      ClientCode,
      ProjectCode,
      productType,
      location,
      date,
      caseStatus,
      source,
      majorComments,
      address,
      weekOrActionTaken,
      actionPlan,
      referenceBy,
    } = req.body;

    // Enhanced validation with auto-generation for optional fields
    const errors = [];
    if (!s_No) errors.push("Serial Number (s_No) is required");
    if (!clientName || clientName.trim() === '') errors.push("Client Name is required");
    if (!contactNumber || contactNumber.trim() === '') errors.push("Contact Number is required");
    if (!location || location.trim() === '') errors.push("Location is required");
    if (!date) errors.push("Date is required");

    // Auto-generate missing fields
    const finalClientCode = ClientCode && ClientCode.trim() !== '' 
                           ? ClientCode.trim() 
                           : `CLI_${contactNumber.toString().slice(-4)}`;
    
    const finalProjectCode = ProjectCode && ProjectCode.trim() !== '' 
                            ? ProjectCode.trim() 
                            : `PRJ_${String(s_No).padStart(3, '0')}`;
    
    const finalProductType = productType && productType.trim() !== '' 
                            ? productType.trim() 
                            : 'General';

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors,
        note: "Client Code, Project Code, and Product Type will be auto-generated if not provided"
      });
    }

    // Clean and validate contact number
    const cleanedContactNumber = contactNumber.replace(/\D/g, ''); // Remove non-digits
    if (cleanedContactNumber.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Invalid contact number format",
        details: "Contact number must be at least 10 digits"
      });
    }

    // Check for duplicate ClientCode or ContactNumber+ClientName combination
    const existingInquiry = await ManualInquiry.findOne({
      $or: [
        { ClientCode: finalClientCode },
        { contactNumber: cleanedContactNumber, clientName: clientName.trim() }
      ]
    });

    if (existingInquiry) {
      return res.status(400).json({
        success: false,
        message: "Duplicate inquiry found",
        details: existingInquiry.ClientCode === finalClientCode 
          ? "An inquiry with this Client Code already exists"
          : "An inquiry with this contact number and client name already exists"
      });
    }

    // Validate caseStatus
    const validStatuses = ["Open", "Closed", "Week One", "Week Two", "Unassigned"];
    const finalCaseStatus = caseStatus && validStatuses.includes(caseStatus) ? caseStatus : "Unassigned";

    //  Create a new manual inquiry
    const newInquiry = new ManualInquiry({
      s_No: parseInt(s_No),
      clientName: clientName.trim(),
      contactNumber: cleanedContactNumber,
      ClientCode: finalClientCode,
      ProjectCode: finalProjectCode,
      productType: finalProductType,
      location: location.trim(),
      date: new Date(date),
      caseStatus: finalCaseStatus,
      source: source ? source.trim() : 'Manual Entry',
      majorComments: majorComments ? majorComments.trim() : '',
      address: address ? address.trim() : '',
      weekOrActionTaken: weekOrActionTaken ? weekOrActionTaken.trim() : '',
      actionPlan: actionPlan ? actionPlan.trim() : '',
      referenceBy: referenceBy ? referenceBy.trim() : '',
    });

    const savedInquiry = await newInquiry.save();

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      savedInquiry._id,
      'ManualInquiry',
      'medium',
      'Auto-assigned to Team Leader via Round Robin (Manual Inquiry)'
    );

    if (assignment) {
      savedInquiry.assignedToEmployee = assignment.employeeId;
      savedInquiry.caseStatus = "Open"; // Change from Unassigned to Open
      await savedInquiry.save();
      console.log(`✅ Manual inquiry ${savedInquiry._id} assigned to Team Leader`);
    }

    res.status(201).json({
      success: true,
      message: "Manual inquiry created successfully",
      data: savedInquiry,
    });
  } catch (error) {
    console.error("Error creating manual inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create manual inquiry",
      error: error.message,
      details: "Please check all required fields and try again"
    });
  }
};

// ===========================
//  Get All Manual Inquiries
// ===========================
export const getAllManualInquiries = async (req, res) => {
  try {
    const inquiries = await ManualInquiry.find().sort({ createdAt: -1 });

    // Add assignment information to each manual inquiry
    const inquiriesWithAssignment = await Promise.all(
      inquiries.map(async (inquiry) => {
        // Find active assignment for this manual inquiry
        const assignment = await LeadAssignment.findOne({
          enquiryId: inquiry._id,
          enquiryType: 'ManualInquiry',
          status: { $in: ['active', 'pending', 'in-progress'] }
        }).populate('employeeId', 'name email');

        return {
          ...inquiry.toObject(),
          assignment: assignment ? {
            employeeId: assignment.employeeId._id,
            employeeName: assignment.employeeId.name,
            employeeEmail: assignment.employeeId.email,
            status: assignment.status,
            assignedDate: assignment.assignedDate,
            priority: assignment.priority
          } : null
        };
      })
    );

    res.status(200).json({
      success: true,
      total: inquiriesWithAssignment.length,
      data: inquiriesWithAssignment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch manual inquiries",
      error: error.message,
    });
  }
};

// ===========================
//  Get Manual Inquiry by ID
// ===========================
export const getManualInquiryById = async (req, res) => {
  try {
    const { id } = req.params;
    const inquiry = await ManualInquiry.findById(id);

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Manual inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      data: inquiry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch manual inquiry",
      error: error.message,
    });
  }
};

// ===========================
//  Update Manual Inquiry
// ===========================
export const updateManualInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    // Clean and validate data before updating
    if (updatedData.caseStatus) {
      const validStatuses = ["Open", "Closed", "Week One", "Week Two", "Unassigned"];
      if (!validStatuses.includes(updatedData.caseStatus)) {
        updatedData.caseStatus = "Unassigned";
      }
    }

    if (updatedData.contactNumber) {
      updatedData.contactNumber = updatedData.contactNumber.replace(/\D/g, '');
      if (updatedData.contactNumber.length < 10) {
        return res.status(400).json({
          success: false,
          message: "Invalid contact number format",
          details: "Contact number must be at least 10 digits"
        });
      }
    }

    // Trim string fields
    const stringFields = ['clientName', 'ClientCode', 'ProjectCode', 'productType', 'location', 'source', 'majorComments', 'address', 'weekOrActionTaken', 'actionPlan', 'referenceBy'];
    stringFields.forEach(field => {
      if (updatedData[field]) {
        updatedData[field] = updatedData[field].trim();
      }
    });

    const updatedInquiry = await ManualInquiry.findByIdAndUpdate(
      id,
      updatedData,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Manual inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manual inquiry updated successfully",
      data: updatedInquiry,
    });
  } catch (error) {
    console.error("Error updating manual inquiry:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update manual inquiry",
      error: error.message,
    });
  }
};

// ===========================
//  Bulk Fix Manual Inquiries
// ===========================
export const bulkFixManualInquiries = async (req, res) => {
  try {
    const { action } = req.body; // 'clean', 'validate', 'remove-duplicates'

    const results = {
      processed: 0,
      updated: 0,
      failed: 0,
      removed: 0,
      errors: []
    };

    if (action === 'clean') {
      // Clean and standardize existing data
      const inquiries = await ManualInquiry.find({});
      
      for (const inquiry of inquiries) {
        try {
          let updated = false;
          const updates = {};

          // Clean contact number
          if (inquiry.contactNumber) {
            const cleanedNumber = inquiry.contactNumber.replace(/\D/g, '');
            if (cleanedNumber !== inquiry.contactNumber) {
              updates.contactNumber = cleanedNumber;
              updated = true;
            }
          }

          // Validate and fix case status
          const validStatuses = ["Open", "Closed", "Week One", "Week Two", "Unassigned"];
          if (inquiry.caseStatus && !validStatuses.includes(inquiry.caseStatus)) {
            updates.caseStatus = "Unassigned";
            updated = true;
          }

          // Trim all string fields
          const stringFields = ['clientName', 'ClientCode', 'ProjectCode', 'productType', 'location', 'source', 'majorComments', 'address', 'weekOrActionTaken', 'actionPlan', 'referenceBy'];
          stringFields.forEach(field => {
            if (inquiry[field] && typeof inquiry[field] === 'string') {
              const trimmed = inquiry[field].trim();
              if (trimmed !== inquiry[field]) {
                updates[field] = trimmed;
                updated = true;
              }
            }
          });

          if (updated) {
            await ManualInquiry.findByIdAndUpdate(inquiry._id, updates);
            results.updated++;
          }

          results.processed++;
        } catch (error) {
          results.failed++;
          results.errors.push({
            id: inquiry._id,
            clientName: inquiry.clientName,
            error: error.message
          });
        }
      }
    } else if (action === 'remove-duplicates') {
      // Find and remove duplicate inquiries
      const duplicates = await ManualInquiry.aggregate([
        {
          $group: {
            _id: {
              ClientCode: "$ClientCode",
              contactNumber: "$contactNumber",
              clientName: "$clientName"
            },
            ids: { $push: "$_id" },
            count: { $sum: 1 }
          }
        },
        {
          $match: {
            count: { $gt: 1 }
          }
        }
      ]);

      for (const duplicate of duplicates) {
        try {
          // Keep the first one, remove the rest
          const idsToRemove = duplicate.ids.slice(1);
          await ManualInquiry.deleteMany({ _id: { $in: idsToRemove } });
          results.removed += idsToRemove.length;
          results.processed += duplicate.count;
        } catch (error) {
          results.failed++;
          results.errors.push({
            duplicateGroup: duplicate._id,
            error: error.message
          });
        }
      }
    } else if (action === 'validate') {
      // Validate all records and report issues
      const inquiries = await ManualInquiry.find({});
      
      for (const inquiry of inquiries) {
        const issues = [];
        
        if (!inquiry.clientName || inquiry.clientName.trim() === '') issues.push('Missing client name');
        if (!inquiry.contactNumber || inquiry.contactNumber.trim() === '') issues.push('Missing contact number');
        if (!inquiry.ClientCode || inquiry.ClientCode.trim() === '') issues.push('Missing client code');
        if (!inquiry.ProjectCode || inquiry.ProjectCode.trim() === '') issues.push('Missing project code');
        if (!inquiry.productType || inquiry.productType.trim() === '') issues.push('Missing product type');
        if (!inquiry.location || inquiry.location.trim() === '') issues.push('Missing location');
        
        if (inquiry.contactNumber) {
          const cleanedNumber = inquiry.contactNumber.replace(/\D/g, '');
          if (cleanedNumber.length < 10) issues.push('Invalid contact number format');
        }

        const validStatuses = ["Open", "Closed", "Week One", "Week Two", "Unassigned"];
        if (inquiry.caseStatus && !validStatuses.includes(inquiry.caseStatus)) {
          issues.push('Invalid case status');
        }

        if (issues.length > 0) {
          results.errors.push({
            id: inquiry._id,
            clientName: inquiry.clientName,
            issues: issues
          });
          results.failed++;
        } else {
          results.updated++;
        }
        
        results.processed++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Bulk ${action} operation completed`,
      results: results
    });

  } catch (error) {
    console.error("Bulk fix error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to perform bulk fix operation",
      error: error.message
    });
  }
};

// ===========================
//  Delete Manual Inquiry
// ===========================
export const deleteManualInquiry = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInquiry = await ManualInquiry.findByIdAndDelete(id);

    if (!deletedInquiry) {
      return res.status(404).json({
        success: false,
        message: "Manual inquiry not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Manual inquiry deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete manual inquiry",
      error: error.message,
    });
  }
};

// ===========================
//  Assign Inquiry to Employee
// ===========================
export const assignInquiry = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "Employee ID is required"
      });
    }

    const inquiry = await Inquiry.findById(id);
    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    inquiry.assignedTo = employeeId;
    inquiry.assignmentStatus = "assigned";
    await inquiry.save();

    const updatedInquiry = await Inquiry.findById(id)
      .populate("buyerId", "fullName email phone")
      .populate("ownerId", "fullName email phone")
      .populate("assignedTo", "name email phone")
      .populate("propertyId");

    res.status(200).json({
      success: true,
      message: "Inquiry assigned successfully",
      data: updatedInquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to assign inquiry",
      error: error.message
    });
  }
};

// ===========================
//  Update Inquiry Status
// ===========================
export const updateInquiryStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { assignmentStatus } = req.body;

    if (!assignmentStatus) {
      return res.status(400).json({
        success: false,
        message: "Assignment status is required"
      });
    }

    const inquiry = await Inquiry.findByIdAndUpdate(
      id,
      { assignmentStatus },
      { new: true, runValidators: true }
    )
      .populate("buyerId", "fullName email phone")
      .populate("ownerId", "fullName email phone")
      .populate("assignedTo", "name email phone")
      .populate("propertyId");

    if (!inquiry) {
      return res.status(404).json({
        success: false,
        message: "Inquiry not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Inquiry status updated successfully",
      data: inquiry
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update inquiry status",
      error: error.message
    });
  }
};

// Bulk Upload Manual Inquiries from Excel
export const bulkUploadManualInquiries = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Please upload an Excel file (.xlsx or .xls format)"
      });
    }

    // Ensure inquiries directory exists
    const inquiriesDir = "uploads/inquiries";
    if (!fs.existsSync(inquiriesDir)) {
      fs.mkdirSync(inquiriesDir, { recursive: true });
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = xlsx.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        message: "Excel file is empty or has no valid data"
      });
    }

    let success_count = 0;
    let failed_count = 0;
    const failed_rows = [];
    const successful_records = [];

    // Process each row (row numbers start from 2 in Excel - row 1 is header)
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const excelRowNumber = i + 2; // Excel row number (accounting for header)
      
      try {
        // Enhanced field mapping for your exact Excel format
        const inquiryData = {
          s_No: parseInt(row['S_No'] || row['S No'] || (i + 1)),
          clientName: String(row['Client Name'] || row['clientName'] || '').trim(),
          contactNumber: String(row['Contact Number'] || row['contactNumber'] || '').trim(),
          
          // Auto-generate Client Code if missing using contact number or row number
          ClientCode: String(row['Client Code'] || row['ClientCode'] || 
                     (row['Contact Number'] ? `CLI_${row['Contact Number'].toString().slice(-4)}` : `CLI_${String(i + 1).padStart(3, '0')}`)).trim(),
          
          // Auto-generate Project Code if missing
          ProjectCode: String(row['Project Code'] || row['ProjectCode'] || 
                      `PRJ_${String(i + 1).padStart(3, '0')}`).trim(),
          
          // Auto-generate Product Type if missing
          productType: String(row['Product Type'] || row['ProductType'] || 'General').trim(),
          
          location: String(row['Location'] || row['location'] || '').trim(),
          
          // Use current date if Date column is empty
          date: row['Date'] || row['date'] || new Date(),
          
          caseStatus: String(row['Case Status'] || row['caseStatus'] || 'Unassigned').trim(),
          source: String(row['Source'] || row['source'] || 'Excel Upload').trim(),
          majorComments: String(row['Major Comments'] || row['majorComments'] || '').trim(),
          address: String(row['Address'] || row['address'] || '').trim(),
          weekOrActionTaken: String(row['Week/Action'] || row['weekOrActionTaken'] || row['Week/Action Taken'] || '').trim(),
          actionPlan: String(row['Action Plan'] || row['actionPlan'] || '').trim(),
          referenceBy: String(row['Reference By'] || row['referenceBy'] || row['Reference'] || '').trim()
        };

        // Validate: Skip empty rows
        if (!inquiryData.clientName && !inquiryData.contactNumber) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: "Empty row - Client name and contact number both missing"
          });
          continue;
        }

        // Validate: Check essential fields
        const missingFields = [];
        if (!inquiryData.clientName || inquiryData.clientName === '') missingFields.push('Client Name');
        if (!inquiryData.contactNumber || inquiryData.contactNumber === '') missingFields.push('Contact Number');
        if (!inquiryData.location || inquiryData.location === '') missingFields.push('Location');

        if (missingFields.length > 0) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: `Missing required fields: ${missingFields.join(', ')}`
          });
          continue;
        }

        // Validate and fix caseStatus
        const validStatuses = ["Open", "Closed", "Week One", "Week Two", "Unassigned"];
        if (!validStatuses.includes(inquiryData.caseStatus)) {
          inquiryData.caseStatus = "Unassigned";
        }

        // Validate: Contact number format
        inquiryData.contactNumber = inquiryData.contactNumber.replace(/\D/g, ''); // Remove non-digits
        if (inquiryData.contactNumber.length < 10) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: "Invalid contact number format (must be at least 10 digits)"
          });
          continue;
        }

        // Validate: Contact number should not exceed 15 digits (international standard)
        if (inquiryData.contactNumber.length > 15) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: "Contact number too long (maximum 15 digits)"
          });
          continue;
        }

        // Ensure auto-generated fields have values
        if (!inquiryData.ClientCode || inquiryData.ClientCode === 'CLI_') {
          inquiryData.ClientCode = `CLI_${inquiryData.contactNumber.slice(-4)}`;
        }
        if (!inquiryData.ProjectCode || inquiryData.ProjectCode === 'PRJ_') {
          inquiryData.ProjectCode = `PRJ_${String(i + 1).padStart(3, '0')}`;
        }
        if (!inquiryData.productType || inquiryData.productType === '') {
          inquiryData.productType = 'General';
        }

        // Parse date properly
        if (inquiryData.date && inquiryData.date !== '') {
          try {
            inquiryData.date = new Date(inquiryData.date);
            if (isNaN(inquiryData.date.getTime())) {
              inquiryData.date = new Date();
            }
          } catch (dateErr) {
            inquiryData.date = new Date();
          }
        } else {
          inquiryData.date = new Date();
        }

        // Validate: Check for duplicate by ClientCode
        const existingByClientCode = await ManualInquiry.findOne({ 
          ClientCode: inquiryData.ClientCode 
        });

        if (existingByClientCode) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: `Client Code already exists: ${inquiryData.ClientCode}`
          });
          continue;
        }

        // Validate: Check for duplicate by Contact Number + Client Name
        const existingByContact = await ManualInquiry.findOne({
          contactNumber: inquiryData.contactNumber,
          clientName: inquiryData.clientName
        });

        if (existingByContact) {
          failed_count++;
          failed_rows.push({
            row: excelRowNumber,
            reason: "Contact number already exists for this client name"
          });
          continue;
        }

        // Create new manual inquiry
        const newInquiry = new ManualInquiry(inquiryData);
        await newInquiry.save();

        // Auto-assign to Team Leader using Round Robin
        try {
          const assignment = await autoAssignToTeamLeader(
            newInquiry._id,
            'ManualInquiry',
            'medium',
            'Auto-assigned to Team Leader via Round Robin (Bulk Upload)'
          );

          if (assignment) {
            newInquiry.assignedToEmployee = assignment.employeeId;
            newInquiry.caseStatus = "Open"; // Change from Unassigned to Open
            await newInquiry.save();
          }
        } catch (assignmentError) {
          console.error(`❌ Error assigning inquiry ${newInquiry._id}:`, assignmentError);
          // Don't fail the whole upload if assignment fails
        }

        success_count++;
        successful_records.push({
          row: excelRowNumber,
          clientName: inquiryData.clientName,
          clientCode: inquiryData.ClientCode,
          id: newInquiry._id
        });

      } catch (error) {
        failed_count++;
        failed_rows.push({
          row: excelRowNumber,
          reason: error.message || "Failed to process row"
        });
      }
    }

    // Clean up uploaded file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError.message);
    }

    // Determine status code and response
    const statusCode = success_count > 0 ? 200 : 400;
    const totalRows = data.length;
    
    return res.status(statusCode).json({
      success: success_count > 0,
      message: `Bulk upload completed. ${success_count} records inserted successfully, ${failed_count} failed.`,
      total_rows: totalRows,
      success_count,
      failed_count,
      failed_rows,
      // Include successful records for reference
      successful_records
    });

  } catch (error) {
    // Clean up uploaded file if exists
    try {
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (cleanupError) {
      console.error("Error cleaning up file:", cleanupError.message);
    }
    
    console.error("Bulk upload error:", error);
    
    return res.status(500).json({
      success: false,
      message: "Server error during bulk upload",
      error: error.message,
      details: "Please check the Excel file format and try again"
    });
  }
};
