import { Router } from "express";
import { register, login, getProfile,getAllUsers,logout } from "./controllers/auth.controller.js";
import { addAssesment,getAssesment } from "./controllers/admin.controller.js";
import { assesmentTestCon } from "./controllers/parents.controller.js";
import { addAvailabilityCon , getAvailabilityWTCon } from "./controllers/teacher.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { protect } from "./middlewares/protect.middleware.js";

const router = Router();

// Authentication routes
router.post("/v1/auth/register", register);
router.post("/v1/auth/login", login);
router.get("/v1/auth/profile", authenticate, protect , getProfile);
router.get("/v1/auth/getAllUsers", getAllUsers);

router.post("/v1/auth/logout", protect, logout);

// AssesmentSet routes
router.post("/v1/addAssesment", authenticate, protect , addAssesment);
router.get("/v1/getAssesment", authenticate, protect , getAssesment);

// parents

router.post("/v1/assesmentTest", authenticate, protect , assesmentTestCon);

// teachers

router.post("/v1/addAvailability", authenticate, protect , addAvailabilityCon);
router.post("/v1/getAvailabilityWithUser", authenticate , protect , getAvailabilityWTCon);





export default router;