import Property from "../models/addProps.js";
import Builder from "../models/builderSchema.js";
import NodeGeocoder from "node-geocoder";
import User from "../models/user.js";
import Employee from "../models/employeeSchema.js";
import axios from "axios"; // We'll use axios to call geocoding API
import { sendPushNotification } from "../utils/sendNotification.js";
import dotenv from "dotenv";
import Counter from "../models/counterModel.js";

dotenv.config();


// Configure geocoder (OpenStreetMap is free)
const geocoder = NodeGeocoder({
  provider: "openstreetmap",
});


export const addProperty = async (req, res) => {
  try {

    // ⭐ NEW LOGIC START: Determine Entity Type and IDs ⭐
    let userId = null;
    let adminId = null;
    let employeeId = null;
    let entity; // Stores the full User, Admin, or Employee document

    // First check if it's an employee token (has permissions array)
    if (req.user.permissions) {
      // Case 1: Employee Posted
      entity = await Employee.findById(req.user.id);
      if (!entity) return res.status(404).json({ message: "Employee not found" });

      employeeId = entity._id;
      adminId = null;
      userId = null;
    } else {
      // Determine if it's Admin (check for fields present in the Admin model, like email or fullName)
      const isPostedByAdmin = !!req.user.email && !!req.user.fullName;

      if (isPostedByAdmin) {
        // Case 2: Admin Posted (req.user is the Admin document)
        entity = req.user;
        adminId = entity._id; // Use Mongoose's standard _id
        userId = null;
        employeeId = null;
      } else {
        // Case 3: User/Agent Posted (req.user is likely { id: '...' } or { _id: '...' })
        const postedUserId = req.user.id || req.user._id; // Get ID from whichever middleware set it

        // Fetch full User document (needed for serialId and myListingsCount logic below)
        entity = await User.findById(postedUserId);
        if (!entity) return res.status(404).json({ message: "User not found" });

        userId = entity._id;
        adminId = null;
        employeeId = null;
      }
    }

    // Destructure fields from req.body (original logic)
    const {
      propertyLocation,
      propertyTitle,
      areaDetails,
      availability,
      price,
      description,
      furnishingStatus,
      parking,
      purpose,
      propertyType,
      commercialType,
      residentialType,
      contactNumber,
      bedrooms,
      bathrooms,
      balconies,
      floorNumber,
      totalFloors,
      facingDirection,
      flooringType,
      noticePeriod,
      foodIncluded,
      pgType,
      sharingType,
      amenities,
      recentUpdates,
      ageOfProperty,
      balconyType,
      washroomType,
      pantryCafeteria,
      builderId,
      exclusive,
    } = req.body;

    // DEBUG: Log exclusive value
    console.log("🔍 [DEBUG] exclusive from req.body:", exclusive, "| type:", typeof exclusive, "| full body keys:", Object.keys(req.body));

    // ================== CUSTOM ID GENERATION LOGIC (UPDATED) ==================

    let customPropertyId;

    if (adminId) {
      // ⭐ ADMIN ID LOGIC ⭐
      const adminPrefix = `A-${adminId.toString().slice(-4)}`;
      let nextAdminListingIndex = (await Property.countDocuments({ adminId: adminId })) + 1;
      customPropertyId = `${adminPrefix}-${nextAdminListingIndex}`;

      // Check for duplicates and increment if necessary
      while (await Property.findOne({ customPropertyId })) {
        nextAdminListingIndex++;
        customPropertyId = `${adminPrefix}-${nextAdminListingIndex}`;
      }

    } else if (employeeId) {
      // ⭐ EMPLOYEE ID LOGIC ⭐
      const employeePrefix = `E-${employeeId.toString().slice(-4)}`;
      let nextEmployeeListingIndex = (await Property.countDocuments({ employeeId: employeeId })) + 1;
      customPropertyId = `${employeePrefix}-${nextEmployeeListingIndex}`;

      // Check for duplicates and increment if necessary
      while (await Property.findOne({ customPropertyId })) {
        nextEmployeeListingIndex++;
        customPropertyId = `${employeePrefix}-${nextEmployeeListingIndex}`;
      }

    } else {
      // ⭐ USER ID LOGIC (Existing logic, now uses 'entity' which is the User document) ⭐
      let user = entity;

      // 1. Check and create serialId if missing (User only)
      if (user.serialId === undefined || user.serialId === null) {
        console.log(`Generating serialId for user: ${userId}`);

        const counter = await Counter.findOneAndUpdate(
          { name: "userSerialId" },   // ✅ CORRECT
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );

        const newSerialId = counter.seq;

        user = await User.findByIdAndUpdate(
          userId,
          { serialId: newSerialId },
          { new: true }
        );

        if (!user) return res.status(500).json({ message: "Error updating user serial ID." });
      }

      // 2. Generate Custom Property ID for User
      const nextListingIndex = user.myListingsCount + 1;
      const userPrefix = `S${user.serialId}`;
      customPropertyId = `${userPrefix}-${nextListingIndex}`;
    }
    // ⭐ NEW LOGIC END ⭐

    // ================== VALIDATIONS (Original logic remains) ==================

    const isResidentialPlot = propertyType === "Residential" && residentialType === "Plot";
    const isLand = propertyType === "Land";
    const isAgriculturalLand = residentialType === "Agricultural Land";
    const isCommercial = propertyType === "Commercial";
    const isPlotOrLand = isResidentialPlot || isLand || isAgriculturalLand;

    // --- Property Size Validations ---
    // Bedrooms and bathrooms not required for Plot/Land/Commercial or when explicitly set to 0
    if (!isPlotOrLand && !isCommercial && Number(bedrooms) !== 0) {
      if (!bedrooms || isNaN(Number(bedrooms)) || Number(bedrooms) < 1) return res.status(400).json({ message: "Invalid or missing bedrooms (min 1)" });
      if (!bathrooms || isNaN(Number(bathrooms)) || Number(bathrooms) < 1) return res.status(400).json({ message: "Invalid or missing bathrooms (min 1)" });
    }

    if (!isPlotOrLand) {
      const validBalconies = [0, 1, 2, 3];
      if (!isCommercial && (balconies === undefined || !validBalconies.includes(Number(balconies)))) {
        return res.status(400).json({ message: "Invalid balconies (must be 0, 1, 2, or 3+)" });
      }
      if (!floorNumber || isNaN(Number(floorNumber)) || Number(floorNumber) < 0) return res.status(400).json({ message: "Invalid or missing floorNumber" });
      if (!totalFloors || isNaN(Number(totalFloors)) || Number(totalFloors) < 1) return res.status(400).json({ message: "Invalid or missing totalFloors" });
      if (Number(floorNumber) > Number(totalFloors)) return res.status(400).json({ message: "floorNumber cannot be greater than totalFloors" });
    }

    const validDirections = ["North", "South", "East", "West"];
    if (!facingDirection || !validDirections.includes(facingDirection)) return res.status(400).json({ message: "Invalid facingDirection" });

    // --- Type and Conditional Validations ---
    if (propertyType === "Commercial") {
      const validCommercialTypes = ["Office Space", "Shop", "Warehouse", "Industrial"];
      if (!commercialType || !validCommercialTypes.includes(commercialType)) return res.status(400).json({ message: "Invalid commercialType" });
    } else if (propertyType === "Residential" || propertyType === "Land") {
      const validResidentialTypes = ["Apartment", "Villa", "Plot", "PG/Hostel", "Agricultural Land", "Builder Floor"];
      if (!residentialType || !validResidentialTypes.includes(residentialType)) return res.status(400).json({ message: "Invalid residentialType" });
    }

    // --- Purpose Validations ---
    if (purpose === "Rent/Lease" || purpose === "Paying Guest") {
      const validNoticePeriods = ["15 Days", "1 Month", "2 Months"];
      if (!noticePeriod || !validNoticePeriods.includes(noticePeriod)) return res.status(400).json({ message: "Invalid noticePeriod" });
    }

    if (purpose === "Paying Guest") {
      const validFoodOptions = ["Yes", "No", "Optional"];
      if (!foodIncluded || !validFoodOptions.includes(foodIncluded)) return res.status(400).json({ message: "Invalid foodIncluded" });

      const validPgTypes = ["Boys PG", "Girls PG", "Co-living"];
      if (!pgType || !validPgTypes.includes(pgType)) return res.status(400).json({ message: "Invalid pgType" });

      const validSharingTypes = ["Single Room", "Double Sharing", "Triple Sharing"];
      if (!sharingType || !validSharingTypes.includes(sharingType)) return res.status(400).json({ message: "Invalid sharingType" });
    }

    if (!contactNumber || typeof contactNumber !== "string" || !/^\+?[1-9]\d{9,14}$/.test(contactNumber))
      return res.status(400).json({ message: "Invalid contactNumber" });

    // ================== GEOCODING ==================
    let coordinates = [0, 0];

    // Check if coordinates are provided in request body
    if (req.body.longitude && req.body.latitude) {
      coordinates = [parseFloat(req.body.longitude), parseFloat(req.body.latitude)];
    } else {
      // Fallback to geocoding from address
      const geoRes = await geocoder.geocode(propertyLocation);
      if (geoRes.length > 0) coordinates = [geoRes[0].longitude, geoRes[0].latitude];
    }

    // ================== FILES ==================
    let photoPaths = [];
    let brochurePath = "";

    if (Array.isArray(req.files)) {
      // Handle upload.any()
      photoPaths = req.files.filter(f => f.fieldname === 'photosAndVideo').map(f => f.path);
      brochurePath = req.files.find(f => f.fieldname === 'brochure')?.path || "";
    } else if (req.files) {
      // Handle upload.fields()
      photoPaths = req.files.photosAndVideo?.map(file => file.path) || [];
      brochurePath = req.files.brochure?.[0]?.path || "";
    }

    // ================== PREPARE PROPERTY DATA (Updated fields for Admin tracking) ==================
    const propertyData = {
      userId, // Null if Admin or Employee posted
      customUserId: entity?.customUserId || "", // Custom readable user ID
      adminId, // Null if User or Employee posted
      employeeId, // Null if User or Admin posted
      builderId: builderId || null, // Builder ID if property is from a builder
      isPostedByAdmin: !!adminId, // True if Admin posted
      isPostedByEmployee: !!employeeId, // True if Employee posted
      customPropertyId,
      propertyLocation,
      propertyTitle: propertyTitle || "",
      geoLocation: { type: "Point", coordinates },
      areaDetails: (areaDetails && !isNaN(parseFloat(String(areaDetails).replace(/[^\d.]/g, ''))))
        ? parseFloat(String(areaDetails).replace(/[^\d.]/g, ''))
        : 0,

      // Added NEW fields (use 0 for Plot/Land/Commercial properties)
      bedrooms: (isPlotOrLand || isCommercial) ? 0 : Number(bedrooms),
      bathrooms: (isPlotOrLand || isCommercial) ? 0 : Number(bathrooms),
      facingDirection,

      // Conditional fields based on Plot/Commercial/Land
      ...(!isPlotOrLand ? {
        balconies: isCommercial ? 0 : Number(balconies),
        floorNumber: Number(floorNumber),
        totalFloors: Number(totalFloors),
      } : {
        balconies: 0,
        floorNumber: 0,
        totalFloors: 0
      }),

      // Flooring Type (optional)
      ...(flooringType ? { flooringType } : {}),

      availability,
      price: Number(price),
      description,
      photosAndVideo: photoPaths,
      brochure: brochurePath,
      furnishingStatus,
      parking,
      purpose,

      // Conditional fields based on Purpose
      ...(purpose === "Rent/Lease" || purpose === "Paying Guest" ? { noticePeriod } : {}),
      ...(purpose === "Paying Guest" ? { foodIncluded, pgType, sharingType } : {}),

      propertyType,
      ...(isCommercial ? { commercialType } : { residentialType }),
      contactNumber,

      // Amenities (optional array)
      ...(amenities ? { amenities: Array.isArray(amenities) ? amenities : JSON.parse(amenities) } : {}),

      // Recent Updates (optional array)
      ...(recentUpdates ? { recentUpdates: Array.isArray(recentUpdates) ? recentUpdates : JSON.parse(recentUpdates) } : {}),

      // New fields
      ...(ageOfProperty ? { ageOfProperty } : {}),
      ...(balconyType ? { balconyType } : {}),
      ...(washroomType ? { washroomType } : {}),
      ...(pantryCafeteria ? { pantryCafeteria } : {}),

      // New Launch field
      isNewLaunch: req.body.isNewLaunch === true || req.body.isNewLaunch === "true",
      exclusive: exclusive === true || exclusive === "true",
    };

    // ================== SAVE PROPERTY ==================
    const property = new Property(propertyData);
    await property.save();

    // ⭐ UPDATED: Increment user's myListingsCount and add to myListings ONLY IF a User posted it ⭐
    if (userId && !adminId && !employeeId) {
      await User.findByIdAndUpdate(userId, {
        $inc: { myListingsCount: 1 },
        $addToSet: { myListings: property._id }
      });
    }

    // ⭐ AUTO-INCREMENT BUILDER COUNTS ⭐
    if (builderId) {
      const builderUpdate = { $inc: { totalProjects: 1 } };

      if (availability === "Ready to Move") {
        builderUpdate.$inc.readyToMoveProjects = 1;
      } else if (availability === "Under Construction") {
        builderUpdate.$inc.underConstruction = 1;
      }

      if (req.body.isNewLaunch === true || req.body.isNewLaunch === "true") {
        builderUpdate.$inc.newLaunch = 1;
      }

      await Builder.findByIdAndUpdate(builderId, builderUpdate);
    }

    // ================== SEND NOTIFICATIONS ==================
    // The exclusion condition needs careful review: 
    // If Admin posts, userId is null. If Employee posts, userId is null. The query should exclude the poster's ID
    const posterId = userId || adminId || employeeId;

    const users = await User.find({
      // Exclude the ID of the person/admin who posted the property
      _id: { $ne: posterId },
      fcmToken: { $exists: true, $ne: null, $ne: "" },
    });

    const tokens = [...new Set(users.map(u => u.fcmToken).filter(t => typeof t === "string" && t.trim() !== ""))];

    let sentCount = 0;
    let failedCount = 0;

    if (tokens.length > 0) {
      try {
        const response = await sendPushNotification(
          tokens,
          "🏠 New Property Added!",
          "A new property has just been listed.",
          { propertyId: property._id.toString() }
        );

        if (response?.responses) {
          response.responses.forEach((resp) => {
            if (resp.success) sentCount++;
            else failedCount++;
          });
        }
      } catch (err) {
        console.error("Error sending push notifications:", err);
        failedCount = tokens.length;
      }
    }

    // ================== RESPONSE ==================
    res.status(201).json({
      message: "Property added successfully & notifications processed!",
      property,
      notificationStats: {
        totalUsers: tokens.length,
        sentCount,
        failedCount,
      },
    });

  } catch (error) {
    console.error("Add Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




//  Mark property as sold / unsold (toggle)
export const markPropertyAsSold = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the property by ID
    const property = await Property.findById(id);
    if (!property) {
      return res.status(404).json({
        success: false,
        message: "Property not found",
      });
    }

    const wasNotSold = !property.isSold;

    // Toggle the sold status
    property.isSold = !property.isSold;
    await property.save();

    // ⭐ AUTO-DECREMENT/INCREMENT BUILDER COUNTS WHEN MARKED AS SOLD ⭐
    if (property.builderId) {
      if (property.isSold && wasNotSold) {
        // Property just marked as sold - decrement counts
        const builderUpdate = { $inc: { totalProjects: -1 } };

        if (property.availability === "Ready to Move") {
          builderUpdate.$inc.readyToMoveProjects = -1;
        } else if (property.availability === "Under Construction") {
          builderUpdate.$inc.underConstruction = -1;
        }

        if (property.isNewLaunch === true) {
          builderUpdate.$inc.newLaunch = -1;
        }

        await Builder.findByIdAndUpdate(property.builderId, builderUpdate);
      } else if (!property.isSold && !wasNotSold) {
        // Property unmarked as sold - increment counts back
        const builderUpdate = { $inc: { totalProjects: 1 } };

        if (property.availability === "Ready to Move") {
          builderUpdate.$inc.readyToMoveProjects = 1;
        } else if (property.availability === "Under Construction") {
          builderUpdate.$inc.underConstruction = 1;
        }

        if (property.isNewLaunch === true) {
          builderUpdate.$inc.newLaunch = 1;
        }

        await Builder.findByIdAndUpdate(property.builderId, builderUpdate);
      }
    }

    return res.status(200).json({
      success: true,
      message: property.isSold
        ? "Property marked as sold successfully"
        : "Property marked as unsold successfully",
      isSold: property.isSold,
      property,
    });
  } catch (error) {
    console.error("Error toggling sold status:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

//  Get all sold properties
export const getSoldProperties = async (req, res) => {
  try {
    // Fetch only properties where isSold = true
    const soldProperties = await Property.find({ isSold: true }).populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({ success: false, message: "No sold properties found" });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};


//  Delete a sold property by ID
export const deleteSoldProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ success: false, message: "Property not found" });
    }

    if (!property.isSold) {
      return res.status(400).json({ success: false, message: "This property is not marked as sold" });
    }

    // Note: If property is already sold, builder counts were already decremented in markPropertyAsSold
    // So no need to decrement again here

    await Property.findByIdAndDelete(id);

    // Decrement user's myListingsCount and remove from myListings
    if (property.userId) {
      await User.findByIdAndUpdate(property.userId, {
        $inc: { myListingsCount: -1 },
        $pull: { myListings: property._id }
      });
    }

    return res.status(200).json({
      success: true,
      message: "Sold property deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting sold property:", error);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

//  Get sold properties by logged-in user
export const getMySoldProperties = async (req, res) => {
  try {
    const userId = req.user?.id || req.employee?._id; //  userId from verifyToken or verifyEmployeeToken middleware

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: Missing user ID" });
    }

    //  Fetch sold properties belonging to this user
    const soldProperties = await Property.find({ userId, isSold: true })
      .sort({ createdAt: -1 }) // latest first
      .populate("userId", "fullName email");

    if (soldProperties.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No sold properties found for this user",
      });
    }

    return res.status(200).json({
      success: true,
      count: soldProperties.length,
      soldProperties,
    });
  } catch (error) {
    console.error("Error fetching user's sold properties:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


// controllers/propertyController.js
//  Track property visits

export const visitProperty = async (req, res) => {
  try {
    const userId = req.user?.id || req.employee?._id;
    const { propertyId } = req.params;

    const property = await Property.findById(propertyId);
    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  Check if user has already visited this property
    const alreadyVisited = property.visitedBy.some(
      (visit) => visit.userId.toString() === userId
    );

    //  Only push + increment enquiriesCount if first time visit
    if (userId && !alreadyVisited) {
      property.visitedBy.push({ userId });
      await User.findByIdAndUpdate(userId, { $inc: { enquiriesCount: 1 } });
    }

    //  Always increment property visitCount
    property.visitCount += 1;

    await property.save();

    res.status(200).json({
      message: "Property visit recorded successfully",
      visitCount: property.visitCount,
    });
  } catch (error) {
    console.error("Error recording property visit:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// controllers/propertyController.js
export const getNearbyProperties = async (req, res) => {
  try {
    const userId = req.user?.id; // From auth middleware
    const { lat, lng, distance, location } = req.query;

    //  Validate user
    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized: userId missing" });
    }

    //  Step 1: Initialize latitude & longitude
    let latitude, longitude, placeName;

    //  CASE 1: Frontend directly provides coordinates
    if (lat && lng) {
      latitude = parseFloat(lat);
      longitude = parseFloat(lng);

      // Reverse geocode to get readable place name
      const reverseRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: `${latitude},${longitude}`,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
        },
      });

      placeName = reverseRes.data.results[0]?.formatted || "Unknown location";
    }

    // ✅ CASE 2: Frontend sends location name (manual search)
    else if (location) {
      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: location,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        return res.status(404).json({ success: false, message: "Location not found" });
      }
    }

    // ✅ CASE 3: Use logged-in user's saved address + pinCode
    else {
      const user = await User.findById(userId).select("street city state pinCode");

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      // 📍 Full address for geocoding (best accuracy)
      const fullAddress = `${user.street || ""}, ${user.city || ""}, ${user.state || ""}, ${user.pinCode || ""}`.trim();

      console.log("📍 Full user address for geocoding:", fullAddress);

      const geoRes = await axios.get("https://api.opencagedata.com/geocode/v1/json", {
        params: {
          q: fullAddress,
          key: process.env.OPENCAGE_KEY,
          limit: 1,
          countrycode: "in",
        },
      });

      if (geoRes.data.results && geoRes.data.results.length > 0) {
        latitude = geoRes.data.results[0].geometry.lat;
        longitude = geoRes.data.results[0].geometry.lng;
        placeName = geoRes.data.results[0].formatted;
      } else {
        console.warn("⚠️ Could not geocode user's address, using default Delhi coordinates");
        latitude = 28.6139;
        longitude = 77.2090;
        placeName = "Default Location (Delhi)";
      }
    }

    // 🧮 Step 2: Convert km to meters (default 20 km)
    const distanceInMeters = distance ? parseFloat(distance) * 1000 : 20000;


    // 🏘️ Step 3: Find nearby properties (exclude self)
    const nearbyProperties = await Property.find({
      geoLocation: {
        $near: {
          $geometry: { type: "Point", coordinates: [longitude, latitude] },
          $maxDistance: distanceInMeters,
        },
      },
      userId: { $ne: userId },
    });

    const user = await User.findById(userId).select("street city state pinCode");
    const fullAddress = `${user.street || ""}, ${user.city || ""}, ${user.state || ""}, ${user.pinCode || ""}`.trim();


    // 🧾 Step 4: Return response
    return res.status(200).json({
      success: true,
      count: nearbyProperties.length,
      distanceUsed: distanceInMeters / 1000 + " km",
      usedLocation: {
        latitude,
        longitude,

      },
      userAddressUsed: fullAddress || "derived from user profile",
      message: "Nearby properties fetched successfully",
      data: nearbyProperties,
    });
  } catch (error) {
    console.error("❌ Nearby Properties Error:", error.message);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching nearby properties",
      error: error.message,
    });
  }
};





