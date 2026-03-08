import { Google } from "arctic";
//import { env } from "../config/env.js";

export const googleOAuthClient = new Google(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    "http://localhost:3000/users/google/callback" // 🔴 change in prod
);