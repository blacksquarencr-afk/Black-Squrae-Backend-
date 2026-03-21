import mongoose from "mongoose";
import ListProperty from "../models/list-property.js";
import User from "../models/user.js";
import Counter from "../models/counterModel.js";

// ================= HELPERS =================

// Base URL for serving uploaded files (production backend URL)
const BASE_URL = process.env.BASE_URL || "https://backend.blacksquare.estate";

/**
 * Convert a stored relative path like "uploads/abc123" → full URL
 * Already-full URLs are returned as-is.
 */
const toFullUrl = (filePath) => {
    if (!filePath) return "";
    if (filePath.startsWith("http")) return filePath;
    const cleaned = filePath.replace(/\\/g, "/").replace(/^\//, "");
    return `${BASE_URL}/${cleaned}`;
};
export const getAllListProperties = async (req, res) => {

    try {

        const {

            city,
            propertyType,
            buildingType,
            listingType,
            locality,
            possessionStatus,
            bhk,
            furnishing,
            facing,
            minPrice,
            maxPrice,
            userId,
            customUserId,
            myListings,
            includeSold

        } = req.query;


        /* ================= FILTER ================= */

        let filter = {};


        if (city)
            filter.city = city;

        if (propertyType)
            filter.propertyType = propertyType;

        if (buildingType)
            filter.buildingType = buildingType;

        if (listingType)
            filter.listingType = listingType;

        if (locality)
            filter.locality = locality;

        if (possessionStatus)
            filter.possessionStatus = possessionStatus;

        if (bhk)
            filter.bhk = bhk;

        if (furnishing)
            filter.furnishing = furnishing;

        if (facing)
            filter.facing = facing;


        /* ================= PRICE FILTER ================= */

        if (minPrice || maxPrice) {

            filter.price = {};

            if (minPrice)
                filter.price.$gte = Number(minPrice);

            if (maxPrice)
                filter.price.$lte = Number(maxPrice);

        }


        /* ================= USER FILTER ================= */

        if (myListings === "true" && req.user) {
            // Support both id and userId fields from JWT token
            const userIdToFilter = req.user.id || req.user.userId;
            console.log('🔍 MyListings filter - req.user:', req.user);
            console.log('🔍 Filtering by userId:', userIdToFilter);
            filter.userId = userIdToFilter;

        }
        else if (userId) {

            filter.userId = userId;

        }
        else if (customUserId) {

            filter.customUserId = customUserId;

        }


        /* ================= SOLD FILTER ================= */

        if (includeSold !== "true") {

            filter.isSold = false;

        }


        /* ================= VERIFICATION FILTER ================= */
        // Only show verified properties on website (public)
        // But if user is viewing their own listings (myListings=true), show all
        // This allows agents/owners to see their unverified listings in "My Listings"
        // Admins/Employees viewing from CRM can see all by passing includeUnverified=true
        const includeUnverified = req.query.includeUnverified === "true";
        
        if (myListings !== "true" && !includeUnverified) {
            filter.isVerified = true;
        }


        /* ================= FETCH ================= */

        console.log('📊 Final filter for properties:', JSON.stringify(filter));

        const properties = await ListProperty.find(filter)

            .populate({
                path: "userId",
                select: "fullName email phone city state avatar"
            })

            .populate({
                path: "adminId",
                select: "name email"
            })

            .populate({
                path: "employeeId",
                select: "name email"
            })

            .populate({
                path: "builderId",
                select: "builderName builderImage"
            })

            .sort({ createdAt: -1 });

        console.log('✅ Found properties:', properties.length);



        /* ================= SANITIZE ================= */

        const sanitizedProperties = properties.map(prop => {

            const p = prop.toObject();

            return {

                /* ===== CORE ===== */

                ...p,

                id: p._id.toString(),

                customPropertyId: p.customPropertyId || "",


                /* ===== BASIC ===== */

                title: p.title || "",
                description: p.description || "",

                listingType: p.listingType || "",
                buildingType: p.buildingType || "",
                propertyType: p.propertyType || "",

                city: p.city || "",
                locality: p.locality || "",
                address: p.address || "",

                projectName: p.projectName || "",

                bhk: p.bhk || "",

                suitedFor: p.suitedFor || "",

                roomType: p.roomType || "",

                totalBeds: p.totalBeds || "",


                /* ===== PRICE ===== */

                price: p.price || 0,
                priceUnit: p.priceUnit || "",
                priceType: p.priceType || "",

                maintenance: p.maintenance || 0,

                securityDeposit: p.securityDeposit || "",

                depositAmount: p.depositAmount || "",


                /* ===== AREA ===== */

                areaUnit: p.areaUnit || "",

                areaDetails: p.areaDetails || [],

                superBuiltUpArea: p.superBuiltUpArea || null,
                builtUpArea: p.builtUpArea || null,
                carpetArea: p.carpetArea || null,


                /* ===== POSSESSION (Step 2) ===== */

                possessionStatus: p.possessionStatus || "",

                // possessionDate only meaningful when Under Construction
                possessionDate: p.possessionDate || null,

                propertyAge: p.propertyAge || "",

                bathrooms: p.bathrooms || "",

                coveredParking: p.coveredParking || "N/A",

                openParking: p.openParking || "N/A",

                balcony: p.balcony || [],


                /* ===== MEDIA (Step 3/4) ===== */

                // Return full URLs so frontend can render directly
                // Return as both 'photos' and 'images' for compatibility
                photos: (p.photos || []).map(toFullUrl),
                images: (p.photos || []).map(toFullUrl),

                videos: (p.videos || []).map(v => ({
                    ...v,
                    url: toFullUrl(v.url),
                    title: v.title || "",
                    thumbnail: v.thumbnail ? toFullUrl(v.thumbnail) : ""
                })),

                brochure: toFullUrl(p.brochure),


                /* ===== FEATURES ===== */

                furnishing: p.furnishing || "",

                furnishingItems: p.furnishingItems || {},

                amenities: p.amenities || [],

                propertyHighlights: p.propertyHighlights || [],


                /* ===== LOCATION ===== */

                latitude: p.latitude || null,

                longitude: p.longitude || null,


                /* ===== STATUS ===== */

                isSold: p.isSold || false,

                status: p.isSold ? "Sold/Rented" : "Active",


                /* ===== OWNER ===== */

                user: p.userId || null,

                admin: p.adminId || null,

                employee: p.employeeId || null,

                builder: p.builderId || null,


                /* ===== DATES ===== */

                createdAt: p.createdAt,

                updatedAt: p.updatedAt,

                postedDate: p.postedDate

            };

        });



        /* ================= RESPONSE ================= */

        return res.status(200).json({

            success: true,

            total: sanitizedProperties.length,

            count: sanitizedProperties.length,

            properties: sanitizedProperties,

            data: sanitizedProperties

        });


    }
    catch (error) {

        console.error("Error fetching properties:", error);

        return res.status(500).json({

            success: false,

            message: "Failed to fetch properties",

            error: error.message

        });

    }

};

// ================= GET MY LISTINGS =================
export const getMyListings = async (req, res) => {
    try {
        const userId = req.user?.id || req.user?.userId || req.user?._id;
        
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
            });
        }

        console.log('🔍 Fetching my listings for user:', userId);

        const { includeSold } = req.query;

        /* ================= FILTER ================= */
        let filter = { userId };

        /* ================= SOLD FILTER ================= */
        if (includeSold !== "true") {
            filter.isSold = false;
        }

        console.log('📊 Filter for my listings:', JSON.stringify(filter));

        /* ================= FETCH ================= */
        const properties = await ListProperty.find(filter)
            .populate({
                path: "userId",
                select: "fullName email phone city state avatar"
            })
            .populate({
                path: "adminId",
                select: "name email"
            })
            .populate({
                path: "employeeId",
                select: "name email"
            })
            .populate({
                path: "builderId",
                select: "builderName builderImage"
            })
            .sort({ createdAt: -1 });

        console.log('✅ Found user properties:', properties.length);

        /* ================= SANITIZE ================= */
        const sanitizedProperties = properties.map(prop => {
            const p = prop.toObject();
            return {
                /* ===== CORE ===== */
                ...p,
                id: p._id.toString(),
                customPropertyId: p.customPropertyId || "",

                /* ===== BASIC ===== */
                title: p.title || "",
                description: p.description || "",
                listingType: p.listingType || "",
                buildingType: p.buildingType || "",
                propertyType: p.propertyType || "",
                city: p.city || "",
                locality: p.locality || "",
                address: p.address || "",
                projectName: p.projectName || "",
                bhk: p.bhk || "",
                suitedFor: p.suitedFor || "",
                roomType: p.roomType || "",
                totalBeds: p.totalBeds || "",

                /* ===== PRICE ===== */
                price: p.price || 0,
                priceUnit: p.priceUnit || "",
                priceType: p.priceType || "",
                maintenance: p.maintenance || 0,
                securityDeposit: p.securityDeposit || "",
                depositAmount: p.depositAmount || "",

                /* ===== AREA ===== */
                areaUnit: p.areaUnit || "",
                areaDetails: p.areaDetails || [],
                superBuiltUpArea: p.superBuiltUpArea || null,
                builtUpArea: p.builtUpArea || null,
                carpetArea: p.carpetArea || null,

                /* ===== POSSESSION (Step 2) ===== */
                possessionStatus: p.possessionStatus || "",
                possessionDate: p.possessionDate || null,
                propertyAge: p.propertyAge || "",
                bathrooms: p.bathrooms || "",
                coveredParking: p.coveredParking || "N/A",
                openParking: p.openParking || "N/A",
                balcony: p.balcony || [],

                /* ===== MEDIA (Step 3/4) ===== */
                // Return full URLs so frontend can render directly
                // Return as both 'photos' and 'images' for compatibility
                photos: (p.photos || []).filter(img => img && typeof img === 'string').map(toFullUrl),
                images: (p.photos || []).filter(img => img && typeof img === 'string').map(toFullUrl),
                videos: (p.videos || []).map(v => ({
                    ...v,
                    url: toFullUrl(v.url),
                    title: v.title || "",
                    thumbnail: v.thumbnail ? toFullUrl(v.thumbnail) : ""
                })),
                brochure: toFullUrl(p.brochure),

                /* ===== FEATURES ===== */
                furnishing: p.furnishing || "",
                furnishingItems: p.furnishingItems || {},
                amenities: p.amenities || [],
                propertyHighlights: p.propertyHighlights || [],

                /* ===== LOCATION ===== */
                latitude: p.latitude || null,
                longitude: p.longitude || null,

                /* ===== STATUS ===== */
                isSold: p.isSold || false,
                status: p.isSold ? "Sold/Rented" : "Active",

                /* ===== VERIFICATION ===== */
                isVerified: p.isVerified || false,
                verifiedAt: p.verifiedAt || null,
                verifiedBy: p.verifiedBy || null,

                /* ===== OWNER ===== */
                user: p.userId || null,
                admin: p.adminId || null,
                employee: p.employeeId || null,
                builder: p.builderId || null,

                /* ===== DATES ===== */
                createdAt: p.createdAt,
                updatedAt: p.updatedAt,
                postedDate: p.postedDate
            };
        });

        /* ================= RESPONSE ================= */
        return res.status(200).json({
            success: true,
            total: sanitizedProperties.length,
            count: sanitizedProperties.length,
            properties: sanitizedProperties,
            data: sanitizedProperties
        });

    } catch (error) {
        console.error("Error fetching my listings:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch your listings",
            error: error.message
        });
    }
};

