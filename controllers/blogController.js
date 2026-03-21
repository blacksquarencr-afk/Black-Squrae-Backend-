import Blog from "../models/blogSchema.js";
import Admin from "../models/adminAuthSchema.js";

// import Employee from "../models/employeeSchema.js";

// Create a new blog
export const createBlog = async (req, res) => {
  try {
    const {
      title,
      slug,
      content,
      excerpt,
      blogType,
      isFeatured,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      readTime
    } = req.body;

    // Get author from authenticated employee
    // const authorId = req.employee._id; // From employee auth middleware

    // // Verify employee exists
    // const employee = await Employee.findById(authorId);
    // if (!employee) {
    //   return res.status(404).json({ message: "Employee not found" });
    // }
    
    const authorId = req.employee._id;

const admin = await Admin.findById(authorId);
if (!admin) {
  return res.status(404).json({ message: "Admin not found" });
}


    // Handle file uploads
    const featuredImage = req.files?.featuredImage ? req.files.featuredImage[0].path : null;
    const images = req.files?.images ? req.files.images.map(file => file.path) : [];

    if (!featuredImage) {
      return res.status(400).json({ message: "Featured image is required" });
    }

    // Validate blog type
    const validBlogTypes = [
      'Real Estate News',
      'Stamp Duty',
      'Vastu',
      'House Plan',
      "Buyer's Guide",
      'City Guide',
      'Research Reports',
      'Lifestyle and Living',
      'Home Decor'
    ];

    if (!validBlogTypes.includes(blogType)) {
      return res.status(400).json({ message: "Invalid blog type" });
    }

    // Create blog
    const blog = new Blog({
      title,
      slug,
      content,
      excerpt,
      blogType,
      featuredImage,
      images,
      isFeatured: isFeatured === 'true' || isFeatured === true,
      author: authorId,
      tags: tags ? (Array.isArray(tags) ? tags : JSON.parse(tags)) : [],
      metaTitle,
      metaDescription,
      metaKeywords: metaKeywords ? (Array.isArray(metaKeywords) ? metaKeywords : JSON.parse(metaKeywords)) : [],
      status: status || 'draft',
      readTime: readTime ? Number(readTime) : 5
    });

    await blog.save();

    // Populate author details
   await blog.populate({
  path: 'author',
  model: 'Admin',
  select: 'fullName email'
});


    res.status(201).json({
      success: true,
      message: "Blog created successfully",
      blog
    });
  } catch (error) {
    console.error("Create Blog Error:", error);
    
    // Handle duplicate slug error
    if (error.code === 11000 && error.keyPattern?.slug) {
      return res.status(400).json({ 
        success: false,
        message: "A blog with this slug already exists. Please use a different title or slug." 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get all blogs with filters
export const getAllBlogs = async (req, res) => {
  try {
    const { 
      blogType, 
      status, 
      isFeatured, 
      author,
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query
    const query = {};
    
    if (blogType) query.blogType = blogType;
    if (status) query.status = status;
    if (isFeatured !== undefined) query.isFeatured = isFeatured === 'true';
    if (author) query.author = author;

    // Pagination
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'name email profilePicture')
      .sort({ [sortBy]: sortOrder })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      blogs
    });
  } catch (error) {
    console.error("Get All Blogs Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get blog by ID or slug
export const getBlogById = async (req, res) => {
  try {
    const { id } = req.params;

    let blog;
    
    // Check if id is a valid MongoDB ObjectId (24 hex characters)
    const isValidObjectId = /^[a-f\d]{24}$/i.test(id);
    
    if (isValidObjectId) {
      // Try to find by MongoDB ID first
      blog = await Blog.findById(id).populate('author', 'name email profilePicture department');
    }
    
    // If not found by ID or id is not a valid ObjectId, try to find by slug
    if (!blog) {
      blog = await Blog.findOne({ slug: id }).populate('author', 'name email profilePicture department');
    }

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    // Increment view count
    blog.views += 1;
    await blog.save();

    res.status(200).json({
      success: true,
      blog
    });
  } catch (error) {
    console.error("Get Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Update blog
export const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      content,
      excerpt,
      blogType,
      isFeatured,
      tags,
      metaTitle,
      metaDescription,
      metaKeywords,
      status,
      readTime
    } = req.body;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    // Check if employee is the author
    if (blog.author.toString() !== req.employee._id.toString())
 {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to update this blog" 
      });
    }

    // Handle file uploads
    if (req.files?.featuredImage) {
      blog.featuredImage = req.files.featuredImage[0].path;
    }
    if (req.files?.images) {
      const newImages = req.files.images.map(file => file.path);
      blog.images = [...blog.images, ...newImages];
    }

    // Update fields
    if (title) blog.title = title;
    if (slug) blog.slug = slug;
    if (content) blog.content = content;
    if (excerpt) blog.excerpt = excerpt;
    if (blogType) blog.blogType = blogType;
    if (isFeatured !== undefined) blog.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (tags) blog.tags = Array.isArray(tags) ? tags : JSON.parse(tags);
    if (metaTitle) blog.metaTitle = metaTitle;
    if (metaDescription) blog.metaDescription = metaDescription;
    if (metaKeywords) blog.metaKeywords = Array.isArray(metaKeywords) ? metaKeywords : JSON.parse(metaKeywords);
    if (status) blog.status = status;
    if (readTime) blog.readTime = Number(readTime);

    await blog.save();
    await blog.populate({
  path: 'author',
  model: 'Admin',
  select: 'fullName email'
});


    res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      blog
    });
  } catch (error) {
    console.error("Update Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Delete blog
export const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    // Check if employee is the author or has admin access
   if (blog.author.toString() !== req.employee._id.toString())
 {
      return res.status(403).json({ 
        success: false,
        message: "You are not authorized to delete this blog" 
      });
    }

    await Blog.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error("Delete Blog Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get featured blogs
export const getFeaturedBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ 
      isFeatured: true, 
      status: 'published' 
    })
      .populate('author', 'name email profilePicture')
      .sort({ publishedAt: -1 })
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      count: blogs.length,
      blogs
    });
  } catch (error) {
    console.error("Get Featured Blogs Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get blogs by type
export const getBlogsByType = async (req, res) => {
  try {
    const { type } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find({ 
      blogType: type,
      status: 'published'
    })
      .populate('author', 'name email profilePicture')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments({ blogType: type, status: 'published' });

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      blogs
    });
  } catch (error) {
    console.error("Get Blogs By Type Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Get my blogs (by logged-in employee)
export const getMyBlogs = async (req, res) => {
  try {
    const authorId = req.employee._id;
    const { status, page = 1, limit = 10 } = req.query;

    const query = { author: authorId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const blogs = await Blog.find(query)
      .populate('author', 'name email profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    const total = await Blog.countDocuments(query);

    res.status(200).json({
      success: true,
      count: blogs.length,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
      blogs
    });
  } catch (error) {
    console.error("Get My Blogs Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};

// Toggle featured status
export const toggleFeatured = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        message: "Blog not found" 
      });
    }

    blog.isFeatured = !blog.isFeatured;
    await blog.save();

    res.status(200).json({
      success: true,
      message: `Blog ${blog.isFeatured ? 'marked as featured' : 'removed from featured'}`,
      isFeatured: blog.isFeatured
    });
  } catch (error) {
    console.error("Toggle Featured Error:", error);
    res.status(500).json({ 
      success: false,
      message: "Server error", 
      error: error.message 
    });
  }
};
