import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { OrderController } from "./order.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { OrderValidation } from "./order.validation";

const router = Router();

router.post(
  "/",
  auth(Role.CUSTOMER),
  validateRequest(OrderValidation.createOrderValidationSchema),
  OrderController.createOrder,
);


router.get(
  "/my-orders",
  auth(Role.CUSTOMER),
  OrderController.getMyOrders,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  OrderController.getAllOrders,
);


// Customer/Admin/Manager single order
router.get(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  OrderController.getSingleOrder,
);


// Admin/Manager update order status
router.patch(
  "/:id/status",
  auth(Role.ADMIN, Role.MANAGER),
  OrderController.updateOrderStatus,
);


// Customer cancel own order
router.patch(
  "/:id/cancel",
  auth(Role.CUSTOMER),
  OrderController.cancelOrder,
);



export const OrderRoutes = router;