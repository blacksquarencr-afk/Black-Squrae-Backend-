import Property from "../models/addProps.js";

// Get Property Price Insights for a specific location
export const getPropertyPriceInsights = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: "Location parameter is required" });
        }

        // Get all properties in the location - search in multiple location fields
        const properties = await Property.find({
            $or: [
                { propertyLocation: { $regex: location, $options: "i" } },
                { city: { $regex: location, $options: "i" } },
                { locality: { $regex: location, $options: "i" } }
            ],
            isSold: false
        });

        if (properties.length === 0) {
            return res.json({
                location,
                totalListings: 0,
                medianPrice: 0,
                avgPrice: 0,
                priceRangeDistribution: {
                    "Below 1.5K": 0,
                    "1.5K - 3.5K": 0,
                    "3.5K - 5.5K": 0,
                    "5.5K - 8K": 0,
                    "8K - 10K": 0,
                    "10K - 12K": 0,
                    "12K Above": 0
                },
                currency: "₹"
            });
        }

        // Calculate price per sqft for all properties
        const pricesPerSqft = properties.map(p => p.price / p.areaDetails);
        
        // Calculate median price per sqft
        const sortedPrices = pricesPerSqft.sort((a, b) => a - b);
        const medianPrice = sortedPrices[Math.floor(sortedPrices.length / 2)];

        // Calculate average price per sqft
        const avgPrice = pricesPerSqft.reduce((sum, price) => sum + price, 0) / pricesPerSqft.length;

        // Price range distribution
        const priceRanges = {
            "Below 1.5K": 0,
            "1.5K - 3.5K": 0,
            "3.5K - 5.5K": 0,
            "5.5K - 8K": 0,
            "8K - 10K": 0,
            "10K - 12K": 0,
            "12K Above": 0
        };

        pricesPerSqft.forEach(price => {
            if (price < 1500) priceRanges["Below 1.5K"]++;
            else if (price < 3500) priceRanges["1.5K - 3.5K"]++;
            else if (price < 5500) priceRanges["3.5K - 5.5K"]++;
            else if (price < 8000) priceRanges["5.5K - 8K"]++;
            else if (price < 10000) priceRanges["8K - 10K"]++;
            else if (price < 12000) priceRanges["10K - 12K"]++;
            else priceRanges["12K Above"]++;
        });

        res.json({
            location,
            totalListings: properties.length,
            medianPrice: Math.round(medianPrice),
            avgPrice: Math.round(avgPrice),
            priceRangeDistribution: priceRanges,
            currency: "₹"
        });
    } catch (error) {
        console.error("Error getting property insights:", error);
        res.status(500).json({ error: "Failed to fetch property insights" });
    }
};

// Get Micromarket Price Comparison
export const getMicromarketComparison = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: "Location parameter is required" });
        }

        // Get properties grouped by micro-locations - search in multiple location fields
        const properties = await Property.find({
            $or: [
                { propertyLocation: { $regex: location, $options: "i" } },
                { city: { $regex: location, $options: "i" } },
                { locality: { $regex: location, $options: "i" } }
            ],
            isSold: false
        });

        // Group by specific locations (you can enhance this logic)
        const locationGroups = {};

        properties.forEach(property => {
            const loc = property.propertyLocation;
            if (!locationGroups[loc]) {
                locationGroups[loc] = [];
            }
            locationGroups[loc].push(property.price / property.areaDetails);
        });

        // Calculate average price per sqft for each location
        const micromarkets = Object.keys(locationGroups).map(loc => {
            const prices = locationGroups[loc];
            const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
            return {
                location: loc,
                avgPricePerSqft: Math.round(avgPrice),
                listingsCount: prices.length
            };
        }).sort((a, b) => b.avgPricePerSqft - a.avgPricePerSqft).slice(0, 10);

        res.json({
            location,
            micromarkets
        });
    } catch (error) {
        console.error("Error getting micromarket comparison:", error);
        res.status(500).json({ error: "Failed to fetch micromarket comparison" });
    }
};

