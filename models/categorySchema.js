import mongoose from "mongoose";

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  slug: {
    type: String,
    required: false,
    lowercase: true
  },
  description: {
    type: String,
    trim: true
  },
  icon: {
    type: String,
    trim: true
  },
  parentCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null
  },
  subcategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Create slug from name before saving
categorySchema.pre('save', async function(next) {
  if (this.isModified('name') || !this.slug) {
    // Generate base slug
    let baseSlug = this.name
      .toLowerCase()
      .trim()
      .replace(/[^a-zA-Z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
    
    // Ensure slug is not empty
    if (!baseSlug) {
      baseSlug = 'category';
    }
    
    // Check for uniqueness
    let slug = baseSlug;
    let counter = 1;
    let existingCategory = await mongoose.model('Category').findOne({ 
      slug: slug, 
      _id: { $ne: this._id } 
    });
    
    while (existingCategory) {
      slug = `${baseSlug}-${counter}`;
      counter++;
      existingCategory = await mongoose.model('Category').findOne({ 
        slug: slug, 
        _id: { $ne: this._id } 
      });
    }
    
    this.slug = slug;
  }
  next();
});

export default mongoose.model('Category', categorySchema);