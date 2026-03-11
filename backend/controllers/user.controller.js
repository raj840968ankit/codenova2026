import { User } from "../models/user.models.js";
import { createUser, getAllUsers } from "../services/user.service.js";
import { validationResult } from "express-validator";  //!install express-validator for validating fields
//import redisClient from "../services/redis.service.js";
import { googleOAuthClient } from "../oauth/google.js";
import { githubOAuthClient } from "../oauth/github.js";
import { generateCodeVerifier, generateState } from "arctic";
import crypto from "crypto";
import { PasswordReset } from "../models/user.models.js";
import { sendResetPasswordMail } from "../services/nodemailer.service.js";

import { Contact, Feedback } from "../models/admin.model.js"; //!indicate

import argon2 from "argon2";


export const createUserController = async (req, res) => {
    //?check for validation errors  
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { email, password } = req.body;

        const userExists = await User.findOne({ email })

        if (userExists) {
            return res.status(400).json({ errors: "User already exists" })
        }

        const user = await createUser(req.body)

        const token = user.generateJWT()  //generate JWT token for the user

        const isProduction = process.env.NODE_ENV === 'production';
        // Set token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // true only on HTTPS
            sameSite: isProduction ? 'None' : 'Lax', // Or 'None' if frontend is on different domain and using HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        delete user._doc.password;  //remove password from user object before sending it to the client
        delete user._doc.__v;  //remove __v field from user object before sending it to the client

        res.status(201).send({ user })

    } catch (error) {
        console.log('❌ Server Register Error:', error);
        res.status(400).send(error.message);
    }
}

export const loginUserController = async (req, res) => {
    //?check for validation errors  
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }

    try {
        const { email, password } = req.body
        const user = await User.findOne({ email }).select('+password')  //select password field as it is not selected by default
        if (!user) {
            return res.status(401).json({ errors: 'Invalid credentials' })
        }

        const isValidPassword = await user.isValidPassword(password)  //check if password is valid
        if (!isValidPassword) {
            return res.status(401).json({ errors: 'Invalid credentials' })
        }

        const token = user.generateJWT()  //generate JWT token for the user

        const isProduction = process.env.NODE_ENV === 'production';
        // Set token in HttpOnly cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: isProduction, // true only on HTTPS
            sameSite: isProduction ? 'None' : 'Lax', // Or 'None' if frontend is on different domain and using HTTPS
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        delete user._doc.password;  //remove password from user object before sending it to the client
        delete user._doc.__v;  //remove __v field from user object before sending it to the client

        res.status(201).json({ user })

    } catch (error) {
        console.log('❌ Server Login Error:', error);
        res.status(400).send(error.message);
    }
}

export const getUserProfileController = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user
        })
    } catch (error) {
        console.log('❌ Server Profile Error:', error);
        res.status(400).send(error.message);
    }
}

export const logoutUserController = async (req, res) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        //! we have set token in redis when user log out and will check it in auth middleware for blacklisting
        //await redisClient.set(token, 'logout', 'EX', 60 * 60 * 24 * 7);

        const isProduction = process.env.NODE_ENV === 'production';
        // 🧼 Clear the cookie
        res.clearCookie('token', {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? 'None' : 'Lax', // Or 'None' if frontend is on different domain and using HTTPS
        });

        res.status(200).json({ message: 'User logged out successfully' });

    } catch (error) {
        console.log('❌ Server Logout Error:', error);
        res.status(400).send(error.message);
    }
}

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({ email: req.user.email });

        const users = await getAllUsers({ userId: loggedInUser._id });
        res.status(200).json(users);
    } catch (error) {
        console.log('❌ Server Get All Users Error:', error);
        res.status(400).send(error.message);
    }
}

export const googleAuthController = async (req, res) => {
    const state = generateState();
    const codeVerifier = generateCodeVerifier();

    const url = googleOAuthClient.createAuthorizationURL(
        state,
        codeVerifier,
        ["openid", "email", "profile"]
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("google_oauth_state", state, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 10 * 60 * 1000,
    });

    res.cookie("google_oauth_verifier", codeVerifier, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "None" : "Lax",
        maxAge: 10 * 60 * 1000,
    });

    return res.redirect(url.toString());
};

export const googleAuthCallbackController = async (req, res) => {
    try {
        const { code, state } = req.query;

        console.log("Cookies:", req.cookies);


        const storedState = req.cookies.google_oauth_state;
        const codeVerifier = req.cookies.google_oauth_verifier;

        // 🛑 Security check
        if (!state || !storedState || state !== storedState) {
            return res.status(400).send("Invalid OAuth state");
        }

        if (!codeVerifier) {
            return res.status(400).send("Missing PKCE code verifier");
        }

        const tokens = await googleOAuthClient.validateAuthorizationCode(
            code,
            codeVerifier
        );

        // 🧼 Clear temp cookies
        const cookieOptions = {
            httpOnly: true,
            secure: true,
            sameSite: "None",
        };

        res.clearCookie("google_oauth_state", cookieOptions);
        res.clearCookie("google_oauth_verifier", cookieOptions);

        // 🔽 Fetch user profile
        const googleUser = await fetch(
            "https://openidconnect.googleapis.com/v1/userinfo",
            {
                headers: {
                    Authorization: `Bearer ${tokens.accessToken()}`,
                },
            }
        ).then(res => res.json());

        const { email, name, picture, sub: googleId } = googleUser;

        // 🔗 Link or create user (your existing logic)
        let user = await User.findOne({ email });

        if (!user) {
            user = await User.create({
                email,
                name,
                avatar: picture,
                provider: "google",
                googleId,
            });
        } else if (!user.googleId) {
            user.googleId = googleId;
            user.provider = "google";
            await user.save();
        }

        const jwtToken = user.generateJWT();

        const isProd = process.env.NODE_ENV === "production";

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return res.redirect(process.env.CLIENT_URL || "http://localhost:5173");

    } catch (error) {
        console.error("❌ Google OAuth Callback Error:", error);
        return res.status(400).send("Google authentication failed");
    }
};

