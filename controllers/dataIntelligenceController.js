import DataIntelligenceRequest from "../models/DataIntelligenceRequest.js";

export const createDataRequest = async (req, res) => {
  try {
    const newRequest = await DataIntelligenceRequest.create(req.body);

    res.status(201).json({
      success: true,
      data: newRequest,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const getAllDataRequests = async (req, res) => {
  try {
    const requests = await DataIntelligenceRequest.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: requests.length,
      data: requests,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDataRequestById = async (req, res) => {
  try {
    const request = await DataIntelligenceRequest.findById(req.params.id);

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
    res.status(500).json({ success: false, message: error.message });
  }
};