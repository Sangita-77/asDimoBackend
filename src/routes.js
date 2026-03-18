import { Router } from "express";
import { register, login, getProfile,getAllUsers } from "./controllers/auth.controller.js";
import { addAssesment,getAssesment } from "./controllers/admin.controller.js";
import { assesmentTestCon } from "./controllers/parents.controller.js";
import { addAvailabilityCon , getAvailabilityWTCon } from "./controllers/teacher.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/v1/auth/register", register);
router.post("/v1/auth/login", login);
router.get("/v1/auth/profile", authenticate, getProfile);
router.get("/v1/auth/getAllUsers", getAllUsers);

// AssesmentSet routes
router.post("/v1/addAssesment", authenticate, addAssesment);
router.get("/v1/getAssesment", authenticate, getAssesment);

// parents

router.post("/v1/assesmentTest", authenticate, assesmentTestCon);

// teachers

router.post("/v1/addAvailability", authenticate, addAvailabilityCon);
router.post("/v1/getAvailabilityWithUser", authenticate, getAvailabilityWTCon);




export default router;