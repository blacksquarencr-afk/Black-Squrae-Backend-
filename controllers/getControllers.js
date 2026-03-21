import Property from "../models/addProps.js";
import ListProperty from "../models/list-property.js";

// Get property by ID
export const getPropertyById = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id)
      .populate({
        path: "userId",
        select: "fullName email phone city state avatar",
      })
      .populate({
        path: "adminId",
        select: "fullName email phone",
      })
      .populate({
        path: "employeeId",
        select: "name email phone",
      });

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    res.status(200).json({
      success: true,
      data: property,
    });
  } catch (error) {
    console.error("Error fetching property by ID:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch property",
      error: error.message,
    });
  }
};

// Track property view and increment count
export const trackPropertyView = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id || null; // Optional user tracking

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    // Increment visit count
    property.visitCount += 1;

    // Track user visit if userId is available
    if (userId) {
      // Check if user already visited
      const alreadyVisited = property.visitedBy.some(
        (visit) => visit.userId && visit.userId.toString() === userId.toString()
      );

      // Add to visitedBy array if not already visited
      if (!alreadyVisited) {
        property.visitedBy.push({
          userId: userId,
          visitedAt: new Date(),
        });
      }
    }

    await property.save();

    res.status(200).json({
      success: true,
      message: "Property view tracked successfully",
      data: {
        propertyId: property._id,
        visitCount: property.visitCount,
        viewTracked: true
      }
    });
  } catch (error) {
    console.error("Error tracking property view:", error);
    res.status(500).json({
      success: false,
      message: "Failed to track property view",
      error: error.message,
    });
  }
};

// Get all properties
export const getAllProperties = async (req, res) => {
  try {
    const { exclusive, purpose, propertyType, residentialType, commercialType, userId } = req.query;

    // Build filter object
    let filter = {};

    if (userId) {
      filter.userId = userId;
    }

    if (exclusive === 'true') {
      filter.exclusive = true;
    }

    if (purpose) {
      filter.purpose = purpose;
    }

    if (propertyType) {
      filter.propertyType = propertyType;
    }

    if (residentialType) {
      filter.residentialType = residentialType;
    }

    if (commercialType) {
      filter.commercialType = commercialType;
    }

    // Fetch data and count with filter
    const properties = await Property.find(filter)
      .populate({
        path: "userId",
        select: "fullName email phone city state avatar",
      })
      .populate({
        path: "adminId",
        select: "fullName email phone",
      })
      .populate({
        path: "employeeId",
        select: "name email phone",
      })
      .populate({
        path: "builderId",
        select: "builderName builderImage",
      })
      .sort({ postedDate: -1 });

    const count = await Property.countDocuments(filter);

    // Defensive mapping to ensure required strings are never null/undefined for frontend
    const sanitizedProperties = properties.map(prop => {
      const p = prop.toObject();
      
      // Convert file system paths to full URL paths for images
      const convertPathToUrl = (path) => {
        if (!path) return "";
        // If already a full URL, return as is
        if (path.startsWith('http://') || path.startsWith('https://')) {
          return path;
        }
        // Extract filename from full path and create full URL
        const filename = path.split(/[/\\]/).pop();
        return `https://backend.blacksquare.estate/uploads/${filename}`;
      };
      
      const imageUrls = (p.photosAndVideo || []).map(convertPathToUrl);
      
      return {
        ...p,
        id: p._id?.toString() || "", // Virtual ID
        propertyTitle: p.propertyTitle || "",
        title: p.propertyTitle || "", // Alias
        description: p.description || "",
        propertyLocation: p.propertyLocation || "",
        location: p.propertyLocation || "", // Alias
        postedDate: p.postedDate || p.createdAt || new Date(),
        // Map userId to common frontend field names like 'owner'
        owner: p.userId ? {
          ...p.userId,
          name: p.userId.fullName || "User",
          fullName: p.userId.fullName || "User",
        } : (p.adminId ? { fullName: "Admin", name: "Admin" } : { fullName: "Unknown", name: "Unknown" }),
        // Map images with converted URLs
        images: imageUrls,
        mainImage: imageUrls[0] || "", // Alias for first image
      };
    });

    // Send combined response - keeping both formats for frontend compatibility
    res.status(200).json({
      success: true,
      totalProperties: count,
      count: count,
      data: sanitizedProperties,
      properties: sanitizedProperties, // Some frontend parts might expect 'properties' key
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch properties",
      error: error.message,
    });
  }
};