// Get Rental Supply Insights
export const getRentalSupplyInsights = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: "Location parameter is required" });
        }

        // Get rental properties - search in multiple location fields
        const rentalProperties = await Property.find({
            $or: [
                { propertyLocation: { $regex: location, $options: "i" } },
                { city: { $regex: location, $options: "i" } },
                { locality: { $regex: location, $options: "i" } }
            ],
            purpose: { $in: ["Rent/Lease", "Paying Guest"] },
            isSold: false
        });

        // If no properties found, return empty data instead of 404
        if (rentalProperties.length === 0) {
            return res.json({
                location,
                totalRentalListings: 0,
                rentalRates: []
            });
        }

        // Group by bedroom configuration
        const configurations = {
            "STUDIO": [],
            "1 BHK": [],
            "2 BHK": [],
            "3 BHK": [],
            "4 BHK": [],
            "5+ BHK": []
        };

        rentalProperties.forEach(property => {
            const bedrooms = property.bedrooms || 0;
            let config;
            
            if (bedrooms === 0) config = "STUDIO";
            else if (bedrooms === 1) config = "1 BHK";
            else if (bedrooms === 2) config = "2 BHK";
            else if (bedrooms === 3) config = "3 BHK";
            else if (bedrooms === 4) config = "4 BHK";
            else config = "5+ BHK";

            configurations[config].push(property.price);
        });

        // Calculate average rent for each configuration
        const rentalRates = Object.keys(configurations).map(config => {
            const prices = configurations[config];
            if (prices.length === 0) return null;

            const minRent = Math.min(...prices);
            const maxRent = Math.max(...prices);
            const avgRent = Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length);

            return {
                configuration: config,
                minRent,
                maxRent,
                avgRent,
                availableCount: prices.length
            };
        }).filter(item => item !== null);

        res.json({
            location,
            totalRentalListings: rentalProperties.length,
            rentalRates
        });
    } catch (error) {
        console.error("Error getting rental supply insights:", error);
        res.status(500).json({ error: "Failed to fetch rental supply insights" });
    }
};

// Get Property Heatmap Data
export const getPropertyHeatmapData = async (req, res) => {
    try {
        const { location } = req.query;

        if (!location) {
            return res.status(400).json({ error: "Location parameter is required" });
        }

        // Get all properties with geolocation - search in multiple location fields
        const properties = await Property.find({
            $or: [
                { propertyLocation: { $regex: location, $options: "i" } },
                { city: { $regex: location, $options: "i" } },
                { locality: { $regex: location, $options: "i" } }
            ],
            isSold: false,
            "geoLocation.coordinates": { $ne: [0, 0] }
        });

        const heatmapData = properties.map(property => ({
            location: property.propertyLocation,
            coordinates: property.geoLocation.coordinates,
            pricePerSqft: Math.round(property.price / property.areaDetails),
            propertyType: property.propertyType,
            purpose: property.purpose
        }));

        res.json({
            location,
            totalProperties: heatmapData.length,
            heatmapData
        });
    } catch (error) {
        console.error("Error getting heatmap data:", error);
        res.status(500).json({ error: "Failed to fetch heatmap data" });
    }
};

// Get Overall Property Statistics
export const getPropertyStatistics = async (req, res) => {
    try {
        const { location } = req.query;

        const filter = location 
            ? { 
                $or: [
                    { propertyLocation: { $regex: location, $options: "i" } },
                    { city: { $regex: location, $options: "i" } },
                    { locality: { $regex: location, $options: "i" } }
                ],
                isSold: false 
              }
            : { isSold: false };

        const properties = await Property.find(filter);

        // Property Type Distribution
        const propertyTypes = {
            Residential: 0,
            Commercial: 0,
            Land: 0
        };

        // Purpose Distribution
        const purposes = {
            Sell: 0,
            "Rent/Lease": 0,
            "Paying Guest": 0
        };

        // Availability Status
        const availability = {
            "Ready to Move": 0,
            "Under Construction": 0
        };

        // Furnishing Status
        const furnishing = {
            Furnished: 0,
            "Semi-Furnished": 0,
            Unfurnished: 0
        };

        properties.forEach(property => {
            propertyTypes[property.propertyType]++;
            purposes[property.purpose]++;
            availability[property.availability]++;
            furnishing[property.furnishingStatus]++;
        });

        // Calculate price statistics
        const prices = properties.map(p => p.price);
        const avgPrice = prices.length > 0 
            ? Math.round(prices.reduce((sum, p) => sum + p, 0) / prices.length)
            : 0;

        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

        res.json({
            location: location || "All Locations",
            totalProperties: properties.length,
            propertyTypes,
            purposes,
            availability,
            furnishing,
            priceStatistics: {
                avgPrice,
                minPrice,
                maxPrice
            }
        });
    } catch (error) {
        console.error("Error getting property statistics:", error);
        res.status(500).json({ error: "Failed to fetch property statistics" });
    }
};

