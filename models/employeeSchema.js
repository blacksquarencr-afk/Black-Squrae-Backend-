import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  phone: {
    type: String,
    required: true,
    trim: true,
    match: [/^\d{10,11}$/, 'Please enter a valid 10-11 digit phone number']
  },
  role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role',
    required: true
  },
  roleName: {
    type: String,
    default: ""
  },
  reportingTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },
  team: {
    type: String,
    default: null
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  profilePicture: {
    type: String,
    default: null
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  department: {
    type: String,
    default: null
  },
  giveAdminAccess: {
    type: Boolean,
    default: false
  },
  // Individual employee permissions (not from role)
  permissions: [{
    module: {
      type: String,
      required: true,
      enum: [
        'dashboard',
        'users',
        'roles',
        'employees',
        'employee_reports',
        'properties',
        'bought-property',
        'service-management',
        'enquiries',
        'career-applications',
        'content-management',
        'settings',
        'feedback-management',
        'chatbot-management',
        'all_leads',
        'lead_distribution',
        'deals',
        'projects',
        'sales_performance',
        'reports',
        'site_visits',
        'commission'
      ]
    },
    actions: [{
      type: String,
      enum: ['create', 'read', 'update', 'delete']
    }]
  }],
  // Admin reminder popup settings
  adminReminderPopupEnabled: {
    type: Boolean,
    default: false
  },
  // FCM Token for push notifications
  fcmToken: {
    type: String,
    default: ""
  },
  joinDate: {
    type: Date,
    default: Date.now
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
employeeSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Index for faster queries
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1 });
employeeSchema.index({ isActive: 1 });

const Employee = mongoose.models.Employee || mongoose.model('Employee', employeeSchema);

export default Employee;