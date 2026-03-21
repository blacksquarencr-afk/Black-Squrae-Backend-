import YoutubeVideo from "../models/youtubeVideo.js";

// ====================== ADD YOUTUBE VIDEO ======================
export const addYoutubeVideo = async (req, res) => {
  try {
    const { title, videoLink } = req.body;

    // Validation
    if (!title || !videoLink) {
      return res.status(400).json({
        success: false,
        message: "Title and video link are required",
      });
    }

    // Determine who is uploading (admin or employee)
    const uploadedBy = req.admin?.id || req.employee?._id;
    const uploaderType = req.admin ? 'Admin' : 'Employee';

    // Create new YouTube video entry
    const newVideo = new YoutubeVideo({
      title,
      videoLink,
      uploadedBy,
      uploaderType,
    });

    await newVideo.save();

    return res.status(201).json({
      success: true,
      message: "YouTube video added successfully",
      data: {
        _id: newVideo._id,
        title: newVideo.title,
        videoLink: newVideo.videoLink,
        videoId: newVideo.videoId,
        uploaderType: newVideo.uploaderType,
        createdAt: newVideo.createdAt,
      },
    });
  } catch (error) {
    console.error("Add YouTube Video Error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to add YouTube video",
    });
  }
};

// ====================== GET ALL YOUTUBE VIDEOS ======================
export const getAllYoutubeVideos = async (req, res) => {
  try {
    const { page = 1, limit = 10, isActive } = req.query;

    const filter = {};
    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const videos = await YoutubeVideo.find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .select('-__v');

    const count = await YoutubeVideo.countDocuments(filter);

    return res.status(200).json({
      success: true,
      data: videos,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      totalVideos: count,
    });
  } catch (error) {
    console.error("Get YouTube Videos Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch YouTube videos",
    });
  }
};

// ====================== GET SINGLE YOUTUBE VIDEO ======================
export const getYoutubeVideoById = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await YoutubeVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "YouTube video not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: video,
    });
  } catch (error) {
    console.error("Get YouTube Video Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch YouTube video",
    });
  }
};

// ====================== UPDATE YOUTUBE VIDEO ======================
export const updateYoutubeVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, videoLink, isActive } = req.body;

    const video = await YoutubeVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "YouTube video not found",
      });
    }

    // Update fields
    if (title) video.title = title;
    if (videoLink) video.videoLink = videoLink;
    if (isActive !== undefined) video.isActive = isActive;

    await video.save();

    return res.status(200).json({
      success: true,
      message: "YouTube video updated successfully",
      data: video,
    });
  } catch (error) {
    console.error("Update YouTube Video Error:", error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    
    return res.status(500).json({
      success: false,
      message: "Failed to update YouTube video",
    });
  }
};

// ====================== DELETE YOUTUBE VIDEO ======================
export const deleteYoutubeVideo = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await YoutubeVideo.findByIdAndDelete(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "YouTube video not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "YouTube video deleted successfully",
    });
  } catch (error) {
    console.error("Delete YouTube Video Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete YouTube video",
    });
  }
};

// ====================== TOGGLE VIDEO STATUS ======================
export const toggleVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const video = await YoutubeVideo.findById(id);

    if (!video) {
      return res.status(404).json({
        success: false,
        message: "YouTube video not found",
      });
    }

    video.isActive = !video.isActive;
    await video.save();

    return res.status(200).json({
      success: true,
      message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`,
      data: {
        _id: video._id,
        isActive: video.isActive,
      },
    });
  } catch (error) {
    console.error("Toggle Video Status Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to toggle video status",
    });
  }
};