export const addListProperty = async (req, res) => {
    try {

        const propertyData = { ...req.body };

       
        delete propertyData.customPropertyId;

        const userId = req.user?.id || propertyData.userId;
        const adminId = propertyData.adminId;
        const employeeId = propertyData.employeeId;

        if (userId) propertyData.userId = userId;

        // Fetch customUserId from user
        if (userId) {
            const userDoc = await User.findById(userId).select("customUserId");
            if (userDoc?.customUserId) propertyData.customUserId = userDoc.customUserId;
        }

        // ================= CUSTOM PROPERTY ID =================

        let customPropertyId;

        if (adminId) {

            const Admin = mongoose.model('Admin');
            const admin = await Admin.findById(adminId);

            if (!admin)
                return res.status(404).json({ success: false, message: "Admin not found" });

            let index = await ListProperty.countDocuments({ adminId }) + 1;

            customPropertyId = `A-${adminId.toString().slice(-4)}-${index}`;

            propertyData.isPostedByAdmin = true;
        }

        else if (employeeId) {

            const Employee = mongoose.model('Employee');
            const employee = await Employee.findById(employeeId);

            if (!employee)
                return res.status(404).json({ success: false, message: "Employee not found" });

            let index = await ListProperty.countDocuments({ employeeId }) + 1;

            customPropertyId = `E-${employeeId.toString().slice(-4)}-${index}`;

            propertyData.isPostedByEmployee = true;
        }

        else if (userId) {

            let user = await User.findById(userId);

            if (!user)
                return res.status(404).json({ success: false, message: "User not found" });

            if (!user.serialId) {

                const counter = await Counter.findOneAndUpdate(
                    { name: "userSerialId" },
                    { $inc: { seq: 1 } },
                    { new: true, upsert: true }
                );

                user.serialId = counter.seq;
                await user.save();
            }

            const nextIndex = (user.myListingsCount || 0) + 1;

            customPropertyId = `S${user.serialId}-${nextIndex}`;

            await User.findByIdAndUpdate(userId, {
                $inc: { myListingsCount: 1 }
            });
        }

        else {

            const count = await ListProperty.countDocuments();
            customPropertyId = `LIST-${count + 1}`;
        }

        propertyData.customPropertyId = customPropertyId;

        // ================= VERIFICATION STATUS =================
        // Admin and Employee properties are auto-verified
        // User/Agent/Owner properties need admin verification
        if (adminId || employeeId) {
            propertyData.isVerified = true;
            propertyData.verifiedAt = new Date();
        } else {
            propertyData.isVerified = false;
        }

        // ================= JSON PARSE =================

        const jsonFields = [
            "additionalSpaces",
            "areaDetails",
            "additionalCharges",
            "balcony",
            "propertyHighlights",
            "furnishingItems",
            "amenities"
        ];

        jsonFields.forEach(field => {
            if (typeof propertyData[field] === "string") {
                try {
                    propertyData[field] = JSON.parse(propertyData[field]);
                } catch { }
            }
        });

        // ================= DATE FIX =================

        if (propertyData.possessionStatus === "Under Construction") {

            const rawDate = propertyData.possessionDate;

            if (rawDate && rawDate !== "" && rawDate !== "undefined") {

                const parsed = new Date(rawDate);

                // Save only if it is a valid date
                if (!isNaN(parsed.getTime())) {
                    propertyData.possessionDate = parsed;
                } else {
                    // Invalid date string — remove so DB validator doesn't choke
                    delete propertyData.possessionDate;
                }

            } else {
                // Empty or missing — remove field entirely
                delete propertyData.possessionDate;
            }

        } else {
            // Not Under Construction — possession date not applicable
            delete propertyData.possessionDate;
        }

        // ================= NUMBER FIX =================

        const numberFields = [
            // Pricing
            "price",
            "maintenance",
            "areaValue",
            // Step 4 — Detailed Configuration
            "connectingRoadWidth",
            "superBuiltUpArea",
            "builtUpArea",
            "carpetArea",
            "floorNumber",
            "totalFloors",
            // Location
            "latitude",
            "longitude"
        ];

        numberFields.forEach(field => {
            const val = propertyData[field];
            // Convert only when not empty / not already a number
            if (val !== undefined && val !== null && val !== "") {
                const num = Number(val);
                propertyData[field] = isNaN(num) ? undefined : num;
            } else if (val === "") {
                // Empty string → remove so schema default / null takes over
                propertyData[field] = undefined;
            }
        });

        // ================= BOOLEAN FIX =================

        const boolFields = [
            "maintenanceIncluded",
            "keepUnitPrivate",
            "isSold",
            "isNewLaunch",
            "exclusive"
        ];

        boolFields.forEach(field => {
            if (propertyData[field] !== undefined)
                propertyData[field] =
                    propertyData[field] === true ||
                    propertyData[field] === "true";
        });

        // ================= FILE UPLOAD FIX =================

        if (req.files && req.files.length > 0) {

            // Photos – store only the relative path (e.g. "uploads/abc")
            // toFullUrl() in the GET response will build the full URL
            const photos = req.files
                .filter(f => f.mimetype.startsWith("image/"))
                .map(f => f.path.replace(/\\/g, "/"));

            if (photos.length)
                propertyData.photos = photos;

            // Videos – store relative URL + metadata
            const videos = req.files
                .filter(f => f.mimetype.startsWith("video/"))
                .map(f => ({
                    url: f.path.replace(/\\/g, "/"),
                    title: "",
                    thumbnail: "",
                    uploadedAt: new Date()
                }));

            if (videos.length)
                propertyData.videos = videos;

            // Brochure (PDF) – store relative path
            const brochure = req.files.find(
                f => f.mimetype === "application/pdf"
            );

            if (brochure)
                propertyData.brochure = brochure.path.replace(/\\/g, "/");
        }

        // possessionDate: clear it if status is NOT Under Construction
        if (propertyData.possessionStatus !== "Under Construction") {
            propertyData.possessionDate = undefined;
        }

        // ================= SAVE =================

        const newProperty = new ListProperty(propertyData);

        await newProperty.save();

        // Add property to user's myListings array
        if (userId) {
            await User.findByIdAndUpdate(userId, {
                $addToSet: { myListings: newProperty._id }
            });
        }

        res.status(201).json({
            success: true,
            message: "Property listed successfully",
            data: newProperty
        });

    }
    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const updateListProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        let property = await ListProperty.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Check ownership
        if (property.userId && property.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only edit your own properties"
            });
        }

        const propertyData = { ...req.body };

        // ==================== PARSE JSON STRINGS ====================
        const jsonFields = [
            'additionalSpaces', 'areaDetails', 'additionalCharges',
            'balcony', 'propertyHighlights', 'videos',
            'furnishingItems', 'amenities'
        ];

        jsonFields.forEach(field => {
            if (typeof propertyData[field] === 'string') {
                try {
                    propertyData[field] = JSON.parse(propertyData[field]);
                } catch (e) {
                    console.error(`Error parsing ${field}:`, e);
                }
            }
        });

        // ==================== HANDLE DATA TYPE CONVERSIONS ====================
        // Handle possessionDate conversion
        if (propertyData.possessionDate && typeof propertyData.possessionDate === 'string') {
            propertyData.possessionDate = new Date(propertyData.possessionDate);
        }

        // Handle boolean conversions
        if (propertyData.maintenanceIncluded !== undefined) {
            propertyData.maintenanceIncluded = propertyData.maintenanceIncluded === 'true' || propertyData.maintenanceIncluded === true;
        }
        if (propertyData.keepUnitPrivate !== undefined) {
            propertyData.keepUnitPrivate = propertyData.keepUnitPrivate === 'true' || propertyData.keepUnitPrivate === true;
        }
        if (propertyData.isPostedByAdmin !== undefined) {
            propertyData.isPostedByAdmin = propertyData.isPostedByAdmin === 'true' || propertyData.isPostedByAdmin === true;
        }
        if (propertyData.isPostedByEmployee !== undefined) {
            propertyData.isPostedByEmployee = propertyData.isPostedByEmployee === 'true' || propertyData.isPostedByEmployee === true;
        }
        if (propertyData.isSold !== undefined) {
            propertyData.isSold = propertyData.isSold === 'true' || propertyData.isSold === true;
        }
        if (propertyData.isNewLaunch !== undefined) {
            propertyData.isNewLaunch = propertyData.isNewLaunch === 'true' || propertyData.isNewLaunch === true;
        }
        if (propertyData.exclusive !== undefined) {
            propertyData.exclusive = propertyData.exclusive === 'true' || propertyData.exclusive === true;
        }

        // ==================== HANDLE FILE UPLOADS ====================
        if (req.files && req.files.length > 0) {
            // Handle photos/images
            const photoFiles = req.files.filter(file =>
                (file.fieldname === 'photos' ||
                    file.fieldname === 'photosAndVideo' ||
                    file.fieldname === 'images') &&
                file.mimetype.startsWith('image/')
            );
            if (photoFiles.length > 0) {
                const newPhotos = photoFiles.map(file => file.path);
                // Replace existing photos with new uploads
                propertyData.photos = newPhotos;
            }

            // Handle video files
            const videoFiles = req.files.filter(file =>
                file.fieldname === 'videos' &&
                file.mimetype.startsWith('video/')
            );
            if (videoFiles.length > 0) {
                propertyData.videos = videoFiles.map(file => ({ url: file.path }));
            }

            // Handle brochure (PDF)
            const brochureFile = req.files.find(file =>
                file.fieldname === 'brochure' &&
                file.mimetype === 'application/pdf'
            );
            if (brochureFile) {
                propertyData.brochure = brochureFile.path;
            }
        }

        const updatedProperty = await ListProperty.findByIdAndUpdate(
            id,
            { $set: propertyData },
            { new: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            message: "Property updated successfully",
            data: updatedProperty
        });
    } catch (error) {
        console.error("Error updating list property:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update property",
            error: error.message,
        });
    }
};

