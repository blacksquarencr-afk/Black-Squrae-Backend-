import mongoose from "mongoose";

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  department: {
    type: String,
    required: false,
    trim: true,
    enum: ['Sales Dept', 'Operation Dept', 'Service Dept', 'Digital Media Dept', 'IT Dept']
  },
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
  isActive: {
    type: Boolean,
    default: true
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
roleSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Role = mongoose.models.Role || mongoose.model('Role', roleSchema);

export default Role;