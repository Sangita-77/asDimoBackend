import { Router } from "express";
import * as authController from "./controllers/auth.controller.js";
import * as dashboardController from "./controllers/dashboard.controller.js";
import * as organizationController from "./controllers/organization.controller.js";
import * as usersController from "./controllers/users.controller.js";
import * as studentsController from "./controllers/students.controller.js";
import * as doctorsController from "./controllers/doctors.controller.js";
import * as teacherController from "./controllers/teacher.controller.js";
import * as evaluationsController from "./controllers/evaluations.controller.js";
import * as questionsController from "./controllers/questions.controller.js";
import * as appointmentsController from "./controllers/appointments.controller.js";
import * as gamesController from "./controllers/games.controller.js";
import * as subscriptionsController from "./controllers/subscriptions.controller.js";
import * as paymentsController from "./controllers/payments.controller.js";
import * as analyticsController from "./controllers/analytics.controller.js";
import * as auditLogsController from "./controllers/auditLogs.controller.js";
import * as settingsController from "./controllers/settings.controller.js";
import * as uploadsController from "./controllers/uploads.controller.js";
import * as notificationsController from "./controllers/notifications.controller.js";
import { authenticate } from "./middlewares/auth.middleware.js";
import { protect } from "./middlewares/protect.middleware.js";
import { auditLogger } from "./middlewares/audit.middleware.js";
import { uploadProfile } from "./middlewares/upload.js";


const router = Router();

router.use(auditLogger);

const authRouter = Router();
authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/refresh-token", authController.refreshToken);
authRouter.post("/logout", authenticate, protect, authController.logout);
authRouter.post("/forgot-password", authController.forgotPassword);
authRouter.post("/verify-email", authController.verifyEmail);
authRouter.post("/validate-otp", authController.validateEmailOTP);
authRouter.post("/reset-password", authController.resetPassword);
authRouter.get("/profile", authenticate, protect, authController.getProfile);
// authRouter.put("/profile", authenticate, protect, authController.updateProfile);
authRouter.put("/updateProfile/:id",authenticate,protect,uploadProfile.single("profileImg"),authController.updateProfile);
authRouter.put("/change-password", authenticate, protect, authController.changePassword);
authRouter.post("/getAllUsers", authenticate, protect, authController.getAllUsers);
authRouter.post("/delete",authenticate,protect,authController.deleteUsersCon);
router.use("/auth", authRouter);

const therapistsRouter = Router();
therapistsRouter.post("/availability", authenticate, protect, teacherController.addAvailabilityCon);
therapistsRouter.get("/availability", authenticate, protect, teacherController.getAvailabilityWTCon);
therapistsRouter.patch("/appointments/status", authenticate, protect, teacherController.approveAppointmentCon);
router.use("/therapists", therapistsRouter);

const appointmentsRouter = Router();
appointmentsRouter.post("/", authenticate, protect, appointmentsController.createAppointment);
appointmentsRouter.get("/", authenticate, protect, appointmentsController.getAppointments);
appointmentsRouter.get("/:id", authenticate, protect, appointmentsController.getAppointmentById);
appointmentsRouter.patch("/confirm/:id", authenticate, protect, appointmentsController.confirmAppointment);
appointmentsRouter.patch("/reschedule/:id", authenticate, protect, appointmentsController.rescheduleAppointment);
appointmentsRouter.patch("/cancel/:id", authenticate, protect, appointmentsController.cancelAppointment);
appointmentsRouter.patch("/complete/:id", authenticate, protect, appointmentsController.completeAppointment);
appointmentsRouter.get("/available-slots/:doctorId", authenticate, protect, appointmentsController.getAvailableSlots);
router.use("/appointments", appointmentsRouter);


const dashboardRouter = Router();
dashboardRouter.get("/super-admin", authenticate, protect, dashboardController.getSuperAdminDashboard);
dashboardRouter.get("/organization-admin", authenticate, protect, dashboardController.getOrganizationAdminDashboard);
dashboardRouter.get("/parent", authenticate, protect, dashboardController.getParentDashboard);
dashboardRouter.get("/doctor", authenticate, protect, dashboardController.getDoctorDashboard);
dashboardRouter.get("/teacher", authenticate, protect, dashboardController.getTeacherDashboard);
router.use("/dashboard", dashboardRouter);

