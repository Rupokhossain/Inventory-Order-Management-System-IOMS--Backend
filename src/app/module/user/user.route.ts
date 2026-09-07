import { Router } from "express";
import { UserController } from "./user.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { UserValidation } from "./user.validation";

const router = Router();

router.get(
  "/me",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  UserController.getMyProfile,
);

router.patch(
  "/me",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  UserController.updateMyProfile,
);


router.patch(
  "/change-password",
  validateRequest(UserValidation.changePasswordValidationSchema),
    auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  UserController.changePassword,
);


router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  UserController.getAllUsers,
);


router.get(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER),
  UserController.getSingleUser,
);


router.patch(
  "/:id/status",
  auth(Role.ADMIN),
  UserController.updateUserStatus,
);

export const UserRoutes = router;