export const githubAuthController = async (req, res) => {
    const state = generateState();

    const url = githubOAuthClient.createAuthorizationURL(
        state,
        ["read:user", "user:email"] // ✅ only scopes
    );

    const isProd = process.env.NODE_ENV === "production";

    res.cookie("github_oauth_state", state, {
        httpOnly: true,
        sameSite: isProd ? "None" : "Lax",
        secure: isProd,
        maxAge: 10 * 60 * 1000,
    });

    return res.redirect(url.toString());
};


export const githubAuthCallbackController = async (req, res) => {
    try {
        const { code, state } = req.query;

        const storedState = req.cookies.github_oauth_state;
        if (!state || !storedState || state !== storedState) {
            return res.status(400).send("Invalid OAuth state");
        }

        // GitHub does NOT use PKCE
        const tokens = await githubOAuthClient.validateAuthorizationCode(code);
        res.clearCookie("github_oauth_state");

        const accessToken = tokens.accessToken(); // MUST be called

        // 1️⃣ Fetch GitHub user profile
        const userResponse = await fetch("https://api.github.com/user", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "codenova-app",
            },
        });

        if (!userResponse.ok) {
            throw new Error("Failed to fetch GitHub user profile");
        }

        const userData = await userResponse.json();
        const { id: githubId, name, avatar_url } = userData;

        // 2️⃣ Fetch GitHub emails
        const emailResponse = await fetch("https://api.github.com/user/emails", {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: "application/vnd.github+json",
                "User-Agent": "codenova-app",
            },
        });

        if (!emailResponse.ok) {
            throw new Error("Failed to fetch GitHub emails");
        }

        const emails = await emailResponse.json();

        const primaryEmail =
            emails.find(e => e.primary && e.verified)?.email ||
            emails.find(e => e.verified)?.email;

        if (!primaryEmail) {
            return res.status(400).send("GitHub email not available");
        }

        // 3️⃣ Link or create user
        let user = await User.findOne({ email: primaryEmail });

        if (!user) {
            user = await User.create({
                email: primaryEmail,
                name,
                avatar: avatar_url,
                provider: "github",
                githubId,
            });
        } else if (!user.githubId) {
            user.githubId = githubId;
            user.provider = "github";
            await user.save();
        }

        // 4️⃣ Issue JWT cookie
        const jwtToken = user.generateJWT();
        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("token", jwtToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "None" : "Lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        // 5️⃣ Redirect to frontend
        return res.redirect(process.env.CLIENT_URL || "http://localhost:5173");

    } catch (error) {
        console.error("❌ GitHub OAuth Callback Error:", error.message);
        return res.status(400).send("GitHub authentication failed");
    }
};

export const forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Security: don't reveal if email exists
            return res.status(200).json({
                message: "If the email exists, a reset link has been sent.",
            });
        }

        // Invalidate old tokens
        await PasswordReset.updateMany(
            { email, used: false },
            { used: true }
        );

        const rawToken = crypto.randomBytes(32).toString("hex");
        const hashedToken = crypto
            .createHash("sha256")
            .update(rawToken)
            .digest("hex");

        const expiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 min

        await PasswordReset.create({
            email,
            token: hashedToken,
            expiresAt,
        });

        const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

        sendResetPasswordMail(email, resetLink);

        return res.status(200).json({
            message: "Reset password email sent",
        });
    } catch (error) {
        console.error("❌ Forgot Password Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};

export const resetPasswordController = async (req, res) => {
    try {
        const { token } = req.params;
        const { password, confirmPassword } = req.body;

        if (!password || !confirmPassword) {
            return res.status(400).json({ error: "All fields are required" });
        }

        if (password !== confirmPassword) {
            return res.status(400).json({ error: "Passwords do not match" });
        }

        if (password.length < 6) {
            return res.status(400).json({
                error: "Password must be at least 6 characters long",
            });
        }

        // Hash incoming token
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const resetRecord = await PasswordReset.findOne({
            token: hashedToken,
            used: false,
            expiresAt: { $gt: new Date() },
        });

        if (!resetRecord) {
            return res.status(400).json({
                error: "Reset link is invalid or expired",
            });
        }

        // Find user
        const user = await User.findOne({ email: resetRecord.email }).select(
            "+password"
        );

        if (!user) {
            return res.status(400).json({ error: "User not found" });
        }

        // Hash new password
        const hashedPassword = await argon2.hash(password);

        user.password = hashedPassword;
        await user.save();

        // Invalidate token
        resetRecord.used = true;
        await resetRecord.save();

        return res.status(200).json({
            message: "Password reset successful",
        });
    } catch (error) {
        console.error("❌ Reset Password Error:", error);
        res.status(500).json({ error: "Something went wrong" });
    }
};


//!indicate
export const sendContactController = async (req, res) => {

    try {

        const { message } = req.body;

        const email = req.user.email;

        const contact = await Contact.create({
            email,
            message
        });

        return res.status(201).json({
            message: "Contact message sent",
            contact
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};
//!indicate


//!indicate
export const sendFeedbackController = async (req, res) => {

    try {

        const { message } = req.body;

        const feedback = await Feedback.create({
            message
        });

        return res.status(201).json({
            message: "Feedback sent",
            feedback
        });

    } catch (error) {

        console.error(error);
        return res.status(500).json({ error: error.message });

    }

};
//!indicate