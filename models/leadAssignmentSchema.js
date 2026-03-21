import mongoose from "mongoose";

const leadAssignmentSchema = new mongoose.Schema({
  enquiryId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'enquiryType'
  },
  enquiryType: {
    type: String,
    required: true,
    enum: [
      'Inquiry',
      'ManualInquiry',
      'Enquiry',
      'Contact',
      'PropertyLead',
      'PropertyLeads',
      'HomeLoanEnquiry',
      'LegalServicesEnquiry',
      'RentReceiptsEnquiry',
      'AssociatesEnquiry',
      'ExclusivePropertyEnquiry',
      'RentApplianceEnquiry',
      'PropertyEnquiry',
      'CareerApplication',
      'ServiceRequest',
      'PropertyManagementRequest',
      'DataIntelligenceRequest',
      'PaintingRequest',
      'RentReceipt'
    ]
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Admin who assigned the lead
    required: false
  },
  assignedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'in-progress', 'completed', 'cancelled', 'sold', 'booked', 'lost', 'closed', 'won', 'pending_tl_approval', 'pending_sh_approval', 'rejected', 'rejected_by_tl', 'rejected_by_sh'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  notes: {
    type: String,
    default: ''
  },
  action: {
    type: String,
    default: ''
  },
  visitDate: {
    type: Date
  },
  visitTime: {
    type: String
  },
  dueDate: {
    type: Date
  },
  completedAt: {
    type: Date
  },
  completedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  followUpHistory: [{
    date: {
      type: Date,
      default: Date.now
    },
    action: String,
    notes: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
leadAssignmentSchema.index({ employeeId: 1, status: 1 });
leadAssignmentSchema.index({ enquiryId: 1, enquiryType: 1 });
leadAssignmentSchema.index({ assignedDate: -1 });

export default mongoose.models.LeadAssignment || mongoose.model("LeadAssignment", leadAssignmentSchema);