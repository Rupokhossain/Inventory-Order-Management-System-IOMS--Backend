import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { PaymentValidation } from "./payment.validation";


const router = Router()

router.post(
  "/tokenized/checkout/create/:orderId",
  auth(Role.CUSTOMER),
  PaymentController.createBkashPayment,
);


router.post(
  "/bkash/execute",
  auth(Role.CUSTOMER),
  validateRequest(PaymentValidation.executeBkashPaymentValidationSchema),
  PaymentController.executeBkashPayment,
);


router.get(
  "/bkash/callback",
  PaymentController.bkashCallback,
);


router.get(
  "/my-payments",
  auth(Role.CUSTOMER),
  PaymentController.getMyPayments,
);

router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  PaymentController.getAllPayments,
);

router.get(
  "/:paymentId",
  auth(Role.ADMIN, Role.MANAGER, Role.CUSTOMER),
  PaymentController.getSinglePayment,
);



export const PaymentRoutes = router;