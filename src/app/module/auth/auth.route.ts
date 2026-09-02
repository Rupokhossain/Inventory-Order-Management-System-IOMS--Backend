import { Router } from "express";
import { AuthController } from "./auth.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/google-login", AuthController.googleLogin);
router.post("/register", AuthController.registerUser);

router.post("/verify-email", AuthController.verifyUserEmail);

router.post("/login", AuthController.loginUser);

router.get("/me", AuthController.getMe);

router.post("/refresh-token", AuthController.refreshToken);

router.post("/forgot-password", auth(Role.ADMIN, Role.CUSTOMER, Role.MANAGER), AuthController.forgotPassword);

router.post("/reset-password", AuthController.resetPassword);

export const AuthRoutes = router;