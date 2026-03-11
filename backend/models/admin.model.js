import mongoose from "mongoose";

const adminSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            unique: true
        },

        password: {
            type: String,
            required: true
        }
    },
    { timestamps: true }
);

const Admin = mongoose.model("admin", adminSchema);

export default Admin;


/* ---------- CONTACT ---------- */

const contactSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true
    },

    message: {
        type: String,
        required: true
    },

    read: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export const Contact = mongoose.model("contact", contactSchema);


/* ---------- FEEDBACK ---------- */

const feedbackSchema = new mongoose.Schema({

    message: {
        type: String,
        required: true
    },

    read: {
        type: Boolean,
        default: false
    },

    createdAt: {
        type: Date,
        default: Date.now
    }

});

export const Feedback = mongoose.model("feedback", feedbackSchema);