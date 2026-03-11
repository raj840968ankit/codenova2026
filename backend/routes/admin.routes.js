import { Router } from "express";
import { body } from "express-validator";

import {
  adminLoginController,
  getAllUsersController,
  deleteUserController,
  getContactsController,
  deleteContactController,
  getFeedbackController,
  deleteFeedbackController, 
  getAdminNotificationsController
} from "../controllers/admin.controller.js";

import { adminAuth } from "../middleware/adminAuth.middleware.js";

const router = Router();

/* ---------- ADMIN LOGIN ---------- */

router.post(
  "/login",
  body("email").isEmail(),
  body("password").isString(),
  adminLoginController
);


/* ---------- GET USERS ---------- */

router.get(
  "/users",
  adminAuth,
  getAllUsersController
);


/* ---------- DELETE USER ---------- */

router.delete(
  "/user/:userId",
  adminAuth,
  deleteUserController
);

router.get("/logout", (req,res)=>{

  res.clearCookie("adminToken");

  res.json({message:"Admin logged out"});

});

router.get("/verify", adminAuth, (req,res)=>{
  res.json({success:true});
});

router.get(
  "/contacts",
  adminAuth,
  getContactsController
);

router.delete(
  "/contact/:id",
  adminAuth,
  deleteContactController
);

router.get(
  "/feedback",
  adminAuth,
  getFeedbackController
);

router.delete(
  "/feedback/:id",
  adminAuth,
  deleteFeedbackController
);

router.get(
  "/notifications",
  adminAuth,
  getAdminNotificationsController
);

export const adminRouter = router;