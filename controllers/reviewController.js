import Review from "../models/reviewSchema.js";
import Property from "../models/addProps.js";
import User from "../models/user.js";
import mongoose from "mongoose";

// Post a review on a property
export const postReview = async (req, res) => {
  try {
    const {
      propertyId,
      rating,
      title,
      comment,
      photos,
      aspects,
    } = req.body;

    // Validate required fields
    if (!propertyId || !rating || !comment) {
      return res.status(400).json({
        success: false,
        message: "Property ID, rating, and comment are required.",
      });
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Get user info
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // Check if user already reviewed this property
    const existingReview = await Review.findOne({
      property: propertyId,
      user: userId,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "You have already reviewed this property. You can update your existing review.",
      });
    }

    // Create review
    const review = new Review({
      property: propertyId,
      user: userId,
      rating,
      title: title || "",
      comment,
      photos: photos || [],
      aspects: aspects || {},
    });

    await review.save();

    // Populate user details for response
    await review.populate("user", "fullName avatar");

    res.status(201).json({
      success: true,
      message: "Review posted successfully.",
      data: review,
    });
  } catch (error) {
    console.error("Error posting review:", error);
    res.status(500).json({
      success: false,
      message: "Error posting review.",
      error: error.message,
    });
  }
};

// Get review count for a property
export const getReviewCount = async (req, res) => {
  try {
    const { propertyId } = req.params;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required.",
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    // Get total review count
    const totalReviews = await Review.countDocuments({
      property: propertyId,
      isApproved: true,
    });

    // Get rating distribution
    const ratingDistribution = await Review.aggregate([
      {
        $match: {
          property: new mongoose.Types.ObjectId(propertyId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: "$rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
    ]);

    // Calculate average rating
    const avgRatingResult = await Review.aggregate([
      {
        $match: {
          property: new mongoose.Types.ObjectId(propertyId),
          isApproved: true,
        },
      },
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating =
      avgRatingResult.length > 0
        ? parseFloat(avgRatingResult[0].averageRating.toFixed(1))
        : 0;

    // Format rating distribution
    const distribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    ratingDistribution.forEach((item) => {
      distribution[item._id] = item.count;
    });

    res.status(200).json({
      success: true,
      data: {
        propertyId,
        totalReviews,
        averageRating,
        ratingDistribution: distribution,
      },
    });
  } catch (error) {
    console.error("Error getting review count:", error);
    res.status(500).json({
      success: false,
      message: "Error getting review count.",
      error: error.message,
    });
  }
};

// Get all reviews for a property
export const getPropertyReviews = async (req, res) => {
  try {
    const { propertyId } = req.params;
    const { page = 1, limit = 10, sortBy = "createdAt", order = "desc" } = req.query;

    if (!propertyId) {
      return res.status(400).json({
        success: false,
        message: "Property ID is required.",
      });
    }

    // Check if property exists
    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found.",
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOrder = order === "asc" ? 1 : -1;

    // Build sort object
    const sortObj = {};
    sortObj[sortBy] = sortOrder;

    // Get reviews
    const reviews = await Review.find({
      property: propertyId,
      isApproved: true,
    })
      .populate("user", "fullName avatar")
      .sort(sortObj)
      .limit(parseInt(limit))
      .skip(skip);

    // Get total count
    const totalReviews = await Review.countDocuments({
      property: propertyId,
      isApproved: true,
    });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting property reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error getting property reviews.",
      error: error.message,
    });
  }
};

// Update a review
export const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, title, comment, photos, aspects } = req.body;

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only update your own reviews.",
      });
    }

    // Validate rating if provided
    if (rating && (rating < 1 || rating > 5)) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5.",
      });
    }

    // Update fields
    if (rating) review.rating = rating;
    if (title !== undefined) review.title = title;
    if (comment) review.comment = comment;
    if (photos) review.photos = photos;
    if (aspects) review.aspects = { ...review.aspects, ...aspects };

    await review.save();
    await review.populate("user", "fullName avatar");

    res.status(200).json({
      success: true,
      message: "Review updated successfully.",
      data: review,
    });
  } catch (error) {
    console.error("Error updating review:", error);
    res.status(500).json({
      success: false,
      message: "Error updating review.",
      error: error.message,
    });
  }
};

// Delete a review
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    // Find review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Check if user owns this review
    if (review.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own reviews.",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting review.",
      error: error.message,
    });
  }
};

// Get user's own reviews
export const getMyReviews = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const reviews = await Review.find({ user: userId })
      .populate("property", "propertyLocation propertyTitle photosAndVideo price")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const totalReviews = await Review.countDocuments({ user: userId });

    res.status(200).json({
      success: true,
      data: {
        reviews,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalReviews / parseInt(limit)),
          totalReviews,
          limit: parseInt(limit),
        },
      },
    });
  } catch (error) {
    console.error("Error getting user reviews:", error);
    res.status(500).json({
      success: false,
      message: "Error getting user reviews.",
      error: error.message,
    });
  }
};

// Mark review as helpful
export const markReviewHelpful = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const userId = req.user?._id || req.user?.id;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User authentication required.",
      });
    }

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found.",
      });
    }

    // Check if user already marked this as helpful
    const alreadyMarked = review.helpfulBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyMarked) {
      // Remove from helpful
      review.helpfulBy = review.helpfulBy.filter(
        (id) => id.toString() !== userId.toString()
      );
      review.helpfulCount = Math.max(0, review.helpfulCount - 1);
    } else {
      // Add to helpful
      review.helpfulBy.push(userId);
      review.helpfulCount += 1;
    }

    await review.save();

    res.status(200).json({
      success: true,
      message: alreadyMarked
        ? "Review unmarked as helpful."
        : "Review marked as helpful.",
      data: {
        helpfulCount: review.helpfulCount,
        isMarkedHelpful: !alreadyMarked,
      },
    });
  } catch (error) {
    console.error("Error marking review as helpful:", error);
    res.status(500).json({
      success: false,
      message: "Error marking review as helpful.",
      error: error.message,
    });
  }
};

// Get review statistics (Admin)
export const getReviewStats = async (req, res) => {
  try {
    const totalReviews = await Review.countDocuments();
    const approvedReviews = await Review.countDocuments({ isApproved: true });
    const pendingReviews = await Review.countDocuments({ isApproved: false });
    const verifiedReviews = await Review.countDocuments({ isVerified: true });

    // Average rating across all reviews
    const avgRatingResult = await Review.aggregate([
      {
        $group: {
          _id: null,
          averageRating: { $avg: "$rating" },
        },
      },
    ]);

    const averageRating =
      avgRatingResult.length > 0
        ? parseFloat(avgRatingResult[0].averageRating.toFixed(2))
        : 0;

    // Recent reviews
    const recentReviews = await Review.find()
      .populate("user", "fullName avatar")
      .populate("property", "propertyLocation propertyTitle")
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalReviews,
        approvedReviews,
        pendingReviews,
        verifiedReviews,
        averageRating,
        recentReviews,
      },
    });
  } catch (error) {
    console.error("Error getting review stats:", error);
    res.status(500).json({
      success: false,
      message: "Error getting review stats.",
      error: error.message,
    });
  }
};
