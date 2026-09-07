import { Router } from "express";

import { CategoryController } from "./category.controller";
import { auth } from "../../middleware/checkAuth";

import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { CategoryValidation } from "./category.validation";

const router = Router();

router.post(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(CategoryValidation.createCategoryValidationSchema),
  CategoryController.createCategory,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  CategoryController.getAllCategories,
);

router.get(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  CategoryController.getSingleCategory,
);

router.patch(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER),
  validateRequest(CategoryValidation.updateCategoryValidationSchema),
  CategoryController.updateCategory,
);

router.delete(
  "/:id",
  auth(Role.ADMIN),
  CategoryController.deleteCategory,
);

export const CategoryRoutes = router;