import mongoose from "mongoose";
import BookPropertyEnquiry from "./models/bookPropertyEnquiry.js";
import RentReceipt from "./models/rentReceiptModel.js";
import Employee from "./models/employeeSchema.js";
import LeadAssignment from "./models/leadAssignmentSchema.js";
import dotenv from "dotenv";

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://blacksquarencr_db_user:nW6k0WwOctfTDNxL@cluster1.85qtouq.mongodb.net/blacksquare";

async function assignExistingServiceEnquiries() {
  try {
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Get all active employees
    const employees = await Employee.find({ isActive: true });
    
    if (!employees || employees.length === 0) {
      console.log("❌ No active employees found. Please create employees first.");
      process.exit(1);
    }

    console.log(`👥 Found ${employees.length} active employees\n`);

    // ========== BOOK PROPERTY ENQUIRIES ==========
    console.log("📋 Processing Book Property Online Enquiries...");
    const unassignedBookings = await BookPropertyEnquiry.find({
      assignedToEmployee: null
    });

    console.log(`Found ${unassignedBookings.length} unassigned book property enquiries`);

    let bookingAssignedCount = 0;
    for (let i = 0; i < unassignedBookings.length; i++) {
      const booking = unassignedBookings[i];
      const roundRobinIndex = i % employees.length;
      const assignedEmployee = employees[roundRobinIndex];

      // Update booking
      booking.assignedToEmployee = assignedEmployee._id;
      booking.priority = booking.priority || "medium";
      await booking.save();

      // Create LeadAssignment
      await LeadAssignment.create({
        employeeId: assignedEmployee._id,
        enquiryId: booking._id,
        enquiryType: "BookPropertyEnquiry",
        status: "active",
        priority: booking.priority || "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by migration script via Round Robin"
      });

      bookingAssignedCount++;
      console.log(`  ✓ Assigned booking ${booking._id} to ${assignedEmployee.name}`);
    }

    console.log(`✅ Assigned ${bookingAssignedCount} book property enquiries\n`);

    // ========== RENT RECEIPTS ==========
    console.log("🧾 Processing Rent Receipts...");
    const unassignedReceipts = await RentReceipt.find({
      assignedToEmployee: null
    });

    console.log(`Found ${unassignedReceipts.length} unassigned rent receipts`);

    let receiptAssignedCount = 0;
    for (let i = 0; i < unassignedReceipts.length; i++) {
      const receipt = unassignedReceipts[i];
      const roundRobinIndex = i % employees.length;
      const assignedEmployee = employees[roundRobinIndex];

      // Update receipt
      receipt.assignedToEmployee = assignedEmployee._id;
      receipt.priority = receipt.priority || "medium";
      await receipt.save();

      // Create LeadAssignment
      await LeadAssignment.create({
        employeeId: assignedEmployee._id,
        enquiryId: receipt._id,
        enquiryType: "RentReceipt",
        status: "active",
        priority: receipt.priority || "medium",
        assignedDate: new Date(),
        notes: "Auto-assigned by migration script via Round Robin"
      });

      receiptAssignedCount++;
      console.log(`  ✓ Assigned receipt ${receipt._id} to ${assignedEmployee.name}`);
    }

    console.log(`✅ Assigned ${receiptAssignedCount} rent receipts\n`);

    // ========== SUMMARY ==========
    console.log("\n📊 SUMMARY:");
    console.log(`  ✅ Book Property Enquiries Assigned: ${bookingAssignedCount}`);
    console.log(`  ✅ Rent Receipts Assigned: ${receiptAssignedCount}`);
    console.log(`  📈 Total Assigned: ${bookingAssignedCount + receiptAssignedCount}`);

    console.log("\n✨ Migration completed successfully!");
    process.exit(0);

  } catch (error) {
    console.error("\n❌ Error during migration:", error);
    process.exit(1);
  }
}

// Run the migration
assignExistingServiceEnquiries();
