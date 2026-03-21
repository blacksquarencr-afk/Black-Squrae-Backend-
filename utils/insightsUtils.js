// Utility functions for property insights calculations

/**
 * Calculate median value from an array of numbers
 */
export const calculateMedian = (values) => {
    if (!values || values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
        return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    
    return sorted[middle];
};

/**
 * Calculate average value from an array of numbers
 */
export const calculateAverage = (values) => {
    if (!values || values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
};

/**
 * Calculate price per square foot
 */
export const calculatePricePerSqft = (price, areaDetails) => {
    if (!areaDetails || areaDetails === 0) return 0;
    return price / areaDetails;
};

/**
 * Group properties by location
 */
export const groupByLocation = (properties) => {
    const grouped = {};
    
    properties.forEach(property => {
        const location = property.propertyLocation;
        if (!grouped[location]) {
            grouped[location] = [];
        }
        grouped[location].push(property);
    });
    
    return grouped;
};

/**
 * Group properties by bedroom count
 */
export const groupByBedrooms = (properties) => {
    const grouped = {
        "STUDIO": [],
        "1 BHK": [],
        "2 BHK": [],
        "3 BHK": [],
        "4 BHK": [],
        "5+ BHK": []
    };
    
    properties.forEach(property => {
        const bedrooms = property.bedrooms || 0;
        let category;
        
        if (bedrooms === 0) category = "STUDIO";
        else if (bedrooms === 1) category = "1 BHK";
        else if (bedrooms === 2) category = "2 BHK";
        else if (bedrooms === 3) category = "3 BHK";
        else if (bedrooms === 4) category = "4 BHK";
        else category = "5+ BHK";
        
        grouped[category].push(property);
    });
    
    return grouped;
};

/**
 * Calculate price range distribution
 */
export const calculatePriceRangeDistribution = (pricesPerSqft) => {
    const ranges = {
        "Below 1.5K": 0,
        "1.5K - 3.5K": 0,
        "3.5K - 5.5K": 0,
        "5.5K - 8K": 0,
        "8K - 10K": 0,
        "10K - 12K": 0,
        "12K Above": 0
    };
    
    pricesPerSqft.forEach(price => {
        if (price < 1500) ranges["Below 1.5K"]++;
        else if (price < 3500) ranges["1.5K - 3.5K"]++;
        else if (price < 5500) ranges["3.5K - 5.5K"]++;
        else if (price < 8000) ranges["5.5K - 8K"]++;
        else if (price < 10000) ranges["8K - 10K"]++;
        else if (price < 12000) ranges["10K - 12K"]++;
        else ranges["12K Above"]++;
    });
    
    return ranges;
};

/**
 * Format currency in Indian Rupees
 */
export const formatCurrency = (amount, options = {}) => {
    const {
        includeSymbol = true,
        decimals = 0,
        compact = false
    } = options;
    
    const rounded = Math.round(amount);
    
    if (compact) {
        if (rounded >= 10000000) { // 1 Crore
            return `${includeSymbol ? '₹' : ''}${(rounded / 10000000).toFixed(2)} Cr`;
        } else if (rounded >= 100000) { // 1 Lakh
            return `${includeSymbol ? '₹' : ''}${(rounded / 100000).toFixed(2)} L`;
        } else if (rounded >= 1000) { // 1 Thousand
            return `${includeSymbol ? '₹' : ''}${(rounded / 1000).toFixed(2)} K`;
        }
    }
    
    const formatted = new Intl.NumberFormat('en-IN', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
    }).format(rounded);
    
    return includeSymbol ? `₹${formatted}` : formatted;
};

/**
 * Calculate percentage
 */
export const calculatePercentage = (part, total) => {
    if (!total || total === 0) return 0;
    return ((part / total) * 100).toFixed(2);
};

/**
 * Get property configuration label
 */
export const getPropertyConfiguration = (bedrooms) => {
    if (bedrooms === 0) return "STUDIO";
    if (bedrooms === 1) return "1 BHK";
    if (bedrooms === 2) return "2 BHK";
    if (bedrooms === 3) return "3 BHK";
    if (bedrooms === 4) return "4 BHK";
    return "5+ BHK";
};

/**
 * Filter properties by date range
 */
export const filterByDateRange = (properties, startDate, endDate) => {
    return properties.filter(property => {
        const postedDate = new Date(property.postedDate);
        return postedDate >= startDate && postedDate <= endDate;
    });
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return (((current - previous) / previous) * 100).toFixed(2);
};

/**
 * Get month name from date
 */
export const getMonthYear = (date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const d = new Date(date);
    return `${months[d.getMonth()]} ${d.getFullYear()}`;
};

/**
 * Create location hierarchy (for grouping similar locations)
 */
export const normalizeLocation = (location) => {
    return location
        .toLowerCase()
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/[^\w\s]/gi, '');
};

/**
 * Calculate quartiles for price distribution
 */
export const calculateQuartiles = (values) => {
    if (!values || values.length === 0) return { q1: 0, q2: 0, q3: 0 };
    
    const sorted = [...values].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1 = sorted[Math.floor(n * 0.25)];
    const q2 = sorted[Math.floor(n * 0.50)]; // Median
    const q3 = sorted[Math.floor(n * 0.75)];
    
    return { q1, q2, q3 };
};

/**
 * Detect outliers using IQR method
 */
export const detectOutliers = (values) => {
    const { q1, q3 } = calculateQuartiles(values);
    const iqr = q3 - q1;
    const lowerBound = q1 - (1.5 * iqr);
    const upperBound = q3 + (1.5 * iqr);
    
    return values.filter(val => val < lowerBound || val > upperBound);
};

/**
 * Calculate standard deviation
 */
export const calculateStandardDeviation = (values) => {
    if (!values || values.length === 0) return 0;
    
    const avg = calculateAverage(values);
    const squareDiffs = values.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = calculateAverage(squareDiffs);
    
    return Math.sqrt(avgSquareDiff);
};

/**
 * Group data by time period (monthly, weekly, etc.)
 */
export const groupByTimePeriod = (properties, period = 'month') => {
    const grouped = {};
    
    properties.forEach(property => {
        const date = new Date(property.postedDate);
        let key;
        
        if (period === 'month') {
            key = date.toISOString().slice(0, 7); // YYYY-MM
        } else if (period === 'week') {
            const weekNum = Math.ceil(date.getDate() / 7);
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${weekNum}`;
        } else if (period === 'year') {
            key = date.getFullYear().toString();
        }
        
        if (!grouped[key]) {
            grouped[key] = [];
        }
        grouped[key].push(property);
    });
    
    return grouped;
};

/**
 * Calculate market saturation score
 */
export const calculateMarketSaturation = (properties, location) => {
    const locationProperties = properties.filter(p => 
        p.propertyLocation.toLowerCase().includes(location.toLowerCase())
    );
    
    const totalProperties = properties.length;
    const locationCount = locationProperties.length;
    
    return {
        saturationPercentage: calculatePercentage(locationCount, totalProperties),
        propertyCount: locationCount,
        totalMarket: totalProperties
    };
};

export default {
    calculateMedian,
    calculateAverage,
    calculatePricePerSqft,
    groupByLocation,
    groupByBedrooms,
    calculatePriceRangeDistribution,
    formatCurrency,
    calculatePercentage,
    getPropertyConfiguration,
    filterByDateRange,
    calculateGrowth,
    getMonthYear,
    normalizeLocation,
    calculateQuartiles,
    detectOutliers,
    calculateStandardDeviation,
    groupByTimePeriod,
    calculateMarketSaturation
};
