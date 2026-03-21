import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Employee from './models/employeeSchema.js';
import Role from './models/roleSchema.js';
import jwt from 'jsonwebtoken';

dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_CONN);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

// Debug employee permissions
const debugEmployeePermissions = async () => {
  try {
    console.log('\n🔍 Checking all employees and their permissions...\n');
    
    // Get all employees with their roles
    const employees = await Employee.find({ isActive: true })
      .populate('role')
      .select('name email role giveAdminAccess');
    
    console.log(`Found ${employees.length} active employees:\n`);
    
    for (const employee of employees) {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`👤 Employee: ${employee.name}`);
      console.log(`📧 Email: ${employee.email}`);
      console.log(`🆔 ID: ${employee._id}`);
      console.log(`👑 Admin Access: ${employee.giveAdminAccess ? 'YES' : 'NO'}`);
      
      if (employee.role) {
        console.log(`\n📋 Role: ${employee.role.name}`);
        console.log(`🔒 Role Active: ${employee.role.isActive ? 'YES' : 'NO'}`);
        console.log(`\n🔑 Permissions:`);
        
        const feedbackPerm = employee.role.permissions.find(p => 
          p.module === 'feedback-management' || p.module === 'feedback'
        );
        
        if (feedbackPerm) {
          console.log(`  ✅ Feedback Permission: ${feedbackPerm.module}`);
          console.log(`     Actions: ${feedbackPerm.actions.join(', ')}`);
        } else {
          console.log(`  ❌ NO FEEDBACK PERMISSION FOUND`);
          console.log(`\n  Available permissions:`);
          employee.role.permissions.forEach(p => {
            console.log(`    - ${p.module}: [${p.actions.join(', ')}]`);
          });
        }
        
        // Generate a test token for this employee
        const token = jwt.sign(
          { id: employee._id, email: employee.email },
          process.env.JWT_SECRET,
          { expiresIn: '7d' }
        );
        
        console.log(`\n🎫 Test Token (use this for API calls):`);
        console.log(`Bearer ${token}`);
        
      } else {
        console.log(`  ❌ NO ROLE ASSIGNED!`);
      }
    }
    
    console.log(`\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`\n💡 TESTING INSTRUCTIONS:`);
    console.log(`\n1. Copy the token for your admin employee`);
    console.log(`2. Test the API with:`);
    console.log(`\ncurl -X GET "https://backend.blacksquare.estate/api/feedback/stats/overview" \\`);
    console.log(`  -H "Authorization: Bearer YOUR_TOKEN_HERE"`);
    console.log(`\n3. If you see "Access Denied", the employee/role might not be set up correctly`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
(async () => {
  await connectDB();
  await debugEmployeePermissions();
})();
