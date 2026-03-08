import { Router } from "express";
import * as userController from '../controllers/user.controller.js'
import { body } from "express-validator";
import { authUser } from "../middleware/auth.middleware.js";


const router = Router()

router.post('/register', [   
    body('email').isEmail().withMessage('Invalid email'),    //!if there will be errors, they will be caught in the controller
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
], userController.createUserController)  //create user

router.post('/login', [
    body('email').isEmail().withMessage('Invalid email'),
    body('password').notEmpty().withMessage('Password is required'),
], userController.loginUserController)  //login user

router.post(
    "/forgot-password",
    [
        body("email").isEmail().withMessage("Invalid email"),
    ],
    userController.forgotPasswordController
);

router.post(
    "/reset-password/:token",
    [
        body("password")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        body("confirmPassword")
            .notEmpty()
            .withMessage("Confirm password is required"),
    ],
    userController.resetPasswordController
);

router.get('/profile', authUser, userController.getUserProfileController)  //get user profile

router.get('/logout', authUser, userController.logoutUserController)  //logout user

router.get('/all', authUser, userController.getAllUsersController)  //get all users

router.get('/google', userController.googleAuthController);
router.get('/google/callback', userController.googleAuthCallbackController);

router.get('/github', userController.githubAuthController);
router.get('/github/callback', userController.githubAuthCallbackController);

export const userRoutes = router

