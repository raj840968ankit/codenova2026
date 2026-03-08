import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: [true, 'Project name must be unique'],
    },

    admin: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
        required: true
    },

    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }],

    fileTree: {
        type: Object,
        default: {}
    },

    filePermissions: {
        type: Object,
        default: {}
    }

});

const Project = mongoose.model("Project", projectSchema);

export default Project;