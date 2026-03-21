
import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Import models
import User from "./models/user.js";
import Buy from "./models/buyPropertySchema.js";
import Property from "./models/addProps.js";
// ...import other models as needed

const MONGO_CONN = process.env.MONGO_CONN;

async function seed() {
  try {
    console.log("MONGO_CONN:", MONGO_CONN);
    if (!MONGO_CONN) {
      throw new Error("MONGO_CONN is undefined. Check your .env file and dotenv config.");
    }
    await mongoose.connect(MONGO_CONN);
    console.log("Connected to MongoDB");

    // Seed User
    await User.deleteMany({});
    await User.create({
      fullName: "John Doe",
      email: "john@example.com",
      phone: "1234567890",
      state: "State",
      city: "City",
      street: "123 Main St",
      pinCode: "123456",
      password: "password123",
      avatar: "",
      photosAndVideo: [],
      lastLogin: new Date(),
      isEmailVerified: true,
      isPhoneVerified: true,
      resetOtp: 123456,
      otpExpiry: new Date(Date.now() + 3600000),
      isOtpVerified: true,
      fcmToken: "token123",
      googleId: null,
      loginProvider: "manual"
    });
    console.log("Seeded User");

    // Seed Property
    await Property.deleteMany({});
    const sampleProperty = await Property.create({
      customPropertyId: "PROP001",
      propertyLocation: "Sector 63, Noida, Uttar Pradesh",
      areaDetails: 1200,
      bedrooms: 3,
      bathrooms: 2,
      balconies: 1,
      floorNumber: 5,
      totalFloors: 10,
      facingDirection: "East",
      availability: "Ready to Move",
      price: 15000000,
      description: "Beautiful 3BHK apartment in prime location",
      furnishingStatus: "Furnished",
      parking: "Available",
      purpose: "Sell",
      propertyType: "Residential",
      residentialType: "Apartment",
      contactNumber: "9876543210",
      isPostedByAdmin: false,
      geoLocation: {
        type: "Point",
        coordinates: [77.3667, 28.6167] // Noida coordinates
      }
    });

    // Add another property
    await Property.create({
      customPropertyId: "PROP002",
      propertyLocation: "Sector 18, Noida, Uttar Pradesh",
      areaDetails: 950,
      bedrooms: 2,
      bathrooms: 2,
      balconies: 1,
      floorNumber: 3,
      totalFloors: 8,
      facingDirection: "North",
      availability: "Ready to Move",
      price: 12500000,
      description: "Modern 2BHK apartment with all amenities",
      furnishingStatus: "Semi-Furnished",
      parking: "Available",
      purpose: "Sell",
      propertyType: "Residential",
      residentialType: "Apartment",
      contactNumber: "9876543211",
      isPostedByAdmin: true,
      geoLocation: {
        type: "Point",
        coordinates: [77.3167, 28.5767]
      }
    });

    // Add a commercial property
    await Property.create({
      customPropertyId: "PROP003",
      propertyLocation: "Sector 16, Noida, Uttar Pradesh",
      areaDetails: 800,
      bedrooms: 1,
      bathrooms: 1,
      balconies: 0,
      floorNumber: 2,
      totalFloors: 4,
      facingDirection: "West",
      availability: "Ready to Move",
      price: 8000000,
      description: "Prime commercial office space",
      furnishingStatus: "Semi-Furnished",
      parking: "Available",
      purpose: "Rent/Lease",
      propertyType: "Commercial",
      commercialType: "office",
      contactNumber: "9876543212",
      isPostedByAdmin: true,
      noticePeriod: "1 Month",
      geoLocation: {
        type: "Point",
        coordinates: [77.3267, 28.5867]
      }
    });

    console.log("Seeded 3 Properties");

    // Seed Buy
    await Buy.deleteMany({});
    const sampleUser = await User.findOne();
    await Buy.create({
      userId: sampleUser._id,
      propertyId: sampleProperty._id,
    });
    console.log("Seeded Buy");

    // ...repeat for other models

    console.log("Seeding complete");
    process.exit(0);
  } catch (err) {
    console.error("Seeding error:", err);
    process.exit(1);
  }
}

seed();
