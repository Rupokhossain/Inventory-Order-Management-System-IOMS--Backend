import { Router } from "express";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { AnalyticsController } from "./analytics.controller";

const router = Router();

router.get(
  "/summary",
  auth(Role.ADMIN, Role.MANAGER),
  AnalyticsController.getSummary,
);

export const AnalyticsRoutes = router;