# API Documentation

Base URL: `http://<host>:<port>/api`

## Authentication

### POST /auth/register
Registers a new user.

Request body:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "flag": 1,
  "organizationId": 123,
  "organization_type": 0,
  "zonalAdminId": 45,
  "city": "Mumbai",
  "state": "Maharashtra",
  "pincode": "400001",
  "address": "123 Main Street"
}
```

Response:
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "flag": 1,
      "status": 1,
      "userId": 123,
      "__v": 0
    },
    "generatedPassword": "Abc12345",
    "role": { "collection": "OrganizationAdmin", "_id": "..." }
  }
}
```

---

### POST /auth/login
Authenticate user and return JWT token.

Request body:
```json
{
  "email": "john@example.com",
  "password": "securePassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" },
    "token": "<jwt-token>"
  }
}
```

---

### POST /auth/logout
Invalidate current JWT token.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### POST /auth/forgot-password
Request a password reset link.

Request body:
```json
{
  "email": "john@example.com"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset email sent successfully",
  "data": { "email": "john@example.com" }
}
```

---

### POST /auth/reset-password
Reset password using token.

Request body:
```json
{
  "token": "<reset-token>",
  "password": "newSecurePassword"
}
```

Response:
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

### POST /auth/verify-email
Verify user email using token.

Request body:
```json
{
  "token": "<verification-token>"
}
```

Response:
```json
{
  "success": true,
  "message": "Email verified successfully"
}
```

---

### GET /auth/profile
Get authenticated user profile.

Headers:
- `Authorization: Bearer <token>`

Response:
```json
{
  "success": true,
  "data": { "user": { "_id": "...", "name": "John Doe", "email": "john@example.com" }, "roleData": {...} }
}
```

---

### PUT /auth/profile
Update authenticated user profile.

Headers:
- `Authorization: Bearer <token>`

Request body example:
```json
{
  "name": "John Updated",
  "email": "john.new@example.com",
  "city": "Pune",
  "state": "Maharashtra",
  "pincode": "411001"
}
```

