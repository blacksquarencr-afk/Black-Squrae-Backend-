import Category from "../models/categorySchema.js";
import Product from "../models/productSchema.js";

// Get all categories with optional parent filter
export const getCategories = async (req, res) => {
  try {
    const { parent, includeSubcategories } = req.query;
    
    let filter = { isActive: true };
    if (parent) {
      filter.parentCategory = parent === 'null' ? null : parent;
    }

    let query = Category.find(filter).sort({ sortOrder: 1, name: 1 });
    
    if (includeSubcategories === 'true') {
      query = query.populate('subcategories');
    }
    
    if (parent) {
      query = query.populate('parentCategory');
    }

    const categories = await query.exec();

    res.status(200).json({
      success: true,
      message: "Categories fetched successfully",
      data: categories,
      count: categories.length
    });
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch categories",
      error: error.message
    });
  }
};

// Get category by ID with products
export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const { includeProducts } = req.query;

    const category = await Category.findById(id)
      .populate('parentCategory')
      .populate('subcategories');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    let responseData = { category };

    if (includeProducts === 'true') {
      const products = await Product.find({ 
        category: id, 
        isActive: true 
      }).sort({ sortOrder: 1, name: 1 });
      
      responseData.products = products;
    }

    res.status(200).json({
      success: true,
      message: "Category details fetched successfully",
      data: responseData
    });
  } catch (error) {
    console.error("Get category by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category",
      error: error.message
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentCategory } = req.body;
    const userId = req.user.id;

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      name: { $regex: new RegExp(`^${name}$`, 'i') } 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Category with this name already exists"
      });
    }

    const categoryData = {
      name,
      description,
      icon,
      createdBy: userId
    };

    if (parentCategory && parentCategory !== 'null') {
      categoryData.parentCategory = parentCategory;
    }

    const category = new Category(categoryData);
    await category.save();

    // If this is a subcategory, add it to parent's subcategories array
    if (parentCategory && parentCategory !== 'null') {
      await Category.findByIdAndUpdate(
        parentCategory,
        { $addToSet: { subcategories: category._id } }
      );
    }

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category
    });
  } catch (error) {
    console.error("Create category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create category",
      error: error.message
    });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, parentCategory, isActive, sortOrder } = req.body;

    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check for duplicate name (excluding current category)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        name: { $regex: new RegExp(`^${name}$`, 'i') },
        _id: { $ne: id }
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: "Category with this name already exists"
        });
      }
    }

    // Update fields
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;
    if (sortOrder !== undefined) category.sortOrder = sortOrder;

    // Handle parent category changes
    if (parentCategory !== undefined) {
      const oldParentId = category.parentCategory;
      const newParentId = parentCategory === 'null' ? null : parentCategory;

      if (oldParentId?.toString() !== newParentId?.toString()) {
        // Remove from old parent
        if (oldParentId) {
          await Category.findByIdAndUpdate(
            oldParentId,
            { $pull: { subcategories: id } }
          );
        }

        // Add to new parent
        if (newParentId) {
          await Category.findByIdAndUpdate(
            newParentId,
            { $addToSet: { subcategories: id } }
          );
        }

        category.parentCategory = newParentId;
      }
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category
    });
  } catch (error) {
    console.error("Update category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update category",
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findById(id);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Category not found"
      });
    }

    // Check if category has products
    const productsCount = await Product.countDocuments({ category: id });
    if (productsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${productsCount} products associated with it.`
      });
    }

    // Check if category has subcategories
    if (category.subcategories && category.subcategories.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Cannot delete category. It has subcategories. Delete subcategories first."
      });
    }

    // Remove from parent's subcategories array if it's a subcategory
    if (category.parentCategory) {
      await Category.findByIdAndUpdate(
        category.parentCategory,
        { $pull: { subcategories: id } }
      );
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully"
    });
  } catch (error) {
    console.error("Delete category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete category",
      error: error.message
    });
  }
};

// Get category tree/hierarchy
export const getCategoryTree = async (req, res) => {
  try {
    const categories = await Category.find({ 
      isActive: true,
      parentCategory: null // Get root categories only
    })
    .populate({
      path: 'subcategories',
      populate: {
        path: 'subcategories'
      }
    })
    .sort({ sortOrder: 1, name: 1 });

    res.status(200).json({
      success: true,
      message: "Category tree fetched successfully",
      data: categories
    });
  } catch (error) {
    console.error("Get category tree error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch category tree",
      error: error.message
    });
  }
};

// Get all products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { subcategory, featured, availability, page = 1, limit = 12 } = req.query;

    let filter = { 
      category: categoryId,
      isActive: true
    };

    if (subcategory) {
      filter.subcategory = subcategory;
    }

    if (featured === 'true') {
      filter.isFeatured = true;
    }

    if (availability) {
      filter.availability = availability;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [products, totalCount] = await Promise.all([
      Product.find(filter)
        .populate('category', 'name slug')
        .populate('subcategory', 'name slug')
        .sort({ isFeatured: -1, sortOrder: 1, name: 1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems: totalCount,
        itemsPerPage: parseInt(limit),
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch products",
      error: error.message
    });
  }
};