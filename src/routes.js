import { Router } from "express";
import { 
    register, 
    login, 
    getProfile,
    getAllUsers,
    updateUser,
    logout,
    deleteUserCon
} from "./controllers/auth.controller.js";
import { 
    addAssesment,
    getAssesment 
} from "./controllers/admin.controller.js";
import { 
    assesmentTestCon,
    bookAppoinmentCon,
    cancelAppointmentCon,
 } from "./controllers/parents.controller.js";
import { 
    addAvailabilityCon , 
    getAvailabilityWTCon,
    approveAppointmentCon
} from "./controllers/teacher.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { protect } from "./middlewares/protect.middleware.js";

const router = Router();

// Authentication routes
router.post("/v1/auth/register", register);
router.post("/v1/auth/login", login);
router.get("/v1/auth/profile", authenticate, protect , getProfile);
router.get("/v1/auth/getAllUsers", authenticate, protect , getAllUsers);
router.put("/v1/auth/updateUser/:id", authenticate, protect , updateUser);

router.put("/v1/auth/deleteUserCon", authenticate, protect , deleteUserCon);

router.post("/v1/auth/logout", protect, logout);

// AssesmentSet routes
router.post("/v1/addAssesment", authenticate, protect , addAssesment);
router.get("/v1/getAssesment", authenticate, protect , getAssesment);

// parents

router.post("/v1/assesmentTest", authenticate, protect , assesmentTestCon);

// teachers

router.post("/v1/addAvailability", authenticate, protect , addAvailabilityCon);
router.post("/v1/getAvailabilityWithUser", authenticate , protect , getAvailabilityWTCon);

router.post("/v1/bookAppoinmentCon", authenticate , protect , bookAppoinmentCon);

router.put("/v1/cancelAppointment/:appointmentId",authenticate,protect,cancelAppointmentCon);

router.post("/v1/approveAppointment", authenticate , protect , approveAppointmentCon);






export default router;