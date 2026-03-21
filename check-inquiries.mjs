import mongoose from "mongoose";
import dotenv from "dotenv";
import Inquiry from "./models/inquirySchema.js";
import ManualInquiry from "./models/manualInquirySchema.js";
import Enquiry from "./models/enquirySchema.js";

dotenv.config();

async function checkInquiries() {
  try {
    await mongoose.connect(process.env.MONGO_CONN);
    console.log("✅ Connected to MongoDB\n");

    // Check the specific ID
    const searchId = "69661baabc8d8a3b31dd7aa9";
    
    console.log(`🔍 Searching for ID: ${searchId}\n`);

    // Check in Inquiry collection
    const inquiry = await Inquiry.findById(searchId);
    if (inquiry) {
      console.log("✅ Found in Inquiry collection:");
      console.log(JSON.stringify(inquiry, null, 2));
    } else {
      console.log("❌ Not found in Inquiry collection");
    }

    // Check in ManualInquiry collection
    const manualInquiry = await ManualInquiry.findById(searchId);
    if (manualInquiry) {
      console.log("\n✅ Found in ManualInquiry collection:");
      console.log(JSON.stringify(manualInquiry, null, 2));
    } else {
      console.log("❌ Not found in ManualInquiry collection");
    }

    // Check in new Enquiry collection
    const enquiry = await Enquiry.findById(searchId);
    if (enquiry) {
      console.log("\n✅ Found in Enquiry collection:");
      console.log(JSON.stringify(enquiry, null, 2));
    } else {
      console.log("❌ Not found in Enquiry collection");
    }

    // Get counts
    console.log("\n📊 Collection Statistics:");
    const inquiryCount = await Inquiry.countDocuments();
    const manualInquiryCount = await ManualInquiry.countDocuments();
    const enquiryCount = await Enquiry.countDocuments();
    
    console.log(`- Inquiry: ${inquiryCount} documents`);
    console.log(`- ManualInquiry: ${manualInquiryCount} documents`);
    console.log(`- Enquiry: ${enquiryCount} documents`);

    // Get sample IDs from each collection
    console.log("\n📝 Sample IDs from each collection:");
    
    const sampleInquiries = await Inquiry.find().limit(5).select('_id propertyId buyerId createdAt');
    if (sampleInquiries.length > 0) {
      console.log("\nInquiry samples:");
      sampleInquiries.forEach(i => console.log(`  - ID: ${i._id}, Property: ${i.propertyId}, Buyer: ${i.buyerId}`));
    }

    const sampleManualInquiries = await ManualInquiry.find().limit(5).select('_id fullName contactNumber createdAt');
    if (sampleManualInquiries.length > 0) {
      console.log("\nManualInquiry samples:");
      sampleManualInquiries.forEach(i => console.log(`  - ID: ${i._id}, Name: ${i.fullName}, Contact: ${i.contactNumber}`));
    }

    const sampleEnquiries = await Enquiry.find().limit(5).select('_id enquiryType fullName mobileNumber createdAt');
    if (sampleEnquiries.length > 0) {
      console.log("\nEnquiry samples:");
      sampleEnquiries.forEach(i => console.log(`  - ID: ${i._id}, Type: ${i.enquiryType}, Name: ${i.fullName}, Mobile: ${i.mobileNumber}`));
    }

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");

  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

checkInquiries();
