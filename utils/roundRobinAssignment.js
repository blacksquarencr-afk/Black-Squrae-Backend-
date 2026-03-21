import Employee from "../models/employeeSchema.js";
import Role from "../models/roleSchema.js";
import LeadAssignment from "../models/leadAssignmentSchema.js";

/**
 * Stores the last assigned Team Leader index for Round Robin
 * In production, this should be stored in a database or Redis
 * For now, using in-memory storage
 */
let lastAssignedTLIndex = 0;

/**
 * Get the next Team Leader in Round Robin sequence
 * @returns {Object} - { employeeId, employee } or null if no Team Leaders available
 */
export const getNextTeamLeader = async () => {
  try {
    // Find the Team Leader role
    const teamLeaderRole = await Role.findOne({ 
      name: { $regex: /team leader/i } 
    });

    if (!teamLeaderRole) {
      console.warn('⚠️ Team Leader role not found in database');
      return null;
    }

    // Find all active Team Leaders
    const teamLeaders = await Employee.find({
      role: teamLeaderRole._id,
      isActive: true
    }).sort({ createdAt: 1 }); // Oldest first for consistent ordering

    if (!teamLeaders || teamLeaders.length === 0) {
      console.warn('⚠️ No active Team Leaders found');
      return null;
    }

    // Round Robin: Get next Team Leader
    const nextIndex = lastAssignedTLIndex % teamLeaders.length;
    const selectedTL = teamLeaders[nextIndex];

    // Update index for next assignment
    lastAssignedTLIndex = (nextIndex + 1) % teamLeaders.length;

    console.log(`✅ Round Robin: Assigned to Team Leader ${selectedTL.name} (${nextIndex + 1}/${teamLeaders.length})`);

    return {
      employeeId: selectedTL._id,
      employee: selectedTL
    };
  } catch (error) {
    console.error('❌ Error in getNextTeamLeader:', error);
    return null;
  }
};

/**
 * Get the next Team Leader and reset counter if needed
 * This version fetches from database each time to ensure accuracy
 * @returns {Object} - { employeeId, employee } or null
 */
export const getNextTeamLeaderFromDB = async () => {
  try {
    // Find the Team Leader role
    const teamLeaderRole = await Role.findOne({ 
      name: { $regex: /team leader/i } 
    });

    if (!teamLeaderRole) {
      console.warn('⚠️ Team Leader role not found');
      return null;
    }

    // Find all active Team Leaders
    const teamLeaders = await Employee.find({
      role: teamLeaderRole._id,
      isActive: true
    }).sort({ createdAt: 1 });

    if (!teamLeaders || teamLeaders.length === 0) {
      console.warn('⚠️ No active Team Leaders found');
      return null;
    }

    // Count total assignments to all Team Leaders to determine next
    const tlIds = teamLeaders.map(tl => tl._id);
    const assignmentCounts = await LeadAssignment.aggregate([
      {
        $match: {
          employeeId: { $in: tlIds }
        }
      },
      {
        $group: {
          _id: '$employeeId',
          count: { $sum: 1 }
        }
      }
    ]);

    // Create a map of assignment counts
    const countMap = {};
    assignmentCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;
    });

    // Find Team Leader with least assignments
    let minCount = Infinity;
    let selectedTL = teamLeaders[0];

    teamLeaders.forEach(tl => {
      const count = countMap[tl._id.toString()] || 0;
      if (count < minCount) {
        minCount = count;
        selectedTL = tl;
      }
    });

    console.log(`✅ Round Robin (DB-based): Assigned to Team Leader ${selectedTL.name} (${minCount} current assignments)`);

    return {
      employeeId: selectedTL._id,
      employee: selectedTL
    };
  } catch (error) {
    console.error('❌ Error in getNextTeamLeaderFromDB:', error);
    return null;
  }
};

/**
 * Auto-assign a lead to a Team Leader using Round Robin
 * @param {String} enquiryId - The enquiry/lead ID
 * @param {String} enquiryType - Type of enquiry (Enquiry, Contact, PropertyLead, etc.)
 * @param {String} priority - Priority level (low, medium, high, urgent)
 * @param {String} notes - Additional notes
 * @returns {Object} - LeadAssignment document or null
 */
export const autoAssignToTeamLeader = async (enquiryId, enquiryType, priority = 'medium', notes = '') => {
  try {
    // Get next Team Leader
    const tlResult = await getNextTeamLeaderFromDB();

    if (!tlResult) {
      console.warn('⚠️ Could not assign lead - no Team Leaders available');
      return null;
    }

    // Create Lead Assignment
    const assignment = new LeadAssignment({
      employeeId: tlResult.employeeId,
      enquiryId: enquiryId,
      enquiryType: enquiryType,
      status: 'active',
      priority: priority,
      assignedDate: new Date(),
      notes: notes || `Auto-assigned to Team Leader ${tlResult.employee.name} via Round Robin`
    });

    await assignment.save();

    console.log(`✅ Lead ${enquiryId} assigned to Team Leader ${tlResult.employee.name}`);

    return assignment;
  } catch (error) {
    console.error('❌ Error in autoAssignToTeamLeader:', error);
    return null;
  }
};

export default {
  getNextTeamLeader,
  getNextTeamLeaderFromDB,
  autoAssignToTeamLeader
};
