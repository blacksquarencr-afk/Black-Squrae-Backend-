import SiteVisit from '../models/siteVisitSchema.js';
import ListProperty from '../models/list-property.js';
import Property from '../models/addProps.js';
import Employee from '../models/employeeSchema.js';

// Get all site visits (with filters)
export const getAllSiteVisits = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      assignedTo, 
      startDate, 
      endDate,
      search 
    } = req.query;

    console.log('📊 GET /api/site-visits - Query params:', { page, limit, status, assignedTo, search });

    // First, let's see ALL site visits in database
    const allVisitsCount = await SiteVisit.countDocuments({});
    console.log(`🔍 Total site visits in DB (no filter): ${allVisitsCount}`);
    
    // Show some sample visits
    if (allVisitsCount > 0) {
      const sampleVisits = await SiteVisit.find({}).limit(3).select('visitId client.name status assignedTo visitDate');
      console.log('📋 Sample visits:', sampleVisits.map(v => ({
        visitId: v.visitId,
        client: v.client?.name,
        status: v.status,
        assignedTo: v.assignedTo,
        visitDate: v.visitDate
      })));
    }

    const query = {};

    // Filter by status
    if (status && status !== 'all') {
      query.status = status;
    }

    // Filter by assigned employee (for employee-specific views)
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Filter by date range
    if (startDate || endDate) {
      query.visitDate = {};
      if (startDate) query.visitDate.$gte = new Date(startDate);
      if (endDate) query.visitDate.$lte = new Date(endDate);
    }

    // Search by client name, contact, or property
    if (search) {
      query.$or = [
        { 'client.name': { $regex: search, $options: 'i' } },
        { 'client.contact': { $regex: search, $options: 'i' } },
        { 'propertyDetails.name': { $regex: search, $options: 'i' } },
        { visitId: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🔍 MongoDB query:', JSON.stringify(query, null, 2));

    const siteVisits = await SiteVisit.find(query)
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location address')
      .populate('createdBy', 'name email')
      .sort({ visitDate: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await SiteVisit.countDocuments(query);

    console.log(`✅ Found ${siteVisits.length} site visits (total: ${total})`);
    if (siteVisits.length > 0) {
      console.log('📋 First visit:', {
        visitId: siteVisits[0].visitId,
        client: siteVisits[0].client?.name,
        status: siteVisits[0].status,
        visitDate: siteVisits[0].visitDate
      });
    }

    res.status(200).json({
      success: true,
      data: siteVisits,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalVisits: total,
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching site visits:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get site visit statistics
export const getSiteVisitStats = async (req, res) => {
  try {
    const { assignedTo } = req.query;
    const query = assignedTo ? { assignedTo } : {};

    const scheduled = await SiteVisit.countDocuments({ ...query, status: 'scheduled' });
    const completed = await SiteVisit.countDocuments({ ...query, status: 'completed' });
    const cancelled = await SiteVisit.countDocuments({ ...query, status: 'cancelled' });
    const total = await SiteVisit.countDocuments(query);

    // Today's visits
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayVisits = await SiteVisit.find({
      ...query,
      visitDate: { $gte: today, $lt: tomorrow }
    })
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location')
      .sort({ visitDate: 1 });

    // Upcoming visits (next 7 days)
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcomingVisits = await SiteVisit.find({
      ...query,
      status: 'scheduled',
      visitDate: { $gte: today, $lte: nextWeek }
    })
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location')
      .sort({ visitDate: 1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          scheduled,
          completed,
          cancelled,
          total
        },
        todayVisits,
        upcomingVisits
      }
    });
  } catch (error) {
    console.error('Error fetching site visit stats:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new site visit
export const createSiteVisit = async (req, res) => {
  try {
    console.log('📝 Create Site Visit Request Body:', JSON.stringify(req.body, null, 2));
    
    const { 
      clientName, 
      clientContact, 
      clientEmail,
      client, // Support old format
      propertyId,
      property, // Support old format 
      visitDate, 
      visitTime,
      assignedTo,
      notes,
      status // Accept status from request
    } = req.body;

    // Support both old and new format
    const finalClientName = clientName || client?.name;
    const finalClientContact = clientContact || client?.contact;
    const finalClientEmail = clientEmail || client?.email || '';
    const finalPropertyId = propertyId || property;

    console.log('📋 Parsed values:', {
      finalClientName,
      finalClientContact,
      finalPropertyId
    });

    if (!finalClientName || !finalClientContact) {
      return res.status(400).json({
        success: false,
        message: 'Client name and contact are required'
      });
    }

    let propertyDoc = null;
    let propertyDetails = {
      name: 'Property Not Specified',
      location: 'TBD',
      address: ''
    };

    // Only try to fetch property if propertyId is provided
    if (finalPropertyId) {
      console.log('🔍 Looking for property with ID:', finalPropertyId);

      // Try to find property in both collections
      propertyDoc = await ListProperty.findById(finalPropertyId);
      let propertySource = 'listProperty';
      
      if (!propertyDoc) {
        console.log('❌ Not found in ListProperty, trying AddProperty...');
        propertyDoc = await Property.findById(finalPropertyId);
        propertySource = 'addProperty';
      }
      
      if (propertyDoc) {
        console.log(`✅ Property found in ${propertySource}:`, {
          id: propertyDoc._id,
          name: propertyDoc.propertyName || propertyDoc.title,
          location: propertyDoc.locality || propertyDoc.location
        });

        propertyDetails = {
          name: propertyDoc.propertyName || propertyDoc.title || 'Unknown Property',
          location: propertyDoc.locality || propertyDoc.location || propertyDoc.city || 'Unknown Location',
          address: propertyDoc.address || propertyDoc.location || ''
        };
      } else {
        console.warn('⚠️ Property not found, but continuing with site visit creation');
      }
    } else {
      console.log('ℹ️ No property ID provided, creating site visit without property reference');
    }

    // Create site visit
    const siteVisit = new SiteVisit({
      client: {
        name: finalClientName,
        contact: finalClientContact,
        email: finalClientEmail
      },
      property: finalPropertyId || null,
      propertyDetails: propertyDetails,
      assignedTo: assignedTo || req.user?.id || req.employee?._id,
      visitDate: new Date(visitDate),
      visitTime,
      notes,
      status: status || 'scheduled', // Use provided status or default to scheduled
      createdBy: req.user?.id || req.employee?._id
    });

    await siteVisit.save();

    const populatedVisit = await SiteVisit.findById(siteVisit._id)
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location address');

    console.log('✅ Site visit created:', populatedVisit.visitId);

    res.status(201).json({
      success: true,
      message: 'Site visit scheduled successfully',
      data: populatedVisit
    });
  } catch (error) {
    console.error('Error creating site visit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update site visit
export const updateSiteVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found'
      });
    }

    // Update fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined) {
        siteVisit[key] = updateData[key];
      }
    });

    siteVisit.updatedAt = Date.now();
    await siteVisit.save();

    const populatedVisit = await SiteVisit.findById(id)
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location address');

    res.status(200).json({
      success: true,
      message: 'Site visit updated successfully',
      data: populatedVisit
    });
  } catch (error) {
    console.error('Error updating site visit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Mark visit as completed
export const completeVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { clientInterest, comments } = req.body;

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found'
      });
    }

    siteVisit.status = 'completed';
    siteVisit.feedback = {
      clientInterest,
      comments,
      completedAt: new Date(),
      completedBy: req.user?.id
    };
    siteVisit.updatedAt = Date.now();

    await siteVisit.save();

    const populatedVisit = await SiteVisit.findById(id)
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location address');

    res.status(200).json({
      success: true,
      message: 'Site visit marked as completed',
      data: populatedVisit
    });
  } catch (error) {
    console.error('Error completing site visit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Cancel visit
export const cancelVisit = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found'
      });
    }

    siteVisit.status = 'cancelled';
    siteVisit.cancellationReason = reason;
    siteVisit.cancelledAt = new Date();
    siteVisit.cancelledBy = req.user?.id;
    siteVisit.updatedAt = Date.now();

    await siteVisit.save();

    const populatedVisit = await SiteVisit.findById(id)
      .populate('assignedTo', 'name email')
      .populate('property', 'propertyName location address');

    res.status(200).json({
      success: true,
      message: 'Site visit cancelled',
      data: populatedVisit
    });
  } catch (error) {
    console.error('Error cancelling site visit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete site visit
export const deleteSiteVisit = async (req, res) => {
  try {
    const { id } = req.params;

    const siteVisit = await SiteVisit.findById(id);
    if (!siteVisit) {
      return res.status(404).json({
        success: false,
        message: 'Site visit not found'
      });
    }

    await SiteVisit.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Site visit deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting site visit:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
