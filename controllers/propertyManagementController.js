import PropertyManagementRequest from "../models/PropertyManagementRequest.js";

export const createPropertyManagementRequest = async (req, res) => {
  try {
    const { name, email, countryCode, phone, city } = req.body;

    if (!name || !email || !phone || !city) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newRequest = await PropertyManagementRequest.create({
      name,
      email,
      countryCode,
      phone,
      city,
    });

    res.status(201).json({
      success: true,
      message: "Property management request submitted successfully",
      data: newRequest,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllPropertyManagementRequests = async (req, res) => {
  try {
    const requests = await PropertyManagementRequest.find().sort({ createdAt: -1 });

    if (requests.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No requests found",
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