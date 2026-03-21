import Contact from "../models/contactSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";
import Employee from "../models/employeeSchema.js";
import nodemailer from "nodemailer";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";

// Email validation helper
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// Create new inquiry
export const createContact = async (req, res) => {
    try {
        const { full_name, email_address, phone_number, subject, property_type, budget_range, location, message } = req.body;

        if (!full_name || !phone_number) {
            return res.status(400).json({ message: "Please fill all required fields." });
        }

        if (email_address && !isValidEmail(email_address)) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        const newContact = new Contact({
            full_name,
            email_address,
            phone_number,
            subject,
            property_type,
            budget_range,
            location,
            message
        });

        await newContact.save();

        // Auto-assign to Team Leader using Round Robin
        const assignment = await autoAssignToTeamLeader(
            newContact._id,
            'Contact',
            'medium',
            'Auto-assigned to Team Leader via Round Robin'
        );

        if (assignment) {
            newContact.assignedTo = assignment.employeeId;
            newContact.assignmentStatus = 'assigned';
            await newContact.save();
        }

        // Optional: send email to admin (only if email_address is provided)
        if (email_address) {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.EMAIL_USER,
                        pass: process.env.EMAIL_PASS
                    }
                });

                const mailOptions = {
                    from: email_address,
                    to: process.env.ADMIN_EMAIL,
                    subject: `New Inquiry: ${subject || "No Subject"}`,
                    html: `
                        <h2>New Contact Inquiry</h2>
                        <p><strong>Full Name:</strong> ${full_name}</p>
                        <p><strong>Email:</strong> ${email_address}</p>
                        <p><strong>Phone:</strong> ${phone_number}</p>
                        <p><strong>Subject:</strong> ${subject || "N/A"}</p>
                        <p><strong>Property Type:</strong> ${property_type || "N/A"}</p>
                        <p><strong>Budget Range:</strong> ${budget_range || "N/A"}</p>
                        <p><strong>Location:</strong> ${location || "N/A"}</p>
                        <p><strong>Message:</strong><br>${message}</p>
                    `
                };

                await transporter.sendMail(mailOptions);
            } catch (emailError) {
                console.error("Email sending failed:", emailError);
                // Don't fail the entire request if email fails
            }
        }

        res.status(201).json({ message: "Inquiry submitted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to submit inquiry." });
    }
};

