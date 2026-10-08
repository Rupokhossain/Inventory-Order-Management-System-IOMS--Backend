import { Router } from "express";
import { InquiryController } from "./inquiry.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

// Public: Customer or visitor can submit an inquiry from Contact page
router.post("/", InquiryController.createInquiry);

// Protected: Both ADMIN and MANAGER can view and manage inquiries
router.get(
  "/",
  auth(Role.ADMIN, Role.MANAGER),
  InquiryController.getAllInquiries,
);

router.patch(
  "/:id/status",
  auth(Role.ADMIN, Role.MANAGER),
  InquiryController.updateInquiryStatus,
);

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.MANAGER),
  InquiryController.deleteInquiry,
);

export const InquiryRoutes = router;