// Get properties added by other users
// export const getAllOtherProperties = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!userId) {
//       return res.status(400).json({ message: "Missing userId" });
//     }

//     // find all properties where userId != current user
//     const properties = await Property.find({
//       userId: { $ne: userId } // $ne = not equal
//     });

//     res.status(200).json(properties);
//   } catch (error) {
//     console.error("Get Other Users Properties Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Get all properties (both collections) for a particular user by userId
export const getPropertiesByUserId = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ success: false, message: "userId is required" });
    }

    // Fetch from both collections in parallel
    const [addProperties, listProperties] = await Promise.all([
      Property.find({ userId })
        .populate({ path: "userId", select: "fullName email phone city state avatar" })
        .populate({ path: "builderId", select: "builderName builderImage" })
        .sort({ postedDate: -1 }),
      ListProperty.find({ userId })
        .populate({ path: "userId", select: "fullName email phone city state avatar" })
        .populate({ path: "builder", select: "builderName builderImage" })
        .sort({ createdAt: -1 }),
    ]);

    // Tag source for frontend
    const taggedAdd = addProperties.map(p => ({ ...p.toObject(), source: "addProperty" }));
    const taggedList = listProperties.map(p => ({ ...p.toObject(), source: "listProperty" }));

    const allProperties = [...taggedAdd, ...taggedList];

    res.status(200).json({
      success: true,
      count: allProperties.length,
      addPropertiesCount: addProperties.length,
      listPropertiesCount: listProperties.length,
      data: allProperties,
    });
  } catch (error) {
    console.error("Error fetching properties by userId:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties", error: error.message });
  }
};

// Get all properties (both collections) by customUserId (e.g. USR-0006)
export const getPropertiesByCustomUserId = async (req, res) => {
  try {
    const { customUserId } = req.params;

    if (!customUserId) {
      return res.status(400).json({ success: false, message: "customUserId is required" });
    }

    const [addProperties, listProperties] = await Promise.all([
      Property.find({ customUserId })
        .populate({ path: "userId", select: "fullName email phone city state avatar customUserId" })
        .populate({ path: "builderId", select: "builderName builderImage" })
        .sort({ postedDate: -1 }),
      ListProperty.find({ customUserId })
        .populate({ path: "userId", select: "fullName email phone city state avatar customUserId" })
        .populate({ path: "builderId", select: "builderName builderImage" })
        .sort({ createdAt: -1 }),
    ]);

    const taggedAdd = addProperties.map(p => ({ ...p.toObject(), source: "addProperty" }));
    const taggedList = listProperties.map(p => ({ ...p.toObject(), source: "listProperty" }));
    const allProperties = [...taggedAdd, ...taggedList];

    res.status(200).json({
      success: true,
      customUserId,
      count: allProperties.length,
      addPropertiesCount: addProperties.length,
      listPropertiesCount: listProperties.length,
      data: allProperties,
    });
  } catch (error) {
    console.error("Error fetching properties by customUserId:", error);
    res.status(500).json({ success: false, message: "Failed to fetch properties", error: error.message });
  }
};

// Get properties by category

// Get properties added by other users excluding Rent/Lease
// export const getAllOtherProperties = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     if (!userId) {
//       return res.status(400).json({ message: "Missing userId" });
//     }

