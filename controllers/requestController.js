// controllers/requestController.js
import ServiceRequest from "../models/ServiceRequest.js"; // ✔ capital S
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";

export const createServiceRequest = async (req, res) => {
  try {
    const { name, email, countryCode, phone, city } = req.body;

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newRequest = await ServiceRequest.create({
      name,
      email,
      countryCode,
      phone,
      city,
    });

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      newRequest._id,
      'ServiceRequest',
      'medium',
      'Auto-assigned to Team Leader via Round Robin'
    );

    if (assignment) {
      newRequest.assignedTo = assignment.employeeId;
      await newRequest.save();
    }

    res.status(201).json({
      success: true,
      message: "Service request submitted successfully",
      data: newRequest,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllServiceRequests = async (req, res) => {
  try {
    const requests = await ServiceRequest.find().populate('assignedTo', 'name email').sort({ createdAt: -1 });

    console.log("Requests fetched:", requests); // ✅ debugging

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No services found"
      });
    }

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};