import { GitHub } from "arctic";
//import { env } from "../config/env.js";

export const githubOAuthClient = new GitHub(
    process.env.GITHUB_CLIENT_ID,
    process.env.GITHUB_CLIENT_SECRET,
    "https://codenovaapi2026.onrender.com/users/github/callback" // 🔴 change in prod
);