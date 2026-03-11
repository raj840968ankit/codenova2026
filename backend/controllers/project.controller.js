import { validationResult } from "express-validator";
import { User } from '../models/user.models.js';
import { addUsersToProject, createProjectService, getAllProjectByUserId, getProjectById, updateFileTreeService } from "../services/project.service.js";
import crypto from "crypto";
import Project from "../models/project.model.js";
import ProjectApproval from "../models/projectApproval.model.js";
import { sendProjectInvitationMail, sendInvitationAcceptedMail, sendInvitationRejectedMail } from "../services/nodemailer.service.js";


export const createProjectController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array(), });
        }

        // Ensure req.user and req.user.email exist before attempting to find the user
        if (!req.user || !req.user.email) {
            console.error("Error: req.user or req.user.email is missing in createProjectController.");
            return res.status(401).json({ error: "Authentication failed: User information missing." });
        }

        const { name } = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });

        const userId = loggedInUser._id;

        const newProject = await createProjectService({ name, userId });

        return res.status(201).json(newProject);
    } catch (error) {
        console.error("Error creating project:", error);
        return res.status(500).json({ error: error.message });
    }
}

export const getAllProjectsController = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({ email: req.user.email });
        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const projects = await getAllProjectByUserId(loggedInUser._id);

        return res.status(200).json(projects);
    } catch (error) {
        console.error("Error fetching projects:", error);
        return res.status(500).json({ error: error.message });
    }
}

export const addUserToProjectController = async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { projectId, users } = req.body;
        const loggedInUser = await User.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        // Assuming you have a service function to add users to a project
        const updatedProject = await addUsersToProject({ projectId, users, userId: loggedInUser._id });

        return res.status(200).json(updatedProject);
    } catch (error) {
        console.error("Error adding users to project:", error);
        return res.status(500).json({ error: error.message });
    }
}


export const inviteUsersToProjectController = async (req, res) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { projectId, users } = req.body;

        const loggedInUser = await User.findOne({ email: req.user.email });

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Only admin can invite
        if (project.admin.toString() !== loggedInUser._id.toString()) {
            return res.status(403).json({ error: "Only project admin can invite users" });
        }

        const invitations = [];

        for (const userId of users) {

            const invitedUser = await User.findById(userId);

            if (!invitedUser) continue;

            if (project.users.includes(invitedUser._id)) continue;

            // 🔹 Prevent duplicate invitations
            const existingInvitation = await ProjectApproval.findOne({
                projectId: project._id,
                invitedUser: invitedUser._id,
                status: "pending"
            });

            if (existingInvitation) continue;

            const token = crypto.randomBytes(32).toString("hex");

            const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

            const approval = await ProjectApproval.create({
                projectId: project._id,
                invitedUser: invitedUser._id,
                invitedBy: loggedInUser._id,
                token,
                expiresAt
            });

            const acceptLink = `${process.env.SERVER_URL}/projects/invite/accept/${token}`;
            const rejectLink = `${process.env.SERVER_URL}/projects/invite/reject/${token}`;

            sendProjectInvitationMail(
                invitedUser.email,
                project.name,
                loggedInUser.email,
                acceptLink,
                rejectLink
            );

            invitations.push(approval);
        }

        return res.status(200).json({
            message: "Invitations sent successfully",
            invitations
        });

    } catch (error) {
        console.error("Error inviting users:", error);
        return res.status(500).json({ error: error.message });
    }

};


export const acceptProjectInvitationController = async (req, res) => {

    try {

        const { token } = req.params;

        const invitation = await ProjectApproval.findOne({ token });

        if (!invitation) {
            return res.status(400).send("Invalid invitation token");
        }

        if (invitation.status !== "pending") {
            return res.status(400).send("Invitation already processed");
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).send("Invitation expired");
        }

        // Do NOT add user here
        // Only redirect to frontend

        return res.redirect(`${process.env.CLIENT_URL}/accept-invite/${token}`);

    } catch (error) {

        console.error(error);

        res.status(500).send("Server error");

    }

};


export const rejectProjectInvitationController = async (req, res) => {

    try {

        const { token } = req.params;

        const invitation = await ProjectApproval.findOne({ token });

        if (!invitation) {
            return res.status(400).send("Invalid invitation token");
        }

        if (invitation.status !== "pending") {
            return res.status(400).send("Invitation already processed");
        }

        const project = await Project.findById(invitation.projectId);

        const invitedUser = await User.findById(invitation.invitedUser);

        const adminUser = await User.findById(invitation.invitedBy);

        invitation.status = "rejected";
        await invitation.save();

        sendInvitationRejectedMail(
            adminUser.email,
            project.name,
            invitedUser.email
        );

        return res.send("You have declined the invitation.");

    } catch (error) {
        console.error(error);
        res.status(500).send("Server error");
    }

};


export const confirmProjectInvitationController = async (req, res) => {

    try {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { token } = req.body;

        const loggedInUser = await User.findOne({ email: req.user.email });

        const invitation = await ProjectApproval.findOne({ token });

        if (!invitation) {
            return res.status(400).json({ error: "Invalid invitation token" });
        }

        if (invitation.status !== "pending") {
            return res.status(400).json({ error: "Invitation already processed" });
        }

        if (invitation.expiresAt < new Date()) {
            return res.status(400).json({ error: "Invitation expired" });
        }

        // Ensure the logged-in user is the invited user
        if (invitation.invitedUser.toString() !== loggedInUser._id.toString()) {
            return res.status(403).json({
                error: "You are not authorized to accept this invitation"
            });
        }

        const project = await Project.findById(invitation.projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Add user to project if not already added
        if (!project.users.includes(loggedInUser._id)) {

            project.users.push(loggedInUser._id);

            await project.save();

        }

        invitation.status = "accepted";

        await invitation.save();

        const adminUser = await User.findById(invitation.invitedBy);

        sendInvitationAcceptedMail(
            adminUser.email,
            project.name,
            loggedInUser.email
        );

        return res.status(200).json({
            message: "You have successfully joined the project"
        });

    } catch (error) {

        console.error("Error confirming invitation:", error);

        return res.status(500).json({ error: error.message });

    }

};

export const getProjectByIdController = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await getProjectById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        return res.status(200).json(project);
    } catch (error) {
        console.error("Error fetching project by ID:", error);
        return res.status(500).json({ error: error.message });
    }
}

export const updateFileTree = async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {

        const { projectId, fileTree } = req.body;

        const project = await updateFileTreeService({
            projectId,
            fileTree
        })

        return res.status(200).json({
            project
        })

    } catch (err) {
        console.log(err)
        res.status(400).json({ error: err.message })
    }

}


export const assignFileEditorController = async (req, res) => {
    try {

        const { projectId, fileName, userId } = req.body;

        const loggedInUser = await User.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ error: "User not found" });
        }

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        // Only admin can assign file editor
        if (project.admin.toString() !== loggedInUser._id.toString()) {
            return res.status(403).json({ error: "Only project admin can assign file editor" });
        }

        // Ensure filePermissions object exists
        if (!project.filePermissions) {
            project.filePermissions = {};
        }

        // Assign editor for file
        project.filePermissions = {
            ...project.filePermissions,
            [fileName]: userId
        };

        project.markModified("filePermissions");

        await project.save();

        return res.status(200).json({
            message: "File editor assigned successfully",
            filePermissions: project.filePermissions
        });

    } catch (error) {

        console.error("Error assigning file editor:", error);

        return res.status(500).json({ error: error.message });

    }
};