import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";
import { ProductController } from "./product.controller";

const router = Router();


// Create Product
router.post(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  upload.single("image"),
  ProductController.createProduct,
);


// Get All Products
router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  ProductController.getAllProducts,
);


// Get Single Product
router.get(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  ProductController.getSingleProduct,
);


// Update Product
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER),
  upload.single("image"),
  ProductController.updateProduct,
);


// Add Stock
router.patch(
  "/:id/stock",
  auth(Role.ADMIN, Role.MANAGER),
  ProductController.updateStock,
);


// Delete Product
router.delete(
  "/:id",
  auth(Role.ADMIN),
  ProductController.deleteProduct,
);


export const ProductRoutes = router;