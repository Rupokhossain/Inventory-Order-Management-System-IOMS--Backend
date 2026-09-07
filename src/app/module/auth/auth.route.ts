import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { AuthValidation } from "./auth.validation";

const router = Router();

router.post("/google-login", AuthController.googleLogin);
router.post("/register", validateRequest(AuthValidation.registerValidationSchema), AuthController.registerUser);

router.post("/verify-email", validateRequest(AuthValidation.verifyEmailValidationSchema), AuthController.verifyUserEmail);

router.post("/login", validateRequest(AuthValidation.loginValidationSchema), AuthController.loginUser);

router.get("/me", AuthController.getMe);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/forgot-password", validateRequest(AuthValidation.forgotPasswordValidationSchema), auth(Role.ADMIN, Role.CUSTOMER, Role.MANAGER), AuthController.forgotPassword);

router.post("/reset-password", validateRequest(AuthValidation.resetPasswordValidationSchema), AuthController.resetPassword);

export const AuthRoutes = router;