const organizationRouter = Router();
organizationRouter.post("/", authenticate, protect, organizationController.createOrganization);
organizationRouter.get("/", authenticate, protect, organizationController.getOrganizations);
organizationRouter.get("/:id", authenticate, protect, organizationController.getOrganizationById);
organizationRouter.put("/:id", authenticate, protect, organizationController.updateOrganizationById);
organizationRouter.patch("/status/:id", authenticate, protect, organizationController.updateOrganizationStatus);
organizationRouter.delete("/:id", authenticate, protect, organizationController.deleteOrganizationById);
router.use("/organizations", organizationRouter);

const usersRouter = Router();
usersRouter.post("/", authenticate, protect, usersController.createUser);
usersRouter.get("/", authenticate, protect, usersController.getUsers);
usersRouter.get("/:id", authenticate, protect, usersController.getUserById);
// usersRouter.put("/:id", authenticate, protect, usersController.updateUserById);

// usersRouter.put("/:id",authenticate,protect,uploadProfile.single("profileImg"),usersController.updateUserById);


usersRouter.patch("/status/:id", authenticate, protect, usersController.updateUserStatus);
usersRouter.delete("/:id", authenticate, protect, usersController.deleteUserById);
usersRouter.patch("/role/:id", authenticate, protect, usersController.updateUserRole);
router.use("/users", usersRouter);

const studentsRouter = Router();
studentsRouter.post("/", authenticate, protect, studentsController.createStudent);
studentsRouter.get("/", authenticate, protect, studentsController.getStudents);
studentsRouter.get("/:id", authenticate, protect, studentsController.getStudentById);
studentsRouter.put("/:id", authenticate, protect, studentsController.updateStudentById);
studentsRouter.delete("/:id", authenticate, protect, studentsController.deleteStudentById);
studentsRouter.patch("/assign-teacher/:id", authenticate, protect, studentsController.assignTeacherToStudent);
studentsRouter.get("/reports/:id", authenticate, protect, studentsController.getStudentReport);
studentsRouter.get("/progress/:id", authenticate, protect, studentsController.getStudentProgress);
router.use("/students", studentsRouter);

const doctorsRouter = Router();
doctorsRouter.post("/", authenticate, protect, doctorsController.createDoctor);
doctorsRouter.get("/", authenticate, protect, doctorsController.getDoctors);
doctorsRouter.get("/:id", authenticate, protect, doctorsController.getDoctorById);
doctorsRouter.put("/:id", authenticate, protect, doctorsController.updateDoctorById);
doctorsRouter.delete("/:id", authenticate, protect, doctorsController.deleteDoctorById);
doctorsRouter.patch("/availability/:id", authenticate, protect, doctorsController.updateDoctorAvailability);
doctorsRouter.patch("/assign-organization/:id", authenticate, protect, doctorsController.assignDoctorOrganization);
router.use("/doctors", doctorsRouter);



const evaluationsRouter = Router();
evaluationsRouter.post("/", authenticate, protect, evaluationsController.createEvaluation);
evaluationsRouter.get("/", authenticate, protect, evaluationsController.getEvaluations);
evaluationsRouter.get("/:id", authenticate, protect, evaluationsController.getEvaluationById);
evaluationsRouter.put("/:id", authenticate, protect, evaluationsController.updateEvaluationById);
evaluationsRouter.delete("/:id", authenticate, protect, evaluationsController.deleteEvaluationById);
evaluationsRouter.post("/start", authenticate, protect, evaluationsController.startEvaluation);
evaluationsRouter.post("/submit", authenticate, protect, evaluationsController.submitEvaluation);
evaluationsRouter.get("/report/:id", authenticate, protect, evaluationsController.getEvaluationReport);
evaluationsRouter.get("/history/:studentId", authenticate, protect, evaluationsController.getEvaluationHistory);
router.use("/evaluations", evaluationsRouter);

const questionsRouter = Router();
questionsRouter.post("/", authenticate, protect, questionsController.createQuestion);
questionsRouter.get("/", authenticate, protect, questionsController.getQuestions);
questionsRouter.put("/:id", authenticate, protect, questionsController.updateQuestionById);
questionsRouter.delete("/:id", authenticate, protect, questionsController.deleteQuestionById);
questionsRouter.post("/options", authenticate, protect, questionsController.createQuestionOption);
questionsRouter.post("/recommendations", authenticate, protect, questionsController.createRecommendation);
router.use("/questions", questionsRouter);