export const deleteListProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;

        const property = await ListProperty.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Check ownership
        if (property.userId && property.userId.toString() !== userId) {
            return res.status(403).json({
                success: false,
                message: "Unauthorized: You can only delete your own properties"
            });
        }

        await ListProperty.findByIdAndDelete(id);

        // ⭐ Decrement user's myListingsCount and remove from myListings array
        if (property.userId) {
            await User.findByIdAndUpdate(property.userId, {
                $inc: { myListingsCount: -1 },
                $pull: { myListings: property._id }
            });
        }

        res.status(200).json({
            success: true,
            message: "Property deleted successfully"
        });
    } catch (error) {
        console.error("Error deleting list property:", error);
        res.status(500).json({
            success: false,
            message: "Failed to delete property",
            error: error.message,
        });
    }
};

// ================= GET LOCALITIES/PROJECTS =================
export const getLocalities = async (req, res) => {
    try {
        const { city, search } = req.query;

        console.log('🔍 ========== LOCALITY API CALLED ==========');
        console.log('🔍 Query params - city:', city, 'search:', search);

        // First, check total count in database
        const totalCount = await ListProperty.countDocuments();
        console.log('📊 Total properties in database:', totalCount);

        // Check properties in specific city
        if (city) {
            const cityCount = await ListProperty.countDocuments({ 
                city: { $regex: new RegExp(`^${city.trim()}$`, 'i') } 
            });
            console.log(`📍 Properties in ${city}:`, cityCount);

            // Show sample cities
            const sampleCities = await ListProperty.distinct('city');
            console.log('🏙️ All cities in database:', sampleCities.slice(0, 10));
        }

        // Build filter for querying - return objects with {name, type}
        let suggestions = [];
        
        if (search && search.trim().length > 0) {
            const searchPattern = new RegExp(search.trim(), 'i');
            
            // Build query for localities
            const localityFilter = {};
            if (city && city.trim()) {
                localityFilter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
            }
            localityFilter.locality = { $regex: searchPattern, $exists: true, $ne: '' };
            
            // Build query for project names
            const projectFilter = {};
            if (city && city.trim()) {
                projectFilter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
            }
            // Search in title, projectName, or locality for projects
            projectFilter.$or = [
                { projectName: { $regex: searchPattern, $exists: true, $ne: '' } },
                { title: { $regex: searchPattern, $exists: true, $ne: '' } }
            ];
            
            console.log('🔎 Locality filter:', JSON.stringify(localityFilter));
            console.log('🔎 Project filter:', JSON.stringify(projectFilter));
            
            // Find unique localities matching the search and city
            const localityResults = await ListProperty.distinct('locality', localityFilter);

            // Find properties with title and locality matching the search and city
            const propertyResults = await ListProperty.find(projectFilter, { 
                title: 1, 
                projectName: 1, 
                locality: 1, 
                residentialType: 1,
                propertyType: 1,
                _id: 0 
            }).limit(20);

            console.log('📍 Found localities:', localityResults);
            console.log('🏢 Found properties:', propertyResults);

            // Create objects with type information
            const localityObjects = localityResults
                .filter(l => l && l.trim())
                .map(locality => ({ name: locality, type: 'locality' }));
            
            const projectObjects = propertyResults
                .filter(p => p.locality && p.locality.trim())
                .map(property => {
                    // Use title if available, otherwise use projectName or residentialType/propertyType
                    const displayTitle = property.title || 
                                        property.projectName || 
                                        property.residentialType || 
                                        property.propertyType || 
                                        'Property';
                    
                    return { 
                        name: `${displayTitle}, ${property.locality}`, 
                        locality: property.locality || '',
                        title: displayTitle,
                        type: 'project' 
                    };
                });

            // Combine localities and projects
            const combined = [...localityObjects, ...projectObjects];

            // Remove duplicates by name (case-insensitive) and sort
            const seen = new Map();
            combined.forEach(item => {
                const lowerName = item.name.toLowerCase();
                // Only add if we haven't seen this exact name before
                if (!seen.has(lowerName)) {
                    seen.set(lowerName, item);
                }
            });

            suggestions = Array.from(seen.values())
                .sort((a, b) => {
                    // Sort localities first, then projects
                    if (a.type === 'locality' && b.type === 'project') return -1;
                    if (a.type === 'project' && b.type === 'locality') return 1;
                    return a.name.localeCompare(b.name);
                })
                .slice(0, 10); // Limit to 10 results
        } else {
            // If no search term, return recent unique localities from the city
            const emptyFilter = {};
            if (city && city.trim()) {
                emptyFilter.city = { $regex: new RegExp(`^${city.trim()}$`, 'i') };
            }
            
            console.log('🔎 Empty search filter:', JSON.stringify(emptyFilter));
            
            const localityResults = await ListProperty.distinct('locality', {
                ...emptyFilter,
                locality: { $exists: true, $ne: '' }
            });
            const propertyResults = await ListProperty.find({
                ...emptyFilter,
                $or: [
                    { projectName: { $exists: true, $ne: '' } },
                    { title: { $exists: true, $ne: '' } }
                ]
            }, { 
                title: 1, 
                projectName: 1, 
                locality: 1, 
                residentialType: 1,
                propertyType: 1,
                _id: 0 
            }).limit(20);
            
            console.log('📍 All localities for city:', localityResults.slice(0, 10));
            console.log('🏢 All properties for city:', propertyResults.slice(0, 10));
            
            // Create objects with type information
            const localityObjects = localityResults
                .filter(l => l && l.trim())
                .map(locality => ({ name: locality, type: 'locality' }));
            
            const projectObjects = propertyResults
                .filter(p => p.locality && p.locality.trim())
                .map(property => {
                    // Use title if available, otherwise use projectName or residentialType/propertyType
                    const displayTitle = property.title || 
                                        property.projectName || 
                                        property.residentialType || 
                                        property.propertyType || 
                                        'Property';
                    
                    return { 
                        name: `${displayTitle}, ${property.locality}`, 
                        locality: property.locality || '',
                        title: displayTitle,
                        type: 'project' 
                    };
                });

            const combined = [...localityObjects, ...projectObjects];

            // Remove duplicates by name (case-insensitive)
            const seen = new Map();
            combined.forEach(item => {
                const lowerName = item.name.toLowerCase();
                if (!seen.has(lowerName)) {
                    seen.set(lowerName, item);
                }
            });

            suggestions = Array.from(seen.values())
                .sort((a, b) => {
                    // Sort localities first, then projects
                    if (a.type === 'locality' && b.type === 'project') return -1;
                    if (a.type === 'project' && b.type === 'locality') return 1;
                    return a.name.localeCompare(b.name);
                })
                .slice(0, 10);
        }

        console.log('✅ ========== RETURNING LOCALITIES ==========');
        console.log('✅ Total suggestions:', suggestions.length);
        console.log('✅ Suggestions:', suggestions);

        res.status(200).json({
            success: true,
            localities: suggestions,
            debug: {
                totalInDB: await ListProperty.countDocuments(),
                cityFilter: city || 'none',
                searchFilter: search || 'none'
            }
        });
    } catch (error) {
        console.error("❌ ========== LOCALITY API ERROR ==========");
        console.error("❌ Error:", error);
        console.error("❌ Stack:", error.stack);
        res.status(500).json({
            success: false,
            message: "Failed to fetch localities",
            error: error.message,
            localities: []
        });
    }
};