// Get all inquiries (admin)
export const getAllContacts = async (req, res) => {
    try {
        const { assignmentStatus, location, page = 1, limit = 100 } = req.query;
        
        // Build filter
        const filter = {};
        if (assignmentStatus) {
            filter.assignmentStatus = assignmentStatus;
        }
        if (location) {
            filter.location = location;
        }
        
        const skip = (page - 1) * limit;
        
        const contacts = await Contact.find(filter)
            .populate('assignedTo', 'name email phone')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Contact.countDocuments(filter);
        
        res.status(200).json({
            success: true,
            data: contacts,
            pagination: {
                currentPage: parseInt(page),
                total,
                totalPages: Math.ceil(total / limit),
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch inquiries." });
    }
};

// Get inquiries of logged-in user
export const getMyContacts = async (req, res) => {
    try {
        const userEmail = req.user.email;
        const contacts = await Contact.find({ email_address: userEmail }).sort({ createdAt: -1 });

        if (contacts.length === 0) {
            return res.status(404).json({ message: "No inquiries found for this user." });
        }

        res.status(200).json(contacts);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to fetch user inquiries." });
    }
};

// Update inquiry by ID (user can only update their own inquiry)
export const updateContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email; // from token
        const updateData = req.body;

        if (updateData.email_address && updateData.email_address !== userEmail) {
            return res.status(403).json({ message: "You cannot change your email address." });
        }

        if (updateData.email_address && !isValidEmail(updateData.email_address)) {
            return res.status(400).json({ message: "Invalid email address." });
        }

        const contact = await Contact.findById(id);

        if (!contact) {
            return res.status(404).json({ message: "Inquiry not found." });
        }

        if (contact.email_address !== userEmail) {
            return res.status(403).json({ message: "You are not allowed to update this inquiry." });
        }

        const updatedContact = await Contact.findByIdAndUpdate(id, updateData, { new: true });
        res.status(200).json({ message: "Inquiry updated successfully!", updatedContact });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to update inquiry." });
    }
};

// Delete inquiry by ID (user can only delete their own inquiry)
export const deleteContact = async (req, res) => {
    try {
        const { id } = req.params;
        const userEmail = req.user.email;

        const contact = await Contact.findById(id);
        if (!contact) {
            return res.status(404).json({ message: "Inquiry not found." });
        }

        if (contact.email_address !== userEmail) {
            return res.status(403).json({ message: "You are not allowed to delete this inquiry." });
        }

        await Contact.findByIdAndDelete(id);
        res.status(200).json({ message: "Inquiry deleted successfully!" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Failed to delete inquiry." });
    }
};

// Assign contact to an employee
export const assignContactToEmployee = async (req, res) => {
    try {
        const { contactId, employeeId, priority = 'medium', dueDate, notes } = req.body;
        const adminId = req.user?.id || req.user?._id;

        // Validate required fields
        if (!contactId || !employeeId) {
            return res.status(400).json({
                success: false,
                message: "Contact ID and Employee ID are required"
            });
        }

        // Check if contact exists
        const contact = await Contact.findById(contactId);
        if (!contact) {
            return res.status(404).json({
                success: false,
                message: "Contact not found"
            });
        }

        // Check if employee exists
        const employee = await Employee.findById(employeeId).populate('role');
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        // Check if contact is already assigned (active assignment)
        const existingAssignment = await LeadAssignment.findOne({
            enquiryId: contactId,
            enquiryType: 'Contact',
            status: { $in: ['active', 'pending', 'in-progress'] }
        }).populate('employeeId', 'name email');

        if (existingAssignment) {
            return res.status(400).json({
                success: false,
                message: `This contact is already assigned to ${existingAssignment.employeeId.name}`
            });
        }

        // Create assignment
        const assignment = new LeadAssignment({
            enquiryId: contactId,
            enquiryType: 'Contact',
            employeeId,
            assignedBy: adminId,
            status: 'active',
            priority,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            notes: notes || ''
        });

        await assignment.save();

        // Update contact status
        await Contact.findByIdAndUpdate(
            contactId,
            { 
                assignedTo: employeeId,
                assignmentStatus: 'assigned'
            },
            { new: true }
        );

        res.status(201).json({
            success: true,
            message: "Contact assigned successfully",
            data: {
                assignment: await assignment.populate('employeeId assignedBy'),
                contact
            }
        });

    } catch (error) {
        console.error("Error assigning contact:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign contact",
            error: error.message
        });
    }
};

// Assign multiple contacts to an employee
export const assignMultipleContactsToEmployee = async (req, res) => {
    try {
        const { employeeId, contactIds, priority = 'medium', dueDate, notes } = req.body;
        const adminId = req.user?.id || req.user?._id;

        // Validate required fields
        if (!employeeId || !contactIds || !Array.isArray(contactIds) || contactIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Employee ID and contact IDs array are required"
            });
        }

        // Check if employee exists
        const employee = await Employee.findById(employeeId);
        if (!employee) {
            return res.status(404).json({
                success: false,
                message: "Employee not found"
            });
        }

        const assignments = [];
        const errors = [];

        for (const contactId of contactIds) {
            try {
                // Check if contact exists
                const contact = await Contact.findById(contactId);
                if (!contact) {
                    errors.push({
                        contactId,
                        error: "Contact not found"
                    });
                    continue;
                }

                // Check if already assigned
                const existingAssignment = await LeadAssignment.findOne({
                    enquiryId: contactId,
                    enquiryType: 'Contact',
                    status: { $in: ['active', 'pending', 'in-progress'] }
                });

                if (existingAssignment) {
                    errors.push({
                        contactId,
                        error: "Contact already assigned to an employee"
                    });
                    continue;
                }

                // Create assignment
                const assignment = new LeadAssignment({
                    enquiryId: contactId,
                    enquiryType: 'Contact',
                    employeeId,
                    assignedBy: adminId,
                    status: 'active',
                    priority,
                    dueDate: dueDate ? new Date(dueDate) : undefined,
                    notes: notes || ''
                });

                await assignment.save();
                assignments.push(assignment);

                // Update contact
                await Contact.findByIdAndUpdate(
                    contactId,
                    { 
                        assignedTo: employeeId,
                        assignmentStatus: 'assigned'
                    }
                );

            } catch (error) {
                errors.push({
                    contactId,
                    error: error.message
                });
            }
        }

        res.status(200).json({
            success: true,
            message: `${assignments.length} contacts assigned successfully`,
            data: {
                assignments,
                errors,
                employee: {
                    id: employee._id,
                    name: employee.name,
                    email: employee.email
                }
            }
        });

    } catch (error) {
        console.error("Error assigning contacts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to assign contacts",
            error: error.message
        });
    }
};

