import mongoose from "mongoose";

const contactSchema = new mongoose.Schema(
    {
        full_name: { type: String, required: false },
        email_address: { type: String, required: false },
        phone_number: { type: String, required: false },
        subject: { type: String, required: false },
        property_type: { type: String, default: null },
        budget_range: { type: String, default: null },
        location: { type: String, required: false, default: null },
        message: { type: String, required: false },
        assignedTo: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            default: null
        },
        assignmentStatus: {
            type: String,
            enum: ['unassigned', 'assigned', 'in-progress', 'completed', 'closed'],
            default: 'unassigned'
        }
    },
    { timestamps: true } // Adds createdAt and updatedAt automatically
);

export default mongoose.model("contact", contactSchema);
