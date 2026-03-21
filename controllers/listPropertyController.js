import ListProperty from "../models/listProperty.js";

// GET /api/list-property/localities?search=sec&city=Noida
export const getLocalities = async (req, res) => {
    try {
        const { search = '', city = '' } = req.query;

        if (!search || search.trim().length < 1) {
            return res.status(200).json({ success: true, localities: [] });
        }

        const query = { locality: { $regex: search.trim(), $options: 'i' } };
        if (city) query.city = { $regex: `^${city.trim()}$`, $options: 'i' };

        // Fetch distinct localities matching search
        const localityDocs = await ListProperty.find(query)
            .select('locality projectName city')
            .limit(50);

        // Merge locality + projectName, deduplicate, filter by search
        const seen = new Set();
        const results = [];

        for (const doc of localityDocs) {
            const vals = [doc.locality, doc.projectName].filter(Boolean);
            for (const val of vals) {
                const key = val.toLowerCase();
                if (!seen.has(key) && val.toLowerCase().includes(search.toLowerCase())) {
                    seen.add(key);
                    results.push({ label: val, city: doc.city || city });
                }
                if (results.length >= 10) break;
            }
            if (results.length >= 10) break;
        }

        res.status(200).json({ success: true, localities: results });
    } catch (error) {
        console.error("Error fetching localities:", error);
        res.status(500).json({ success: false, message: "Failed to fetch localities", error: error.message });
    }
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
            userId,
            myListings
        } = req.query;

        let filter = {};
        if (city) filter.city = city;
        if (propertyType) filter.propertyType = propertyType;
        if (buildingType) filter.buildingType = buildingType;
        if (listingType) filter.listingType = listingType;
        if (locality) filter.locality = locality;
        if (possessionStatus) filter.possessionStatus = possessionStatus;
        if (bhk) filter.bhk = bhk;
        if (furnishing) filter.furnishing = furnishing;

        // Filter by specific userId or current user's listings
        if (myListings === 'true' && req.user) {
            filter.userId = req.user.id;
        } else if (userId) {
            filter.userId = userId;
        }

        const properties = await ListProperty.find(filter)
            .populate({
                path: "userId",
                select: "fullName email phone city state avatar",
            })
            .sort({ createdAt: -1 });

        // Defensive mapping for frontend compatibility
        const sanitizedProperties = properties.map(prop => {
            const p = prop.toObject();
            return {
                ...p,
                id: p._id?.toString() || "",
                title: p.title || p.propertyTitle || "",
                description: p.description || "",
                location: p.address || p.propertyLocation || "",
                images: p.photos || [],
            };
        });

        res.status(200).json({
            success: true,
            totalProperties: properties.length,
            count: sanitizedProperties.length,
            data: sanitizedProperties,
            properties: sanitizedProperties
        });
    } catch (error) {
        console.error("Error fetching list properties:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch properties",
            error: error.message,
        });
    }
};

export const addListProperty = async (req, res) => {
    try {
        const propertyData = { ...req.body };

        // Parse JSON strings if they come from forms
        if (typeof propertyData.additionalSpaces === 'string') {
            try { propertyData.additionalSpaces = JSON.parse(propertyData.additionalSpaces); } catch (e) { }
        }
        if (typeof propertyData.areaDetails === 'string') {
            try { propertyData.areaDetails = JSON.parse(propertyData.areaDetails); } catch (e) { }
        }
        if (typeof propertyData.additionalCharges === 'string') {
            try { propertyData.additionalCharges = JSON.parse(propertyData.additionalCharges); } catch (e) { }
        }
        if (typeof propertyData.balcony === 'string') {
            try { propertyData.balcony = JSON.parse(propertyData.balcony); } catch (e) { }
        }
        if (typeof propertyData.propertyHighlights === 'string') {
            try { propertyData.propertyHighlights = JSON.parse(propertyData.propertyHighlights); } catch (e) { }
        }
        if (typeof propertyData.videos === 'string') {
            try { propertyData.videos = JSON.parse(propertyData.videos); } catch (e) { }
        }
        if (typeof propertyData.furnishingItems === 'string') {
            try { propertyData.furnishingItems = JSON.parse(propertyData.furnishingItems); } catch (e) { }
        }
        if (typeof propertyData.amenities === 'string') {
            try { propertyData.amenities = JSON.parse(propertyData.amenities); } catch (e) { }
        }

        // Handle file uploads if any (assuming photos field)
        if (req.files) {
            propertyData.photos = req.files.map(file => file.path);
        }

        const newProperty = new ListProperty(propertyData);
        await newProperty.save();

        res.status(201).json({
            success: true,
            message: "Property listed successfully",
            data: newProperty
        });
    } catch (error) {
        console.error("Error adding list property:", error);
        res.status(500).json({
            success: false,
            message: "Failed to add property",
            error: error.message,
        });
    }
};
