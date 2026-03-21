// Add Feedback Management Permission to Admin Role
// Run this script in MongoDB to fix the "Access Denied" error

// Connect to your database
// mongosh
// use your_database_name

// OPTION 1: Add permission to specific role by name (e.g., "Admin")
db.roles.updateOne(
  { name: "Admin" },  // Change this to match your admin role name
  {
    $addToSet: {
      permissions: {
        module: "feedback-management",
        actions: ["create", "read", "update", "delete"]
      }
    }
  }
);

// OPTION 2: Add permission to ALL roles (if you want all employees to access feedback)
db.roles.updateMany(
  {},
  {
    $addToSet: {
      permissions: {
        module: "feedback-management",
        actions: ["create", "read", "update", "delete"]
      }
    }
  }
);

// OPTION 3: Find your admin role first, then update
// Step 1: Find all roles
db.roles.find({}, { name: 1, _id: 1 }).pretty();

// Step 2: Copy the _id of your admin role and update it
// db.roles.updateOne(
//   { _id: ObjectId("YOUR_ROLE_ID_HERE") },
//   {
//     $addToSet: {
//       permissions: {
//         module: "feedback-management",
//         actions: ["create", "read", "update", "delete"]
//       }
//     }
//   }
// );

// VERIFY: Check if permission was added
db.roles.findOne(
  { name: "Admin" },  // Change to your role name
  { name: 1, permissions: 1 }
).pretty();

// You should see something like:
// {
//   "_id": ObjectId("..."),
//   "name": "Admin",
//   "permissions": [
//     ...other permissions...,
//     {
//       "module": "feedback-management",
//       "actions": ["create", "read", "update", "delete"]
//     }
//   ]
// }

print("✅ Permission added successfully!");
print("⚠️ IMPORTANT: You must LOG OUT and LOG IN again for changes to take effect!");
