import { Router } from "express";
import { register, login, getProfile,getAllUsers } from "./controllers/auth.controller.js";
import { addAssesment } from "./controllers/admin.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";

const router = Router();

// Authentication routes
router.post("/auth/register", register);
router.post("/auth/login", login);
router.get("/auth/profile", authenticate, getProfile);
router.get("/auth/getAllUsers", getAllUsers);

// AssesmentSet routes
router.post("/auth/addAssesment", authenticate, addAssesment);




export default router;