Response:
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": { ... }
}
```

---

### PUT /auth/change-password
Change authenticated user password.

Headers:
- `Authorization: Bearer <token>`

Request body:
```json
{
  "currentPassword": "oldPassword",
  "newPassword": "newPassword123"
}
```

Response:
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

## Dashboard
All dashboard endpoints require auth.

### GET /dashboard/super-admin
### GET /dashboard/organization-admin
### GET /dashboard/parent
### GET /dashboard/doctor
### GET /dashboard/teacher

Headers:
- `Authorization: Bearer <token>`

Response example:
```json
{
  "success": true,
  "message": "Parent dashboard data",
  "data": {}
}
```

---

## Organization Management

### POST /organizations
Create a new organization.

Request body example:
```json
{
  "name": "Organization Name",
  "type": "school",
  "city": "Mumbai",
  "state": "Maharashtra",
  "address": "123 School Road"
}
```

### GET /organizations
List organizations.

### GET /organizations/:id
Get organization details.

### PUT /organizations/:id
Update organization.

Request body example:
```json
{
  "name": "New Organization Name",
  "status": 1
}
```

### PATCH /organizations/status/:id
Update organization status.

Request body example:
```json
{
  "status": 1
}
```

### DELETE /organizations/:id
Delete organization.

Response example:
```json
{
  "success": true,
  "message": "Organization deleted successfully",
  "data": { "id": "..." }
}
```

---

## User Management

### POST /users
Create a new user.

Request body example:
```json
{
  "name": "Alice",
  "email": "alice@example.com",
  "flag": 2,
  "organizationId": 100
}
```

### GET /users
Retrieve all users.

### GET /users/:id
Retrieve user by ID.

### PUT /users/:id
Update user.

Request body example:
```json
{
  "name": "Alice Updated",
  "status": 1
}
```

### PATCH /users/status/:id
Change user status.

Request body:
```json
{
  "status": 0
}
```

### DELETE /users/:id
Delete a user.

### PATCH /users/role/:id
Change user role.

Request body example:
```json
{
  "role": 3
}
```

---

## Student APIs

### POST /students
Create student.

Request body example:
```json
{
  "name": "Student One",
  "parentId": 55,
  "organizationId": 100
}
```

### GET /students
List students.

### GET /students/:id
Get a student.

### PUT /students/:id
Update a student.

Request body example:
```json
{
  "name": "Student One Updated"
}
```

### DELETE /students/:id
Delete student.

### PATCH /students/assign-teacher/:id
Assign teacher to student.

Request body example:
```json
{
  "teacherId": 200
}
```

### GET /students/reports/:id
Get student report.

### GET /students/progress/:id
Get student progress.

---

## Doctor / Therapist APIs

### POST /doctors
Create doctor/therapist.

Request body example:
```json
{
  "name": "Dr. Smith",
  "email": "dr.smith@example.com",
  "organizationId": 100
}
```

### GET /doctors
List doctors.

### GET /doctors/:id
Get doctor by ID.

### PUT /doctors/:id
Update doctor.

Request body example:
```json
{
  "name": "Dr. Smith Updated"
}
```

### DELETE /doctors/:id
Delete doctor.

### PATCH /doctors/availability/:id
Update doctor availability.

Request body example:
```json
{
  "availability": ["2026-06-01T10:00:00Z"]
}
```

### PATCH /doctors/assign-organization/:id
Assign doctor to organization.

Request body example:
```json
{
  "organizationId": 100
}
```

---

## Psychological Evaluation APIs

### POST /evaluations
Create evaluation.

Request body example:
```json
{
  "studentId": 33,
  "questions": [ ... ]
}
```

### GET /evaluations
List evaluations.

### GET /evaluations/:id
Get evaluation by ID.

### PUT /evaluations/:id
Update evaluation.

Request body example:
```json
{
  "status": "completed"
}
```

### DELETE /evaluations/:id
Delete evaluation.

### POST /evaluations/start
Start evaluation.

Request body example:
```json
{
  "evaluationId": 42,
  "studentId": 33
}
```

### POST /evaluations/submit
Submit evaluation.

Request body example:
```json
{
  "evaluationId": 42,
  "answers": [ ... ]
}
```

### GET /evaluations/report/:id
Retrieve evaluation report.

### GET /evaluations/history/:studentId
Retrieve evaluation history for student.

---

## Question & Recommendation APIs

### POST /questions
Create question.

Request body example:
```json
{
  "questionText": "How do you feel?",
  "ansOptions": [{ "ansOptionsId": 1, "text": "Good" }]
}
```

### GET /questions
List questions.

### PUT /questions/:id
Update question.

Request body example:
```json
{
  "questionText": "Updated text"
}
```

### DELETE /questions/:id
Delete question.

### POST /questions/options
Create a question option.

Request body example:
```json
{
  "questionId": 10,
  "ansOptionsId": 2,
  "text": "Sometimes"
}
```

### POST /questions/recommendations
Create a recommendation.

Request body example:
```json
{
  "studentId": 33,
  "recommendation": "Follow up with therapist"
}
```

---

## Appointment APIs

### POST /appointments
Create appointment.

Request body example:
```json
{
  "parentId": 55,
  "teacherId": 200,
  "date": "2026-06-10",
  "time": "10:00"
}
```

### GET /appointments
List appointments.

### GET /appointments/:id
Get appointment by ID.

### PATCH /appointments/confirm/:id
Confirm appointment.

Request body example:
```json
{
  "status": "confirmed"
}
```

### PATCH /appointments/reschedule/:id
Reschedule appointment.

Request body example:
```json
{
  "date": "2026-06-11",
  "time": "11:00"
}
```

### PATCH /appointments/cancel/:id
Cancel appointment.

Request body example:
```json
{
  "status": "cancelled"
}
```

### PATCH /appointments/complete/:id
Mark appointment complete.

Request body example:
```json
{
  "status": "completed"
}
```

### GET /appointments/available-slots/:doctorId
Get available slots for doctor.

Response example:
```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": { "doctorId": 200, "slots": [] }
}
```

---

## Games APIs

### POST /games
Create game.

Request body example:
```json
{
  "title": "Memory Game",
  "description": "A brain training game"
}
```

### GET /games
List games.

### GET /games/:id
Get game.

### PUT /games/:id
Update game.

Request body example:
```json
{
  "title": "Memory Game Updated"
}
```

### PATCH /games/status/:id
Change game status.

Request body example:
```json
{
  "status": "active"
}
```

### DELETE /games/:id
Delete game.

### POST /games/play
Start game play.

Request body example:
```json
{
  "studentId": 33,
  "gameId": 101
}
```

### POST /games/complete
Complete game session.

Request body example:
```json
{
  "studentId": 33,
  "gameId": 101,
  "score": 85
}
```

### GET /games/history/:studentId
Get game history for student.

---

## Subscription APIs

### POST /subscriptions/plans
Create subscription plan.

Request body example:
```json
{
  "name": "Premium",
  "price": 1999,
  "durationMonths": 12
}
```

### GET /subscriptions/plans
List subscription plans.

### PUT /subscriptions/plans/:id
Update subscription plan.

Request body example:
```json
{
  "price": 2499
}
```

### DELETE /subscriptions/plans/:id
Delete plan.

### POST /subscriptions/assign
Assign subscription to org.

Request body example:
```json
{
  "organizationId": 100,
  "planId": 1,
  "startDate": "2026-06-01"
}
```

### GET /subscriptions/organization/:orgId
Get subscriptions for organization.

### PATCH /subscriptions/cancel/:id
Cancel subscription.

Response example:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": { "id": "...", "status": "cancelled" }
}
```

