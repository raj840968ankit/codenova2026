import mongoose from "mongoose";

const projectApprovalSchema = new mongoose.Schema(
{
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },

    invitedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    invitedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    token: {
        type: String,
        required: true,
        unique: true
    },

    status: {
        type: String,
        enum: ["pending", "accepted", "rejected"],
        default: "pending"
    },

    expiresAt: {
        type: Date,
        required: true
    }

},
{ timestamps: true }
);

const ProjectApproval = mongoose.model(
    "ProjectApproval",
    projectApprovalSchema
);

export default ProjectApproval;