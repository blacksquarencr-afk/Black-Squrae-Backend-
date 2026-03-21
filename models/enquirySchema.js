import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema({
  // Common fields
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: function () {
      return !this.isGuestEnquiry;
    }
  },
  isGuestEnquiry: { type: Boolean, default: true },

  // Basic contact info
  fullName: { type: String, required: true },
  email: { type: String },
  countryCode: { type: String, default: '+91' },
  mobileNumber: { type: String, required: true },

  // Enquiry type
  enquiryType: {
    type: String,
    enum: ["home_loan", "property_management", "interior_design", "property_valuation", "vastu_calculation", "rent_agreement", "career_opportunity", "packers_movers", "solar_rooftop", "investment", "special_project", "escrow_service", "women_property", "legal_services", "associates", "property_tax", "stamp_duty", "capital_gains", "book_property_online", "advertise_with_us", "rent_appliance","exclusive_property_enquiry"],
    required: true
  },

  //   enquiryType: {
  //     type: String,
  //     enum: ["home_loan","property_management", "interior_design", "property_valuation", "property_enquiry", "callback_request", "vastu_calculation", "rent_agreement", "rent_receipts", "data_intelligence"],
  //     required: true
  //   },


  // Status tracking
  status: {
    type: String,
    enum: ["pending", "in_progress", "completed", "cancelled"],
    default: "pending"
  },

  // Priority
  priority: {
    type: String,
    enum: ["low", "medium", "high", "urgent"],
    default: "medium"
  },

  // Assignment
  assignedToEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee"
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Admin"
  },

  // Property Management specific fields
  propertyManagement: {
    propertyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Property",
      // Optional, since we have forms that don't provide a property ID
    },
    city: {
      type: String,
      required: false
    }
  },

  // Home Loan specific fields
  homeLoan: {
    city: {
      type: String,
      required: false
    },
    agreeToTerms: {
      type: Boolean,
      required: false
    }
  },

  // Interior Design specific fields
  interiorDesign: {
    propertyType: {
      type: String,
      required: function () {
        return this.enquiryType === "interior_design";
      }
    },
    budget: {
      type: String,
      required: false
    },
    propertyLocation: {
      type: String,
      required: function () {
        return this.enquiryType === "interior_design";
      }
    },
    additionalRequirements: {
      type: String,
      default: ""
    }
  },

  // Property Valuation specific fields
  propertyValuation: {
    propertyType: {
      type: String,
      required: function () {
        return this.enquiryType === "property_valuation";
      }
    },
    projectLocality: {
      type: String,
      required: function () {
        return this.enquiryType === "property_valuation";
      }
    },
    area: {
      type: String,
      required: function () {
        return this.enquiryType === "property_valuation";
      }
    },
    cityName: {
      type: String,
      required: function () {
        return this.enquiryType === "property_valuation";
      }
    },
    location: {
      type: String,
      required: function () {
        return this.enquiryType === "property_valuation";
      }
    }
  },

  // Vastu Calculation specific fields
  vastuCalculation: {
    floorPlan: {
      type: String, // File path for uploaded floor plan
      required: function () {
        return this.enquiryType === "vastu_calculation";
      }
    },
    propertyType: {
      type: String,
      required: function () {
        return this.enquiryType === "vastu_calculation";
      }
    },
    plotArea: {
      type: String,
      required: function () {
        return this.enquiryType === "vastu_calculation";
      }
    },
    constructionStatus: {
      type: String,
      enum: ["planned", "under_construction", "completed"],
      required: function () {
        return this.enquiryType === "vastu_calculation";
      }
    }
  },

  // Rent Agreement specific fields
  rentAgreement: {
    propertyAddress: {
      type: String,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    landlordName: {
      type: String,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    tenantName: {
      type: String,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    monthlyRent: {
      type: Number,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    securityDeposit: {
      type: Number,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    leaseDuration: {
      type: String,
      required: function () {
        return this.enquiryType === "rent_agreement";
      }
    },
    agreementType: {
      type: String,
      enum: ["new", "renewal"],
      default: "new"
    }
  },

  // Special Project specific fields (Consultation Booking)
  specialProject: {
    investmentBudget: {
      type: String,
      enum: ["10-25 Lakh", "25-50 Lakh", "50 Lakh+"],
      required: function () {
        return this.enquiryType === "special_project";
      }
    },
    investmentPurpose: {
      type: String,
      enum: ["Long-term", "Self Use"],
      required: function () {
        return this.enquiryType === "special_project";
      }
    },
    callDateTime: {
      type: Date,
      required: function () {
        return this.enquiryType === "special_project";
      }
    }
  },

  // Women Property specific fields
  womenProperty: {
    interestedIn: {
      type: String,
      enum: ["Buying", "Selling", "Home Loan", "Interiors"],
      required: function () {
        return this.enquiryType === "women_property";
      }
    }
  },

  // Admin notes and follow-ups
  adminNotes: {
    type: String,
    default: ""
  },

  followUpDate: {
    type: Date
  },

  // Additional attachments
  attachments: [{
    fileName: String,
    filePath: String,
    fileType: String,
    uploadedAt: { type: Date, default: Date.now }
  }],

  // Communication log
  communications: [{
    message: String,
    communicationType: {
      type: String,
      enum: ["call", "email", "sms", "whatsapp", "meeting"]
    },
    communicatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    communicatedAt: { type: Date, default: Date.now },
    response: String
  }],

  // Resolution
  resolution: {
    isResolved: { type: Boolean, default: false },
    resolutionNotes: String,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee"
    },
    resolvedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for better performance
enquirySchema.index({ enquiryType: 1 });
enquirySchema.index({ status: 1 });
enquirySchema.index({ assignedToEmployee: 1 });
enquirySchema.index({ createdAt: -1 });
enquirySchema.index({ email: 1, mobileNumber: 1 });

const Enquiry = mongoose.models.Enquiry || mongoose.model("Enquiry", enquirySchema);
export default Enquiry;