// Get contacts assigned to an employee
export const getEmployeeContacts = async (req, res) => {
    try {
        const employeeId = req.params.employeeId || req.user?.id;
        const { status = 'active', page = 1, limit = 10 } = req.query;

        const assignments = await LeadAssignment.find({
            employeeId,
            enquiryType: 'Contact',
            status
        })
        .populate('employeeId', 'name email phone')
        .populate('assignedBy', 'fullName email')
        .sort({ assignedDate: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

        // Populate contact details
        const populatedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const contact = await Contact.findById(assignment.enquiryId)
                    .populate('assignedTo', 'name email');
                return {
                    ...assignment.toObject(),
                    enquiry: contact
                };
            })
        );

        const total = await LeadAssignment.countDocuments({
            employeeId,
            enquiryType: 'Contact',
            status
        });

        res.status(200).json({
            success: true,
            data: {
                assignments: populatedAssignments,
                pagination: {
                    currentPage: parseInt(page),
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting employee contacts:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get employee contacts",
            error: error.message
        });
    }
};

// Get all contact assignments (admin view)
export const getAllContactAssignments = async (req, res) => {
    try {
        const { employeeId, status, page = 1, limit = 10 } = req.query;

        const filter = { enquiryType: 'Contact' };
        if (employeeId) filter.employeeId = employeeId;
        if (status) filter.status = status;

        const assignments = await LeadAssignment.find(filter)
            .populate('employeeId', 'name email phone')
            .populate('assignedBy', 'fullName email')
            .sort({ assignedDate: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        // Populate contact details
        const populatedAssignments = await Promise.all(
            assignments.map(async (assignment) => {
                const contact = await Contact.findById(assignment.enquiryId);
                return {
                    ...assignment.toObject(),
                    enquiry: contact
                };
            })
        );

        const total = await LeadAssignment.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: {
                assignments: populatedAssignments,
                pagination: {
                    currentPage: parseInt(page),
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page < Math.ceil(total / limit),
                    hasPrev: page > 1
                }
            }
        });

    } catch (error) {
        console.error("Error getting contact assignments:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get contact assignments",
            error: error.message
        });
    }
};

// Update contact assignment status
export const updateContactAssignmentStatus = async (req, res) => {
    try {
        const { assignmentId } = req.params;
        const { status, notes } = req.body;

        const validStatuses = ['active', 'completed', 'cancelled', 'in-progress'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: "Invalid status. Must be: active, in-progress, completed, or cancelled"
            });
        }

        const assignment = await LeadAssignment.findByIdAndUpdate(
            assignmentId,
            { 
                status,
                ...(notes && { notes })
            },
            { new: true }
        ).populate('employeeId assignedBy enquiryId');

        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        // Update contact assignment status
        if (assignment.enquiryType === 'Contact') {
            const contactStatus = status === 'completed' ? 'completed' : status === 'cancelled' ? 'closed' : 'in-progress';
            await Contact.findByIdAndUpdate(assignment.enquiryId, { assignmentStatus: contactStatus });
        }

        res.status(200).json({
            success: true,
            message: "Assignment status updated successfully",
            data: assignment
        });

    } catch (error) {
        console.error("Error updating assignment status:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update assignment status",
            error: error.message
        });
    }
};

// Unassign contact from employee
export const unassignContact = async (req, res) => {
    try {
        const { assignmentId } = req.params;

        // Find and delete the assignment
        const assignment = await LeadAssignment.findByIdAndDelete(assignmentId);
        if (!assignment) {
            return res.status(404).json({
                success: false,
                message: "Assignment not found"
            });
        }

        // Reset contact status
        await Contact.findByIdAndUpdate(
            assignment.enquiryId,
            {
                assignedTo: null,
                assignmentStatus: 'unassigned'
            }
        );

        res.status(200).json({
            success: true,
            message: "Contact unassigned successfully"
        });

    } catch (error) {
        console.error("Error unassigning contact:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unassign contact",
            error: error.message
        });
    }
};
