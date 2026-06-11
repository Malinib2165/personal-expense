import express from 'express';
import { loginControllers, registerControllers, setAvatarController, verifyOTPController, resendOTPController } from '../controllers/userController.js';

const router = express.Router();

router.route("/register").post(registerControllers);

router.route("/login").post(loginControllers);

router.route("/verifyOTP").post(verifyOTPController);

router.route("/resendOTP").post(resendOTPController);

router.route("/setAvatar/:id").post(setAvatarController);

export default router;