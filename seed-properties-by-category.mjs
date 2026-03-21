import mongoose from "mongoose";
import dotenv from "dotenv";
import Property from "./models/addProps.js";
import User from "./models/user.js";

dotenv.config();

async function seedPropertiesByCategory() {
  try {
    await mongoose.connect(process.env.MONGO_CONN);
    console.log("✅ Connected to MongoDB\n");

    // Get a sample user for property ownership
    let user = await User.findOne();

    if (!user) {
      console.log("⚠️  No user found, creating sample user...");
      user = await User.create({
        fullName: "Sample User",
        email: "sampleuser@test.com",
        phone: "9999999999",
        password: "$2a$10$samplehashedpassword",
        state: "Delhi",
        city: "New Delhi",
        isPhoneVerified: true
      });
    }

    console.log("📊 Creating properties for all categories...\n");

    // 1. BUY PROPERTIES - Residential
    const buyResidentialProperties = [
      {
        customPropertyId: "U-BUY-001",
        propertyLocation: "Sector 62, Noida, Uttar Pradesh",
        areaDetails: 1200,
        bedrooms: 3,
        bathrooms: 2,
        balconies: 2,
        floorNumber: 5,
        totalFloors: 10,
        facingDirection: "East",
        availability: "Ready to Move",
        price: 8500000,
        description: "Spacious 3BHK apartment in prime location with modern amenities",
        furnishingStatus: "Semi-Furnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543210",
        userId: user._id
      },
      {
        customPropertyId: "U-BUY-002",
        propertyLocation: "DLF Phase 3, Gurgaon, Haryana",
        areaDetails: 2500,
        bedrooms: 4,
        bathrooms: 4,
        balconies: 3,
        floorNumber: 8,
        totalFloors: 15,
        facingDirection: "North",
        availability: "Ready to Move",
        price: 25000000,
        description: "Luxury 4BHK penthouse with stunning views",
        furnishingStatus: "Furnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543211",
        userId: user._id
      },
      {
        customPropertyId: "U-BUY-003",
        propertyLocation: "Indirapuram, Ghaziabad, UP",
        areaDetails: 1800,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        floorNumber: 0,
        totalFloors: 3,
        facingDirection: "South",
        availability: "Ready to Move",
        price: 12000000,
        description: "Independent villa with garden and parking",
        furnishingStatus: "Semi-Furnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Residential",
        residentialType: "Villa",
        contactNumber: "9876543212",
        userId: user._id
      }
    ];

    // 2. RENTAL PROPERTIES
    const rentalProperties = [
      {
        customPropertyId: "U-RENT-001",
        propertyLocation: "Sector 18, Noida, Uttar Pradesh",
        areaDetails: 1000,
        bedrooms: 2,
        bathrooms: 2,
        balconies: 1,
        floorNumber: 3,
        totalFloors: 8,
        facingDirection: "West",
        availability: "Ready to Move",
        price: 25000,
        description: "Well-maintained 2BHK apartment for rent near metro",
        furnishingStatus: "Furnished",
        parking: "Available",
        purpose: "Rent/Lease",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543213",
        userId: user._id
      },
      {
        customPropertyId: "U-RENT-002",
        propertyLocation: "Malviya Nagar, Delhi",
        areaDetails: 1500,
        bedrooms: 3,
        bathrooms: 2,
        balconies: 2,
        floorNumber: 2,
        totalFloors: 4,
        facingDirection: "North",
        availability: "Ready to Move",
        price: 35000,
        description: "Spacious 3BHK flat for rent in peaceful locality",
        furnishingStatus: "Semi-Furnished",
        parking: "Available",
        purpose: "Rent/Lease",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543214",
        userId: user._id
      }
    ];

    // 3. PROJECTS (Under Construction)
    const projectProperties = [
      {
        customPropertyId: "U-PROJ-001",
        propertyLocation: "Sector 150, Noida, Uttar Pradesh",
        areaDetails: 1400,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 2,
        floorNumber: 6,
        totalFloors: 20,
        facingDirection: "East",
        availability: "Under Construction",
        price: 7500000,
        description: "Premium 3BHK in upcoming project by renowned builder - Expected Possession Dec 2026",
        furnishingStatus: "Unfurnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543215",
        userId: user._id
      },
      {
        customPropertyId: "U-PROJ-002",
        propertyLocation: "Sector 76, Noida, Uttar Pradesh",
        areaDetails: 1650,
        bedrooms: 3,
        bathrooms: 3,
        balconies: 3,
        floorNumber: 10,
        totalFloors: 25,
        facingDirection: "North",
        availability: "Under Construction",
        price: 9800000,
        description: "Modern 3BHK with smart home features - Expected Possession Mar 2027",
        furnishingStatus: "Unfurnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Residential",
        residentialType: "Apartment",
        contactNumber: "9876543216",
        userId: user._id
      }
    ];

    // 4. PG / HOSTELS
    const pgHostelProperties = [
      {
        customPropertyId: "U-PG-001",
        propertyLocation: "Sector 16, Noida, Uttar Pradesh",
        areaDetails: 150,
        bedrooms: 1,
        bathrooms: 1,
        balconies: 0,
        floorNumber: 2,
        totalFloors: 4,
        facingDirection: "East",
        availability: "Ready to Move",
        price: 8000,
        description: "Single occupancy PG with food and wifi included",
        furnishingStatus: "Furnished",
        parking: "Not Available",
        purpose: "Rent/Lease",
        propertyType: "Residential",
        residentialType: "PG/Hostel",
        contactNumber: "9876543217",
        userId: user._id
      },
      {
        customPropertyId: "U-PG-002",
        propertyLocation: "Greater Kailash, Delhi",
        areaDetails: 120,
        bedrooms: 1,
        bathrooms: 1,
        balconies: 0,
        floorNumber: 1,
        totalFloors: 3,
        facingDirection: "South",
        availability: "Ready to Move",
        price: 12000,
        description: "Premium PG for working professionals near metro",
        furnishingStatus: "Furnished",
        parking: "Available",
        purpose: "Rent/Lease",
        propertyType: "Residential",
        residentialType: "PG/Hostel",
        contactNumber: "9876543218",
        userId: user._id
      }
    ];

    // 5. PLOT & LAND
    const plotLandProperties = [
      {
        customPropertyId: "U-PLOT-001",
        propertyLocation: "Sector 135, Noida, Uttar Pradesh",
        areaDetails: 2000,
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        floorNumber: 0,
        totalFloors: 0,
        facingDirection: "East",
        availability: "Ready to Move",
        price: 15000000,
        description: "Residential plot in developing area with clear title",
        furnishingStatus: "Unfurnished",
        parking: "Not Applicable",
        purpose: "Sell",
        propertyType: "Land",
        residentialType: "Plot",
        contactNumber: "9876543219",
        userId: user._id
      },
      {
        customPropertyId: "U-PLOT-002",
        propertyLocation: "Yamuna Expressway, Greater Noida",
        areaDetails: 5000,
        bedrooms: 0,
        bathrooms: 0,
        balconies: 0,
        floorNumber: 0,
        totalFloors: 0,
        facingDirection: "North",
        availability: "Ready to Move",
        price: 25000000,
        description: "Agricultural land suitable for farming or investment",
        furnishingStatus: "Unfurnished",
        parking: "Not Applicable",
        purpose: "Sell",
        propertyType: "Land",
        residentialType: "Agricultural Land",
        contactNumber: "9876543220",
        userId: user._id
      }
    ];

    // 6. COMMERCIAL PROPERTIES
    const commercialProperties = [
      {
        customPropertyId: "U-COMM-001",
        propertyLocation: "Sector 18, Noida, Uttar Pradesh",
        areaDetails: 800,
        bedrooms: 0,
        bathrooms: 2,
        balconies: 0,
        floorNumber: 2,
        totalFloors: 5,
        facingDirection: "Main Road",
        availability: "Ready to Move",
        price: 12000000,
        description: "Prime commercial space in busy market area",
        furnishingStatus: "Unfurnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Commercial",
        commercialType: "Shop",
        contactNumber: "9876543221",
        userId: user._id
      },
      {
        customPropertyId: "U-COMM-002",
        propertyLocation: "Nehru Place, Delhi",
        areaDetails: 1200,
        bedrooms: 0,
        bathrooms: 3,
        balconies: 0,
        floorNumber: 5,
        totalFloors: 8,
        facingDirection: "North",
        availability: "Ready to Move",
        price: 45000,
        description: "Fully furnished office space with modern amenities",
        furnishingStatus: "Furnished",
        parking: "Available",
        purpose: "Rent/Lease",
        propertyType: "Commercial",
        commercialType: "Office Space",
        contactNumber: "9876543222",
        userId: user._id
      },
      {
        customPropertyId: "U-COMM-003",
        propertyLocation: "Cyber City, Gurgaon",
        areaDetails: 2500,
        bedrooms: 0,
        bathrooms: 5,
        balconies: 0,
        floorNumber: 8,
        totalFloors: 12,
        facingDirection: "Corner",
        availability: "Ready to Move",
        price: 35000000,
        description: "Premium corporate office space with parking",
        furnishingStatus: "Semi-Furnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Commercial",
        commercialType: "Office Space",
        contactNumber: "9876543223",
        userId: user._id
      }
    ];

    // 7. INDUSTRIAL PROPERTIES
    const industrialProperties = [
      {
        customPropertyId: "U-IND-001",
        propertyLocation: "Greater Noida, Uttar Pradesh",
        areaDetails: 5000,
        bedrooms: 0,
        bathrooms: 4,
        balconies: 0,
        floorNumber: 0,
        totalFloors: 1,
        facingDirection: "Main Road",
        availability: "Ready to Move",
        price: 45000000,
        description: "Large warehouse with loading facilities and security",
        furnishingStatus: "Unfurnished",
        parking: "Available",
        purpose: "Sell",
        propertyType: "Commercial",
        commercialType: "Warehouse",
        contactNumber: "9876543224",
        userId: user._id
      },
      {
        customPropertyId: "U-IND-002",
        propertyLocation: "Faridabad Industrial Area, Haryana",
        areaDetails: 3000,
        bedrooms: 0,
        bathrooms: 3,
        balconies: 0,
        floorNumber: 0,
        totalFloors: 1,
        facingDirection: "Corner",
        availability: "Ready to Move",
        price: 60000,
        description: "Industrial shed for manufacturing on rent",
        furnishingStatus: "Unfurnished",
        parking: "Available",
        purpose: "Rent/Lease",
        propertyType: "Commercial",
        commercialType: "Industrial",
        contactNumber: "9876543225",
        userId: user._id
      }
    ];

    // Combine all properties
    const allProperties = [
      ...buyResidentialProperties,
      ...rentalProperties,
      ...projectProperties,
      ...pgHostelProperties,
      ...plotLandProperties,
      ...commercialProperties,
      ...industrialProperties
    ];

    // Clear existing properties (optional)
    console.log("🗑️  Clearing existing properties...");
    await Property.deleteMany({});

    // Insert all properties
    console.log("📥 Inserting properties...\n");
    const insertedProperties = await Property.insertMany(allProperties);

    // Display summary
    console.log("✅ Properties seeded successfully!\n");
    console.log("📊 Summary by Category:");
    console.log(`   🏠 Buy (Residential): ${buyResidentialProperties.length} properties`);
    console.log(`   🏘️  Rental: ${rentalProperties.length} properties`);
    console.log(`   🏗️  Projects (Under Construction): ${projectProperties.length} properties`);
    console.log(`   🛏️  PG/Hostels: ${pgHostelProperties.length} properties`);
    console.log(`   🌳 Plot & Land: ${plotLandProperties.length} properties`);
    console.log(`   🏢 Commercial: ${commercialProperties.length} properties`);
    console.log(`   🏭 Industrial: ${industrialProperties.length} properties`);
    console.log(`   📦 Total: ${insertedProperties.length} properties\n`);

    // Display sample property IDs for testing
    console.log("🆔 Sample Property IDs for testing:");
    insertedProperties.forEach((prop, index) => {
      const categoryMap = {
        0: '🏠 Buy', 1: '🏠 Buy', 2: '🏠 Buy',
        3: '🏘️  Rent', 4: '🏘️  Rent',
        5: '🏗️  Project', 6: '🏗️  Project',
        7: '🛏️  PG', 8: '🛏️  PG',
        9: '🌳 Plot', 10: '🌳 Plot',
        11: '🏢 Commercial', 12: '🏢 Commercial', 13: '🏢 Commercial',
        14: '🏭 Industrial', 15: '🏭 Industrial'
      };
      console.log(`   ${categoryMap[index]}: ${prop.customPropertyId} (${prop._id})`);
    });

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error seeding properties:", error);
    process.exit(1);
  }
}

seedPropertiesByCategory();