// Get Trending Properties
export const getTrendingProperties = async (req, res) => {
    try {
        const { location, limit = 10 } = req.query;

        const filter = location 
            ? { 
                $or: [
                    { propertyLocation: { $regex: location, $options: "i" } },
                    { city: { $regex: location, $options: "i" } },
                    { locality: { $regex: location, $options: "i" } }
                ],
                isSold: false 
              }
            : { isSold: false };

        // Get most visited properties
        const trendingProperties = await Property.find(filter)
            .sort({ visitCount: -1 })
            .limit(parseInt(limit))
            .populate("userId", "name email phoneNumber")
            .select("-visitedBy");

        res.json({
            location: location || "All Locations",
            trendingProperties
        });
    } catch (error) {
        console.error("Error getting trending properties:", error);
        res.status(500).json({ error: "Failed to fetch trending properties" });
    }
};

// Get Price Trends Over Time (properties posted by date)
export const getPriceTrends = async (req, res) => {
    try {
        const { location, months = 6 } = req.query;

        const monthsAgo = new Date();
        monthsAgo.setMonth(monthsAgo.getMonth() - parseInt(months));

        const filter = {
            postedDate: { $gte: monthsAgo },
            isSold: false
        };

        if (location) {
            filter.$or = [
                { propertyLocation: { $regex: location, $options: "i" } },
                { city: { $regex: location, $options: "i" } },
                { locality: { $regex: location, $options: "i" } }
            ];
        }

        const properties = await Property.find(filter).sort({ postedDate: 1 });

        // Group by month
        const monthlyData = {};

        properties.forEach(property => {
            const month = property.postedDate.toISOString().slice(0, 7); // YYYY-MM
            if (!monthlyData[month]) {
                monthlyData[month] = {
                    count: 0,
                    totalPrice: 0,
                    prices: []
                };
            }
            monthlyData[month].count++;
            monthlyData[month].totalPrice += property.price;
            monthlyData[month].prices.push(property.price / property.areaDetails);
        });

        const trends = Object.keys(monthlyData).map(month => {
            const data = monthlyData[month];
            const avgPricePerSqft = data.prices.reduce((sum, p) => sum + p, 0) / data.prices.length;
            
            return {
                month,
                listingsCount: data.count,
                avgPricePerSqft: Math.round(avgPricePerSqft),
                avgTotalPrice: Math.round(data.totalPrice / data.count)
            };
        });

        res.json({
            location: location || "All Locations",
            months: parseInt(months),
            trends
        });
    } catch (error) {
        console.error("Error getting price trends:", error);
        res.status(500).json({ error: "Failed to fetch price trends" });
    }
};

// Get Amenities Popularity
export const getAmenitiesPopularity = async (req, res) => {
    try {
        const { location } = req.query;

        const filter = location 
            ? { 
                $or: [
                    { propertyLocation: { $regex: location, $options: "i" } },
                    { city: { $regex: location, $options: "i" } },
                    { locality: { $regex: location, $options: "i" } }
                ],
                isSold: false 
              }
            : { isSold: false };

        const properties = await Property.find(filter);

        // Count amenities
        const amenityCounts = {};

        properties.forEach(property => {
            if (property.amenities && property.amenities.length > 0) {
                property.amenities.forEach(amenity => {
                    amenityCounts[amenity] = (amenityCounts[amenity] || 0) + 1;
                });
            }
        });

        // Sort by popularity
        const popularAmenities = Object.keys(amenityCounts)
            .map(amenity => ({
                amenity,
                count: amenityCounts[amenity],
                percentage: ((amenityCounts[amenity] / properties.length) * 100).toFixed(2)
            }))
            .sort((a, b) => b.count - a.count);

        res.json({
            location: location || "All Locations",
            totalProperties: properties.length,
            popularAmenities
        });
    } catch (error) {
        console.error("Error getting amenities popularity:", error);
        res.status(500).json({ error: "Failed to fetch amenities popularity" });
    }
};
