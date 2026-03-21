import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Role from './models/roleSchema.js';

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

// Add feedback-management permission to admin role
const addFeedbackPermission = async () => {
  try {
    // Find all roles to see what we have
    console.log('\n📋 Finding all roles...');
    const allRoles = await Role.find({}, 'name permissions');
    
    console.log('\n🔍 Existing Roles:');
    allRoles.forEach(role => {
      console.log(`  - ${role.name} (${role._id})`);
      const hasFeedbackPerm = role.permissions.some(p => p.module === 'feedback-management');
      if (hasFeedbackPerm) {
        console.log('    ✅ Already has feedback-management permission');
      } else {
        console.log('    ❌ Missing feedback-management permission');
      }
    });

    // Add permission to all roles that don't have it
    console.log('\n🔧 Adding feedback-management permission...');
    
    const result = await Role.updateMany(
      {
        'permissions.module': { $ne: 'feedback-management' }
      },
      {
        $push: {
          permissions: {
            module: 'feedback-management',
            actions: ['create', 'read', 'update', 'delete']
          }
        }
      }
    );

    console.log(`\n✅ Updated ${result.modifiedCount} role(s)`);

    // Verify the update
    console.log('\n🔍 Verifying updates...');
    const updatedRoles = await Role.find({}, 'name permissions');
    
    updatedRoles.forEach(role => {
      const feedbackPerm = role.permissions.find(p => p.module === 'feedback-management');
      if (feedbackPerm) {
        console.log(`  ✅ ${role.name}: Has feedback-management permission`);
        console.log(`     Actions: ${feedbackPerm.actions.join(', ')}`);
      } else {
        console.log(`  ❌ ${role.name}: Still missing permission`);
      }
    });

    console.log('\n⚠️  IMPORTANT: Admin must LOG OUT and LOG IN again for changes to take effect!');
    console.log('✨ Done!');
    
  } catch (error) {
    console.error('❌ Error adding permission:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Disconnected from MongoDB');
    process.exit(0);
  }
};

// Run the script
(async () => {
  await connectDB();
  await addFeedbackPermission();
})();
