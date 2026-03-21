import mongoose from "mongoose";

const listPropertySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "Employee" },
    builderId: { type: mongoose.Schema.Types.ObjectId, ref: "Builder" },
    isPostedByAdmin: { type: Boolean, default: false },
    isPostedByEmployee: { type: Boolean, default: false },
    customPropertyId: { type: String },

    listingType: { type: String },
    buildingType: { type: String },
    propertyType: { type: String },
    city: { type: String },
    locality: { type: String },
    projectName: { type: String },
    address: { type: String },
    bhk: { type: String },
    additionalSpaces: { type: [String], default: [] },
    areaDetails: [
        {
            type: { type: String },
            size: { type: Number }
        }
    ],
    areaValue: { type: Number },
    areaUnit: { type: String },
    price: { type: Number },
    priceUnit: { type: String },
    priceType: { type: String },
    additionalCharges: [
        {
            chargeName: { type: String },
            amount: { type: String },
            frequency: { type: String },
            unit: { type: String }
        }
    ],
    maintenance: { type: Number },
    maintenanceUnit: { type: String },
    maintenanceIncluded: { type: Boolean },
    securityDeposit: { type: String },
    depositAmount: { type: Number },
    possessionStatus: { type: String },
    propertyAge: { type: String },
    bedrooms: { type: Number },
    bathrooms: { type: Number },
    coveredParking: { type: String },
    openParking: { type: String },
    balcony: { type: [String], default: [] },
    balconies: { type: Number },
    floorNumber: { type: Number },
    totalFloors: { type: Number },
    flooring: { type: String },
    towerBlock: { type: String },
    unitNo: { type: String },
    priceAdvantages: { type: String },
    ownershipType: { type: String },
    propertyHighlights: { type: [String], default: [] },
    videos: [
        {
            url: { type: String }
        }
    ],
    facing: { type: String },
    powerBackup: { type: String },
    views: { type: String },
    furnishing: { type: String },
    furnishingItems: { type: mongoose.Schema.Types.Mixed },
    amenities: { type: [String], default: [] },
    transactionType: { type: String },
    title: { type: String },
    description: { type: String },
    contactNumber: { type: String },
    latitude: { type: Number },
    longitude: { type: Number },
    photos: { type: [String], default: [] },
    isSold: { type: Boolean, default: false },
    isNewLaunch: { type: Boolean, default: false },
    exclusive: { type: Boolean, default: false },
    postedDate: { type: Date, default: Date.now },
}, { timestamps: true, collection: 'listproperties' });

const ListProperty = mongoose.model("ListProperty", listPropertySchema);
export default ListProperty;
