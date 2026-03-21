import PropertyLead from "../models/PropertyLead.js";
import { autoAssignToTeamLeader } from "../utils/roundRobinAssignment.js";

export const createLead = async (req, res) => {
  try {
    const lead = await PropertyLead.create(req.body);

    // Auto-assign to Team Leader using Round Robin
    const assignment = await autoAssignToTeamLeader(
      lead._id,
      'PropertyLead',
      'medium',
      'Auto-assigned to Team Leader via Round Robin'
    );

    if (assignment) {
      lead.assignedTo = assignment.employeeId;
      await lead.save();
      console.log(`✅ Property Lead ${lead._id} assigned to Team Leader`);
    }

    res.status(201).json({
      success: true,
      data: lead,
      assignment: assignment ? { employeeId: assignment.employeeId } : null
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

export const getLeads = async (req, res) => {
  const leads = await PropertyLead.find().populate('assignedTo', 'name email');
  res.json({ success: true, data: leads });
};
