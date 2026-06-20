// Barrel — import everything route handlers need from one path:
//
//   import {
//     requireAdmin, requireSession,
//     requireCronBearer, requireCronQuerySecret,
//     applyRateLimit, ipFromRequest,
//     unauthorized, forbidden, badRequest, notFound, serverError,
//     tooManyRequests, zodValidationError,
//   } from "@/shared/http";

export * from "./auth";
export * from "./cron";
export * from "./rate-limit";
export * from "./responses";
