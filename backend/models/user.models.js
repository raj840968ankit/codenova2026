import mongoose from "mongoose";
import argon2 from "argon2";
import { env } from "../config/env.js";
import jwt from "jsonwebtoken";

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
        lowercase: true,
        minLength: [6, "email must be at least 6 characters long"],
        maxLength: [50, "email cannot be longer than 50 characters"],
    },

    // 🔐 Password only for manual users
    password: {
        type: String,
        select: false,
        required: function () {
            return this.provider === "local";
        },
    },

    // 🔑 Auth provider
    provider: {
        type: String,
        enum: ["local", "google", "github"],
        default: "local",
    },

    // 🆔 OAuth provider IDs
    googleId: {
        type: String,
        default: null,
    },

    githubId: {
        type: String,
        default: null,
    },

    // 👤 Optional profile data
    name: {
        type: String,
        trim: true,
        default: null,
    },

    avatar: {
        type: String,
        default: null,
    },
});

// ================= METHODS (UNCHANGED BEHAVIOR) =================

// Hash password
userSchema.statics.hashPassword = async (password) => {
    return await argon2.hash(password);
};

// Validate password (manual login still works)
userSchema.methods.isValidPassword = async function (password) {
    if (!this.password) return false;
    return await argon2.verify(this.password, password);
};

// Generate JWT (used by manual + OAuth)
userSchema.methods.generateJWT = function () {
    return jwt.sign(
        { _id: this._id, email: this.email },
        env.JWT_SECRET,
        { expiresIn: "7d" }
    );
};

const passwordResetSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true,
            index: true,
        },
        token: {
            type: String,
            required: true,
            unique: true,
        },
        expiresAt: {
            type: Date,
            required: true,
        },
        used: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export const PasswordReset = mongoose.model(
    "password_reset",
    passwordResetSchema
);

const User = mongoose.model("user", userSchema);

export { User };
