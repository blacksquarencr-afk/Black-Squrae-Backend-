import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
{
    url: {
        type: String,
        required: true
    },
    title: {
        type: String,
        default: ""
    },
    thumbnail: {
        type: String,
        default: ""
    },
    uploadedAt: {
        type: Date,
        default: Date.now
    }
},
{ _id: false }
);

const areaDetailSchema = new mongoose.Schema(
{
    type: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    display: {
        type: Boolean,
        default: true
    }
},
{ _id: false }
);

const additionalChargeSchema = new mongoose.Schema(
{
    chargeName: String,
    amount: String,
    frequency: {
        type: String,
        default: "One Time"
    },
    unit: {
        type: String,
        default: "Total Amount"
    }
},
{ _id: false }
);

const listPropertySchema = new mongoose.Schema({

    // ================= SYSTEM =================

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true
    },

    customUserId: {
        type: String,
        default: ""
    },

    adminId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },

    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee"
    },

    builderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Builder"
    },

    isPostedByAdmin: {
        type: Boolean,
        default: false
    },

    isPostedByEmployee: {
        type: Boolean,
        default: false
    },

    customPropertyId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },

    // ================= STEP 1 =================

    listingType: {
        type: String,
        enum: ["Sale", "Rent"],
        default: "Sale",
        index: true
    },

    buildingType: {
        type: String,
        enum: ["Residential", "Commercial"],
        default: "Residential",
        index: true
    },

    propertyType: {
        type: String,
        index: true
    },

    city: {
        type: String,
        index: true,
        trim: true
    },

    locality: {
        type: String,
        index: true,
        trim: true
    },

    projectName: String,

    suitedFor: String,
    roomType: String,
    totalBeds: String,

    bhk: String,

    additionalSpaces: {
        type: [String],
        default: []
    },

    // ================= AREA =================

    areaUnit: {
        type: String,
        default: "sq.ft"
    },

    areaDetails: {
        type: [areaDetailSchema],
        default: []
    },

    areaValue: Number,

    // ================= PRICE =================

    price: {
        type: Number,
        required: true,
        index: true
    },

    priceUnit: String,

    priceType: {
        type: String,
        default: "All Inclusive"
    },

    additionalCharges: {
        type: [additionalChargeSchema],
        default: []
    },

    maintenance: Number,

    maintenanceUnit: {
        type: String,
        default: "Monthly"
    },

    maintenanceIncluded: {
        type: Boolean,
        default: false
    },

    securityDeposit: {
        type: String,
        default: "Zero Deposit"
    },

    depositAmount: String,

    // ================= STEP 2 =================

    possessionStatus: {
        type: String,
        enum: [
            "Ready to Move",
            "Under Construction"
        ],
        default: "Ready to Move",
        index: true
    },

    possessionDate: {
        type: Date,
        validate: {
            validator: function (value) {
                if (this.possessionStatus === "Under Construction") {
                    return value != null;
                }
                return true;
            },
            message: "Possession date required for Under Construction"
        }
    },

    propertyAge: String,

    bathrooms: String,

    coveredParking: {
        type: String,
        default: "N/A"
    },

    openParking: {
        type: String,
        default: "N/A"
    },

    balcony: {
        type: [String],
        default: []
    },

    pgType: String,
    sharingType: String,
    foodIncluded: String,

    washroomType: String,
    pantryCafeteria: String,

    // ================= STEP 3 MEDIA =================

    photos: {
        type: [String],
        default: []
    },

    videos: {
        type: [videoSchema],
        default: []
    },

    brochure: String,

    flooring: String,
    towerBlock: String,
    unitNo: String,

    keepUnitPrivate: {
        type: Boolean,
        default: false
    },

    priceAdvantages: String,
    ownershipType: String,

    propertyHighlights: {
        type: [String],
        default: []
    },

    // ================= STEP 4 =================

    transactionType: {
        type: String,
        default: "New Booking"
    },

    connectingRoadWidth: Number,

    roadWidthUnit: {
        type: String,
        default: "Feet"
    },

    superBuiltUpArea: {
        type: Number,
        default: null
    },

    builtUpArea: {
        type: Number,
        default: null
    },

    carpetArea: {
        type: Number,
        default: null
    },

    floorNumber: Number,
    totalFloors: Number,

    facing: {
        type: String,
        index: true
    },

    powerBackup: String,
    views: String,

    furnishing: {
        type: String,
        default: "Unfurnished"
    },

    furnishingItems: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },

    // ================= LOCATION =================

    latitude: Number,
    longitude: Number,

    address: String,

    amenities: {
        type: [String],
        default: []
    },

    // ================= STEP 5 =================

    title: {
        type: String,
        index: true
    },

    description: {
        type: String,
        maxlength: 5000
    },

    contactNumber: String,

    // ================= FLAGS =================

    isSold: {
        type: Boolean,
        default: false,
        index: true
    },

    isNewLaunch: {
        type: Boolean,
        default: false
    },

    exclusive: {
        type: Boolean,
        default: false
    },
    
    isVerified: {
        type: Boolean,
        default: false,
        index: true
    },

    verifiedAt: {
        type: Date
    },

    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin"
    },


    postedDate: {
        type: Date,
        default: Date.now,
        index: true
    },

    // Deprecated
    bedrooms: Number,
    balconies: Number

},
{
    timestamps: true,
    collection: "listproperties"
});

const ListProperty = mongoose.model(
    "ListProperty",
    listPropertySchema
);

export default ListProperty;