// DELETE property by ID
export const deleteProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const property = await Property.findById(id);

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    // ⭐ AUTO-DECREMENT BUILDER COUNTS ⭐
    if (property.builderId) {
      const builderUpdate = { $inc: { totalProjects: -1 } };

      if (property.availability === "Ready to Move") {
        builderUpdate.$inc.readyToMoveProjects = -1;
      } else if (property.availability === "Under Construction") {
        builderUpdate.$inc.underConstruction = -1;
      }

      if (property.isNewLaunch === true) {
        builderUpdate.$inc.newLaunch = -1;
      }

      await Builder.findByIdAndUpdate(property.builderId, builderUpdate);
    }

    await Property.findByIdAndDelete(id);

    //  Decrement user's myListingsCount and remove from myListings
    if (property.userId) {
      await User.findByIdAndUpdate(property.userId, {
        $inc: { myListingsCount: -1 },
        $pull: { myListings: property._id }
      });
    }

    res.status(200).json({ message: "Property deleted successfully" });
  } catch (error) {
    console.error("Delete Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE property by ID (only specific fields)
export const updateProperty = async (req, res) => {
  try {
    const { id } = req.params;

    const allowedFields = [
      "propertyLocation",
      "propertyTitle",
      "description",
      "price",
      "areaDetails",
      "purpose",
      "recentUpdates",
      "availability",
      "furnishingStatus",
      "parking",
      "propertyType",
      "commercialType",
      "residentialType",
      "contactNumber",
      "bedrooms",
      "bathrooms",
      "balconies",
      "floorNumber",
      "totalFloors",
      "facingDirection",
      "flooringType",
      "noticePeriod",
      "foodIncluded",
      "pgType",
      "sharingType",
      "amenities",
      "ageOfProperty",
      "balconyType",
      "washroomType",
      "pantryCafeteria",
      "brochure",
      "isNewLaunch",
    ];

    const updatedData = {};
    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        if (key === 'areaDetails') {
          updatedData[key] = parseFloat(String(req.body[key]).replace(/[^\d.]/g, '')) || 0;
        } else {
          updatedData[key] = req.body[key];
        }
      }
    }

    //  Fix image path for multer uploads
    let photoFiles = [];
    let brochureFile = null;

    if (Array.isArray(req.files)) {
      photoFiles = req.files.filter(f => f.fieldname === 'photosAndVideo');
      brochureFile = req.files.find(f => f.fieldname === 'brochure');
    } else if (req.files) {
      photoFiles = req.files.photosAndVideo || [];
      brochureFile = req.files.brochure?.[0];
    }

    if (photoFiles.length > 0) {
      const photoPaths = photoFiles.map((file) => {
        return `uploads/${file.filename}`;
      });
      updatedData.photosAndVideo = photoPaths;
    }

    //  Handle brochure upload
    if (brochureFile) {
      updatedData.brochure = brochureFile.path;
    }

    //  Update geoLocation if location changed
    if (updatedData.propertyLocation) {
      const geoRes = await geocoder.geocode(updatedData.propertyLocation);
      if (geoRes.length > 0) {
        updatedData.geoLocation = {
          type: "Point",
          coordinates: [geoRes[0].longitude, geoRes[0].latitude],
        };
      }
    }

    // Fetch old property to compare for builder count updates
    const oldProperty = await Property.findById(id);
    if (!oldProperty) {
      return res.status(404).json({ message: "Property not found" });
    }

    //  Update in DB
    const property = await Property.findByIdAndUpdate(id, updatedData, {
      new: true,
      runValidators: true,
    });

    // ⭐ UPDATE BUILDER COUNTS IF availability or isNewLaunch CHANGED ⭐
    if (property.builderId && !property.isSold) {
      const builderUpdate = { $inc: {} };
      let needsUpdate = false;

      // Handle availability change
      if (updatedData.availability && updatedData.availability !== oldProperty.availability) {
        // Decrement old availability count
        if (oldProperty.availability === "Ready to Move") {
          builderUpdate.$inc.readyToMoveProjects = -1;
          needsUpdate = true;
        } else if (oldProperty.availability === "Under Construction") {
          builderUpdate.$inc.underConstruction = -1;
          needsUpdate = true;
        }

        // Increment new availability count
        if (updatedData.availability === "Ready to Move") {
          builderUpdate.$inc.readyToMoveProjects = (builderUpdate.$inc.readyToMoveProjects || 0) + 1;
          needsUpdate = true;
        } else if (updatedData.availability === "Under Construction") {
          builderUpdate.$inc.underConstruction = (builderUpdate.$inc.underConstruction || 0) + 1;
          needsUpdate = true;
        }
      }

      // Handle isNewLaunch change
      if (updatedData.isNewLaunch !== undefined && updatedData.isNewLaunch !== oldProperty.isNewLaunch) {
        if (updatedData.isNewLaunch === true || updatedData.isNewLaunch === "true") {
          builderUpdate.$inc.newLaunch = (builderUpdate.$inc.newLaunch || 0) + 1;
          needsUpdate = true;
        } else {
          builderUpdate.$inc.newLaunch = (builderUpdate.$inc.newLaunch || 0) - 1;
          needsUpdate = true;
        }
      }

      if (needsUpdate) {
        await Builder.findByIdAndUpdate(property.builderId, builderUpdate);
      }
    }

    res.status(200).json({
      message: "Property updated successfully",
      property,
    });
  } catch (error) {
    console.error("Update Property Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ADD recent update to property
export const addRecentUpdate = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, text } = req.body;

    if (!date || !text) {
      return res.status(400).json({ message: "Date and text are required" });
    }

    const property = await Property.findByIdAndUpdate(
      id,
      { $push: { recentUpdates: { date, text } } },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Recent update added successfully",
      property,
    });
  } catch (error) {
    console.error("Add Recent Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// UPDATE specific recent update in property
export const updateRecentUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;
    const { date, text } = req.body;

    if (!date && !text) {
      return res.status(400).json({ message: "At least one field (date or text) is required" });
    }

    const updateFields = {};
    if (date) updateFields["recentUpdates.$.date"] = date;
    if (text) updateFields["recentUpdates.$.text"] = text;

    const property = await Property.findOneAndUpdate(
      { _id: id, "recentUpdates._id": updateId },
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property or update not found" });
    }

    res.status(200).json({
      message: "Recent update modified successfully",
      property,
    });
  } catch (error) {
    console.error("Update Recent Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// DELETE specific recent update from property
export const deleteRecentUpdate = async (req, res) => {
  try {
    const { id, updateId } = req.params;

    const property = await Property.findByIdAndUpdate(
      id,
      { $pull: { recentUpdates: { _id: updateId } } },
      { new: true }
    );

    if (!property) {
      return res.status(404).json({ message: "Property not found" });
    }

    res.status(200).json({
      message: "Recent update deleted successfully",
      property,
    });
  } catch (error) {
    console.error("Delete Recent Update Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
