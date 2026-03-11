import jwt from "jsonwebtoken";
import Admin from "../models/admin.model.js";
import { User } from "../models/user.models.js";
import Project from "../models/project.model.js";
import ProjectApproval from "../models/projectApproval.model.js";
import { Contact, Feedback } from "../models/admin.model.js";

/* ---------------- ADMIN LOGIN ---------------- */

export const adminLoginController = async (req, res) => {
    try {

        const { email, password } = req.body;

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        if (admin.password !== password) {
            return res.status(401).json({ error: "Invalid admin credentials" });
        }

        const token = jwt.sign(
            { adminId: admin._id },
            process.env.ADMIN_JWT_SECRET,
            { expiresIn: "7d" }
        );

        const isProd = process.env.NODE_ENV === 'production'
        res.cookie("adminToken", token, {
            httpOnly: true,
            sameSite: isProd ? "None" : "Lax",
            secure: isProd
        });

        return res.status(200).json({
            message: "Admin login successful"
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }
};




/* ---------------- GET ALL USERS ---------------- */

export const getAllUsersController = async (req, res) => {

    try {

        const users = await User.find().select("_id email");

        return res.status(200).json(users);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};



/* ---------------- DELETE USER ---------------- */

export const deleteUserController = async (req, res) => {

    try {

        const { userId } = req.params;

        // Delete user
        await User.findByIdAndDelete(userId);

        // Delete projects owned by this user
        await Project.deleteMany({ admin: userId });

        // Remove user from collaborator lists
        await Project.updateMany(
            { users: userId },
            { $pull: { users: userId } }
        );

        // Remove pending invitations
        await ProjectApproval.deleteMany({
            invitedUser: userId
        });

        return res.status(200).json({
            message: "User deleted successfully"
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};


export const getContactsController = async (req, res) => {

    try {

        const contacts = await Contact.find().sort({ createdAt: -1 });

        await Contact.updateMany({ read: false }, { read: true });

        return res.status(200).json(contacts);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};


export const deleteContactController = async (req, res) => {

    try {

        const { id } = req.params;

        await Contact.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Contact deleted"
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};


export const getFeedbackController = async (req, res) => {

    try {

        const feedback = await Feedback.find().sort({ createdAt: -1 });

        await Feedback.updateMany({ read: false }, { read: true });

        return res.status(200).json(feedback);

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};


export const deleteFeedbackController = async (req, res) => {

    try {

        const { id } = req.params;

        await Feedback.findByIdAndDelete(id);

        return res.status(200).json({
            message: "Feedback deleted"
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};


export const getAdminNotificationsController = async (req, res) => {

    try {

        const unreadContacts = await Contact.countDocuments({ read: false });

        const unreadFeedback = await Feedback.countDocuments({ read: false });

        return res.status(200).json({
            contacts: unreadContacts,
            feedback: unreadFeedback
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};

