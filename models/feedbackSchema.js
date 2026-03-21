import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema({
  // User who submitted the feedback
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Contact information (in case user updates their profile later)
  contactInfo: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    }
  },

  // Issue type selection
  issueType: {
    type: String,
    required: true,
    enum: [
      'Problem with My Property Listing',
      'Issue with My Enquiries',
      'Concern with My Property Listing Package',
      'Issue with My Property Search',
      'Assistance Needed with Discount Coupons',
      'Problem with a Requested Service',
      'Concern Not Listed Here'
    ]
  },

  // Detailed description of the issue
  issueDetails: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 2000
  },

  // Issue status
  status: {
    type: String,
    enum: ['pending', 'assigned', 'in-progress', 'resolved', 'closed', 'rejected'],
    default: 'pending'
  },

  // Priority level
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Assigned employee
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },

  // Assignment details
  assignedAt: {
    type: Date,
    default: null
  },

  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },

  // Resolution details
  resolution: {
    type: String,
    default: null,
    trim: true
  },

  resolvedAt: {
    type: Date,
    default: null
  },

  resolvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    default: null
  },

  // Admin/Employee notes (internal)
  internalNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Attachments (screenshots, documents, etc.)
  attachments: [{
    type: String
  }],

  // Related entity references (if applicable)
  relatedProperty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    default: null
  },

  relatedEnquiry: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Enquiry',
    default: null
  },

  // Timestamps
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
feedbackSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for faster queries
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ assignedTo: 1 });
feedbackSchema.index({ issueType: 1 });
feedbackSchema.index({ priority: 1 });
feedbackSchema.index({ createdAt: -1 });

const Feedback = mongoose.model('Feedback', feedbackSchema);

export default Feedback;
