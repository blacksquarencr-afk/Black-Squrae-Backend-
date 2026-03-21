import PaintingRequest from "../models/PaintingRequest.js";

// Create
export const createPaintingRequest = async (req, res) => {
  try {
    const {
      fullName,
      email,
      phone,
      city,
      propertyType,
      paintingType,
      additionalRequirements,
    } = req.body;

    if (!fullName || !email || !phone || !city || !propertyType || !paintingType) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be filled",
      });
    }

    const newRequest = await PaintingRequest.create({
      fullName,
      email,
      phone,
      city,
      propertyType,
      paintingType,
      additionalRequirements: additionalRequirements || "",
    });

    res.status(201).json({
      success: true,
      message: "Painting quotation request submitted successfully!",
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// Get All
export const getAllPaintingRequests = async (req, res) => {
  try {
    const requests = await PaintingRequest.find().sort({ createdAt: -1 });

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

// Get By ID
export const getPaintingRequestById = async (req, res) => {
  try {
    const request = await PaintingRequest.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found",
      });
    }

    res.status(200).json({
      success: true,
      data: request,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};