//     // Find all properties except:
//     // 1 Those created by the current user
//     // 2 Those with purpose = "Rent/Lease"
//     const properties = await Property.find({
//       userId: { $ne: userId },
//       purpose: { $ne: "Rent/Lease" }, // Exclude Rent/Lease
//     });

//     res.status(200).json({  count: properties.length , properties});
//   } catch (error) {
//     console.error("Get Other Users Properties Error:", error);
//     res.status(500).json({ message: "Server error", error: error.message });
//   }
// };

// Get properties added by other users excluding Rent/Lease with posted user details
export const getAllOtherProperties = async (req, res) => {
  try {
    // Check both user and employee authentication
    const userId = req.user?.id || req.employee?._id;

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }

    //  Find all properties except:
    // 1 Those created by the current user
    // 2 Those with purpose = "Rent/Lease"
    const properties = await Property.find({
      userId: { $ne: userId },
      purpose: { $ne: "Rent/Lease" },
    })
      .populate({
        path: "userId", // This will pull data from User model
        select: "fullName email phone city state avatar", // choose only useful fields
      })
      .sort({ createdAt: -1 }); // Optional: latest first

    if (!properties.length) {
      return res.status(404).json({ message: "No properties found" });
    }

    res.status(200).json({
      message: "Other users' properties fetched successfully",
      count: properties.length,
      data: properties,
    });
  } catch (error) {
    console.error("Get Other Users Properties Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



export const getPropertiesByCategory = async (req, res) => {
  try {
    const category = req.params.category.toLowerCase();
    let query = {};

    // Residential categories
    if (["apartment", "villa", "plot"].includes(category)) {
      query = { propertyType: "Residential", residentialType: category };
    }

    // Commercial categories
    if (["office", "shop", "warehouse"].includes(category)) {
      query = { propertyType: "Commercial", commercialType: category };
    }

    // Fetch properties
    const properties = await Property.find(query);

    // Count properties in this category
    const count = await Property.countDocuments(query);

    // Send response
    res.status(200).json({
      count,
      properties,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching category properties", error });
  }
};



// ===============================
// GET: Properties by Main Category
export const getPropertiesByMainCategory = async (req, res) => {
  try {
    const category = req.params.mainCategory.toLowerCase(); // e.g. residential or commercial

    // Validate category
    if (!["residential", "commercial"].includes(category)) {
      return res.status(400).json({ message: "Invalid category. Use 'Residential' or 'Commercial'." });
    }

    // Fetch properties by type
    const properties = await Property.find({ propertyType: category.charAt(0).toUpperCase() + category.slice(1) });

    // Count total properties by category
    const totalResidential = await Property.countDocuments({ propertyType: "Residential" });
    const totalCommercial = await Property.countDocuments({ propertyType: "Commercial" });

    // Response
    res.status(200).json({
      message: `${category} properties fetched successfully`,
      totalCount: properties.length,
      categoryCount: {
        residential: totalResidential,
        commercial: totalCommercial,
      },
      properties,
    });
  } catch (error) {
    console.error("Error fetching properties by category:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// Get counts per sub-category
export const getSubCategoryCounts = async (req, res) => {
  try {
    const counts = await Property.aggregate([
      {
        $group: {
          _id: {
            propertyType: "$propertyType",
            subCategory: {
              $cond: [
                { $eq: ["$propertyType", "Residential"] },
                "$residentialType",
                "$commercialType",
              ],
            },
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.propertyType",
          subCategories: {
            $push: { name: "$_id.subCategory", count: "$count" },
          },
        },
      },
    ]);

    const response = {
      Residential: [],
      Commercial: [],
    };

    counts.forEach((type) => {
      if (type._id === "Residential") response.Residential = type.subCategories;
      if (type._id === "Commercial") response.Commercial = type.subCategories;
    });

    res.status(200).json(response);
  } catch (error) {
    console.error("Sub-category count error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