const gamesRouter = Router();
gamesRouter.post("/", authenticate, protect, gamesController.createGame);
gamesRouter.get("/", authenticate, protect, gamesController.getGames);
gamesRouter.get("/:id", authenticate, protect, gamesController.getGameById);
gamesRouter.put("/:id", authenticate, protect, gamesController.updateGameById);
gamesRouter.patch("/status/:id", authenticate, protect, gamesController.updateGameStatus);
gamesRouter.delete("/:id", authenticate, protect, gamesController.deleteGameById);
gamesRouter.post("/play", authenticate, protect, gamesController.playGame);
gamesRouter.post("/complete", authenticate, protect, gamesController.completeGame);
gamesRouter.get("/history/:studentId", authenticate, protect, gamesController.getGameHistory);
router.use("/games", gamesRouter);

const subscriptionsRouter = Router();
subscriptionsRouter.post("/plans", authenticate, protect, subscriptionsController.createSubscriptionPlan);
subscriptionsRouter.get("/plans", authenticate, protect, subscriptionsController.getSubscriptionPlans);
subscriptionsRouter.put("/plans/:id", authenticate, protect, subscriptionsController.updateSubscriptionPlan);
subscriptionsRouter.delete("/plans/:id", authenticate, protect, subscriptionsController.deleteSubscriptionPlan);
subscriptionsRouter.post("/assign", authenticate, protect, subscriptionsController.assignSubscription);
subscriptionsRouter.get("/organization/:orgId", authenticate, protect, subscriptionsController.getOrganizationSubscriptions);
subscriptionsRouter.patch("/cancel/:id", authenticate, protect, subscriptionsController.cancelSubscription);
router.use("/subscriptions", subscriptionsRouter);

const paymentsRouter = Router();

paymentsRouter.post("/webhook", paymentsController.handlePaymentWebhook);
paymentsRouter.get("/", authenticate, protect, paymentsController.getPayments);
paymentsRouter.get("/:id", authenticate, protect, paymentsController.getPaymentById);
paymentsRouter.post("/refund/:id", authenticate, protect, paymentsController.refundPayment);
paymentsRouter.get("/reports", authenticate, protect, paymentsController.getPaymentReports);
router.use("/payments", paymentsRouter);

const analyticsRouter = Router();
analyticsRouter.get("/revenue", authenticate, protect, analyticsController.getRevenueAnalytics);
analyticsRouter.get("/subscription-growth", authenticate, protect, analyticsController.getSubscriptionGrowthAnalytics);
analyticsRouter.get("/user-growth", authenticate, protect, analyticsController.getUserGrowthAnalytics);
analyticsRouter.get("/student-engagement", authenticate, protect, analyticsController.getStudentEngagementAnalytics);
analyticsRouter.get("/game-engagement", authenticate, protect, analyticsController.getGameEngagementAnalytics);
router.use("/analytics", analyticsRouter);

const auditLogsRouter = Router();
auditLogsRouter.get("/", authenticate, protect, auditLogsController.getAuditLogs);
auditLogsRouter.get("/:id", authenticate, protect, auditLogsController.getAuditLogById);
router.use("/audit-logs", auditLogsRouter);

const settingsRouter = Router();
settingsRouter.get("/", authenticate, protect, settingsController.getSettings);
settingsRouter.put("/", authenticate, protect, settingsController.updateSettings);
settingsRouter.put("/notifications", authenticate, protect, settingsController.updateNotificationSettings);
settingsRouter.put("/permissions", authenticate, protect, settingsController.updatePermissionSettings);
settingsRouter.put("/platform", authenticate, protect, settingsController.updatePlatformSettings);
router.use("/settings", settingsRouter);

const uploadsRouter = Router();
uploadsRouter.post("/profile-image", authenticate, protect, uploadsController.uploadProfileImage);
uploadsRouter.post("/student-documents", authenticate, protect, uploadsController.uploadStudentDocuments);
uploadsRouter.post("/reports", authenticate, protect, uploadsController.uploadReports);
router.use("/uploads", uploadsRouter);

const notificationsRouter = Router();
notificationsRouter.post("/send", authenticate, protect, notificationsController.sendNotification);
notificationsRouter.get("/", authenticate, protect, notificationsController.getNotifications);
notificationsRouter.put("/read/:id", authenticate, protect, notificationsController.markNotificationRead);
notificationsRouter.put("/preferences", authenticate, protect, notificationsController.updateNotificationPreferences);
router.use("/notifications", notificationsRouter);

export default router;