---

## Payment APIs

### POST /payments/create-intent
Create payment intent.

Request body example:
```json
{
  "amount": 1999,
  "currency": "INR"
}
```

### POST /payments/webhook
Receive payment webhook events.

Body depends on provider.

### GET /payments
List payments.

### GET /payments/:id
Get payment.

### POST /payments/refund/:id
Request refund.

Request body example:
```json
{
  "reason": "Customer request"
}
```

### GET /payments/reports
Get payment reports.

---

## Analytics APIs

### GET /analytics/revenue
Get revenue analytics.

### GET /analytics/subscription-growth
Get subscription growth analytics.

### GET /analytics/user-growth
Get user growth analytics.

### GET /analytics/student-engagement
Get student engagement analytics.

### GET /analytics/game-engagement
Get game engagement analytics.

---

## Audit Logs APIs

### GET /audit-logs
List audit logs.

### GET /audit-logs/:id
Get audit log by ID.

---

## Settings APIs

### GET /settings
Get settings.

### PUT /settings
Update settings.

Request body example:
```json
{
  "siteName": "My Platform",
  "defaultLanguage": "en"
}
```

### PUT /settings/notifications
Update notification settings.

Request body example:
```json
{
  "emailNotifications": true,
  "smsNotifications": false
}
```

### PUT /settings/permissions
Update permission settings.

### PUT /settings/platform
Update platform settings.

---

## File Upload APIs

### POST /uploads/profile-image
Upload user profile image.

Form-data fields:
- `file` (file)

### POST /uploads/student-documents
Upload student documents.

Form-data fields:
- `files` (file[])

### POST /uploads/reports
Upload report files.

Form-data fields:
- `files` (file[])

---

## Notification APIs

### POST /notifications/send
Send a notification.

Request body example:
```json
{
  "title": "Reminder",
  "message": "Your appointment is tomorrow.",
  "userId": 55
}
```

### GET /notifications
List notifications.

### PUT /notifications/read/:id
Mark notification read.

### PUT /notifications/preferences
Update notification preferences.

Request body example:
```json
{
  "email": true,
  "sms": false
}
```

---

## Security

- All protected routes require `Authorization: Bearer <token>` header.
- Authentication uses JWT.
- Passwords are hashed using bcrypt in the existing auth service.

## Notes

- The endpoints listed above map to the routes defined in `src/routes.js`.
- Some new endpoints are scaffolded and currently return placeholder data.
- Existing implemented logic is available in the auth and parent/teacher services:
  - `src/services/auth.service.js`
  - `src/services/parents.service.js`
  - `src/services/teacher.service.js`

Use this file as the Postman API reference for request payloads and response structure.