// ================= VERIFY LIST PROPERTY =================
export const verifyListProperty = async (req, res) => {
    try {
        const { id } = req.params;
        const adminId = req.admin._id || req.admin.id; // Support both _id and id
        
        console.log('🔐 Verify property request:', { propertyId: id, adminId, admin: req.admin });

        const property = await ListProperty.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Update verification status
        property.isVerified = true;
        property.verifiedAt = new Date();
        property.verifiedBy = adminId;

        await property.save();

        console.log('✅ Property verified:', property.customPropertyId);

        res.status(200).json({
            success: true,
            message: "Property verified successfully",
            data: {
                id: property._id,
                customPropertyId: property.customPropertyId,
                isVerified: property.isVerified,
                verifiedAt: property.verifiedAt
            }
        });
    } catch (error) {
        console.error("Error verifying property:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify property",
            error: error.message
        });
    }
};

// ================= UNVERIFY LIST PROPERTY =================
export const unverifyListProperty = async (req, res) => {
    try {
        const { id } = req.params;
        
        console.log('🔐 Unverify property request:', { propertyId: id });

        const property = await ListProperty.findById(id);

        if (!property) {
            return res.status(404).json({
                success: false,
                message: "Property not found"
            });
        }

        // Update verification status
        property.isVerified = false;
        property.verifiedAt = null;
        property.verifiedBy = null;

        await property.save();

        console.log('✅ Property unverified:', property.customPropertyId);

        res.status(200).json({
            success: true,
            message: "Property unverified successfully",
            data: {
                id: property._id,
                customPropertyId: property.customPropertyId,
                isVerified: property.isVerified
            }
        });
    } catch (error) {
        console.error("Error unverifying property:", error);
        res.status(500).json({
            success: false,
            message: "Failed to unverify property",
            error: error.message
        });
    }
};
