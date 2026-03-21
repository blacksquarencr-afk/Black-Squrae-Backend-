
import mongoose from "mongoose";

const propertySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // **CHANGED: Removed 'required: true'**
    customUserId: { type: String, default: "" }, // Custom readable user ID like USR-0001
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" }, // **NEW FIELD**
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" }, // **NEW FIELD for employees**
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: "Builder" }, // **NEW FIELD for builder**
    isPostedByAdmin: { type: Boolean, default: false },
    isPostedByEmployee: { type: Boolean, default: false }, // **NEW FIELD**
    // Custom ID for tracking (NEW)
    customPropertyId: {
        type: String,
        unique: true,
        required: true,
    },

    // Basic Details
    propertyLocation: { type: String, required: true },
    propertyTitle: { type: String, default: "" }, // Optional title for the property
    geoLocation: {
        type: { type: String, enum: ["Point"], default: "Point" },
        coordinates: { type: [Number], default: [0, 0] }, // [longitude, latitude]
    },
    areaDetails: { type: Number, required: true }, // in Sq.Ft

    // Property Size (NEW)
    bedrooms: {
        type: Number,
        required: function () {
            return !(this.residentialType === "Plot" || this.residentialType === "Agricultural Land" || this.propertyType === "Land");
        },
        min: 0,
        default: 0
    },
    bathrooms: {
        type: Number,
        required: function () {
            return !(this.residentialType === "Plot" || this.residentialType === "Agricultural Land" || this.propertyType === "Land");
        },
        min: 0,
        default: 0
    },
    balconies: {
        type: Number,
        enum: [0, 1, 2, 3],
        required: function () {
            return !(this.residentialType === "Plot" || this.residentialType === "Agricultural Land" || this.propertyType === "Commercial" || this.propertyType === "Land");
        },
        default: 0
    },

    // Age of Property
    ageOfProperty: { type: String, default: "" },

    // Balcony Type
    balconyType: {
        type: String,
        enum: ["Connected", "Individual", "Room-attached", "Open", ""],
        default: ""
    },

    // Washroom Type
    washroomType: {
        type: String,
        enum: ["Private", "Shared", "Both", "Indian", ""],
        default: ""
    },

    // Pantry/Cafeteria
    pantryCafeteria: {
        type: String,
        enum: ["Available", "Not Available", ""],
        default: ""
    },

    // Building Details (NEW)
    floorNumber: {
        type: Number,
        required: function () {
            return !(this.residentialType === "Plot" || this.residentialType === "Agricultural Land" || this.propertyType === "Land");
        },
        default: 0
    },
    totalFloors: {
        type: Number,
        required: function () {
            return !(this.residentialType === "Plot" || this.residentialType === "Agricultural Land" || this.propertyType === "Land");
        },
        default: 0
    },

    // Flooring Type
    flooringType: {
        type: String,
        enum: ["Marble", "Vitrified", "Wooden", "Granite", "Mosaic", "Cement", "Other"],
        default: "Other"
    },

    // Other Details
    facingDirection: {
        type: String,
        enum: ["North", "South", "East", "West"],
        required: true
    },
    availability: {
        type: String,
        enum: ["Ready to Move", "Under Construction"],
        required: true,
    },
    price: { type: Number, required: true },
    description: { type: String, required: true },
    photosAndVideo: { type: [String], default: [] },
    brochure: { type: String, default: "" }, // PDF brochure (optional)
    furnishingStatus: {
        type: String,
        enum: ["Furnished", "Semi-Furnished", "Unfurnished"],
        required: true,
    },
    parking: {
        type: String,
        enum: ["Available", "Not Available"],
        required: true,
    },

    // Purpose-Based Fields
    purpose: {
        type: String,
        enum: ["Sell", "Rent/Lease", "Paying Guest"],
        required: true,
    },

    // Rent/Lease & PG Fields (NEW/UPDATED)
    noticePeriod: {
        type: String,
        enum: ["15 Days", "1 Month", "2 Months"],
        required: function () {
            return this.purpose === "Rent/Lease" || this.purpose === "Paying Guest";
        },
    },
    foodIncluded: {
        type: String,
        enum: ["Yes", "No", "Optional"],
        required: function () {
            return this.purpose === "Paying Guest";
        },
    },

    // PG Specific Fields (NEW)
    pgType: {
        type: String,
        enum: ["Boys PG", "Girls PG", "Co-living"],
        required: function () {
            return this.purpose === "Paying Guest";
        },
    },
    sharingType: {
        type: String,
        enum: ["Single Room", "Double Sharing", "Triple Sharing"],
        required: function () {
            return this.purpose === "Paying Guest";
        },
    },

    // Property Type
    propertyType: {
        type: String,
        enum: ["Residential", "Commercial", "Land"],
        required: true,
    },
    commercialType: {
        type: String,
        enum: ["Office", "Shop", "Warehouse", "Industrial"],
        required: function () {
            return this.propertyType === "Commercial";
        },
    },
    residentialType: {
        type: String,
        enum: ["Apartment", "Villa", "Plot", "PG/Hostel", "Agricultural Land", "Builder Floor"],
        required: function () {
            return this.propertyType === "Residential" || this.propertyType === "Land";
        },
    },



    // Contact & Stats
    contactNumber: { type: String, required: true },

    // Amenities (NEW)
    amenities: {
        type: [String],
        enum: [
            // Sports
            "Gymnasium",
            "Swimming Pool",
            "Kids' Pool",
            "Badminton Court(s)",
            "Tennis Court(s)",
            "Cricket",
            "Kids' Play Areas / Sand Pits",
            "Basketball",
            "Volleyball",
            "Yoga Areas",
            "Basketball Court",
            "Jogging / Cycle Track",
            "Table Tennis",
            "Tennis Court",
            "Snooker/Pool/Billiards",
            "Rappelling/Rock Climbing",
            // Convenience
            "Power Backup",
            "Medical Facility",
            "Pet Area",
            "24*7 Water Supply",
            "24x7 Security",
            "Lift",
            "Library",
            // Safety
            "24 x 7 Security",
            "CCTV / Video Surveillance",
            "Leisure",
            "Cafe / Coffee Bar",
            "Reading Room/Library",
            "Party Hall",
            "Clubhouse",
            "Amphitheater",
            "Indoor Games",
            "Rock Climbing",
            "Landscaped Garden",
            "Snooker",
            "Spa",
            "Cafe",
            "Jacuzzi",
            "Senior Citizen Area",
            "Environment",
            "Large Green Area"
        ],
        default: []
    },

    visitCount: { type: Number, default: 0 },
    visitedBy: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            visitedAt: { type: Date, default: Date.now },
        },
    ],

    // Recent Updates (NEW)
    recentUpdates: [
        {
            date: { type: String, required: true },
            text: { type: String, required: true },
        },
    ],

    postedDate: { type: Date, default: Date.now },
    exclusive: { type: Boolean, default: false },
    isSold: { type: Boolean, default: false },
    isNewLaunch: { type: Boolean, default: false },
});

// Geospatial index
propertySchema.index({ geoLocation: "2dsphere" });

const Property = mongoose.model("Property", propertySchema);
export default Property;