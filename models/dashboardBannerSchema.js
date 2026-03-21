import mongoose from "mongoose";

const dashboardBannerSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true
  },
  heading: {
    type: String,
    required: true,
    default: "Real Estate Made Real Easy"
  },
  subheadingPrefix: {
    type: String,
    required: true,
    default: "We've got you covered! From finding the perfect property to"
  },
  rotatingTexts: [{
    type: String,
    required: true
  }],
  isActive: {
    type: Boolean,
    default: true
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
dashboardBannerSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const DashboardBanner = mongoose.model('DashboardBanner', dashboardBannerSchema);

export default DashboardBanner;
