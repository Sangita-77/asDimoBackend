import { Router } from "express";
import { register, login, getProfile,getAllUsers } from "./controllers/auth.controller.js";
import { addAssesment,getAssesment } from "./controllers/admin.controller.js";
import { assesmentTestCon } from "./controllers/parents.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/profile", authenticate, getProfile);
router.get("/auth/getAllUsers", getAllUsers);

// AssesmentSet routes
router.post("/v1/addAssesment", authenticate, addAssesment);
router.get("/v1/getAssesment", authenticate, getAssesment);

// parents

router.post("/v1/assesmentTest", authenticate, assesmentTestCon);




export default router;