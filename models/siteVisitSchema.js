import mongoose from 'mongoose';

const siteVisitSchema = new mongoose.Schema({
  visitId: {
    type: String,
    unique: true,
    required: true
  },
  client: {
    name: {
      type: String,
      required: true
    },
    contact: {
      type: String,
      required: true
    },
    email: String
  },
  property: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Property',
    required: false
  },
  propertyDetails: {
    name: String,
    location: String,
    address: String
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
    required: true
  },
  visitDate: {
    type: Date,
    required: true
  },
  visitTime: {
    type: String
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled', 'rescheduled'],
    default: 'scheduled'
  },
  notes: {
    type: String
  },
  feedback: {
    clientInterest: {
      type: String,
      enum: ['high', 'medium', 'low', 'not_interested']
    },
    comments: String,
    completedAt: Date,
    completedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee'
    }
  },
  cancellationReason: {
    type: String
  },
  cancelledAt: {
    type: Date
  },
  cancelledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee'
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

// Auto-increment visit ID
siteVisitSchema.pre('save', async function(next) {
  if (this.isNew && !this.visitId) {
    const count = await mongoose.model('SiteVisit').countDocuments();
    this.visitId = `SV${String(count + 101).padStart(3, '0')}`;
  }
  this.updatedAt = Date.now();
  next();
});

const SiteVisit = mongoose.models.SiteVisit || mongoose.model('SiteVisit', siteVisitSchema);

export default SiteVisit;
