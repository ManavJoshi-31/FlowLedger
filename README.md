# FlowLedger

> **Secure Financial Workflow & Budget Management Platform**

FlowLedger is a backend-focused financial workflow platform designed to manage **organizations, departments, users, budgets, financial requests, and approval workflows** through a secure and structured REST API.

The system is designed with a **security-first and system-design-oriented approach**, with particular emphasis on:

- Role-Based Access Control (RBAC)
- JWT authentication
- Organization and department isolation
- Resource-level authorization
- Financial data integrity
- Workflow state management
- Approval traceability
- Extensible backend architecture

FlowLedger goes beyond conventional CRUD operations by enforcing authorization at multiple levels: **identity, role, organization, department, resource ownership, and workflow state**.

---

## ✨ Key Features

- 🔐 JWT-based authentication
- 🔑 Secure password hashing using bcrypt
- 🛡️ Role-Based Access Control (RBAC)
- 🏢 Multi-organization data isolation
- 🏬 Department-level authorization
- 👥 Role-aware user management
- 💰 Budget creation and lifecycle management
- 📄 Financial request management
- 📊 Budget availability validation
- ✅ Department Manager approval workflow
- ❌ Request rejection workflow
- 🧾 Persistent approval decision records
- 🔔 Notification domain model
- 📝 Audit logging domain model
- 🔒 Resource-level authorization
- 🔄 Controlled financial workflow state transitions
- 💾 MongoDB Decimal128 for monetary fields

---

## 🧰 Tech Stack

<div align="center">

![React](https://img.shields.io/badge/React-2026-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)
![React Router](https://img.shields.io/badge/React_Router-7.x-CA4245?style=for-the-badge&logo=react-router&logoColor=white)
![Axios](https://img.shields.io/badge/Axios-HTTP_Client-5A29E4?style=for-the-badge&logo=axios&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Mongoose](https://img.shields.io/badge/Mongoose-880000?style=for-the-badge&logo=mongoose&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white)

![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)
![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white)

</div>

### Frontend

| Technology            | Purpose                                     |
| --------------------- | ------------------------------------------- |
| **React**             | Component-based frontend UI                 |
| **Vite**              | Frontend development server and build tool  |
| **React Router**      | Client-side routing and protected routes    |
| **Axios**             | Communication with the FlowLedger REST API  |
| **Tailwind CSS**      | Utility-first responsive UI styling         |
| **Context API**       | Authentication and global application state |
| **JavaScript (ES6+)** | Frontend application language               |

### Backend

| Technology        | Purpose                          |
| ----------------- | -------------------------------- |
| **Node.js**       | JavaScript runtime               |
| **Express.js**    | REST API framework               |
| **MongoDB Atlas** | Cloud-hosted database            |
| **Mongoose**      | ODM and database schema modeling |
| **JWT**           | Stateless authentication         |
| **bcryptjs**      | Password hashing                 |
| **dotenv**        | Environment configuration        |
| **CORS**          | Cross-origin request handling    |

### Development & Testing

| Technology       | Purpose                           |
| ---------------- | --------------------------------- |
| **Postman**      | REST API testing                  |
| **Git / GitHub** | Version control                   |
| **Nodemon**      | Backend development server reload |

---

## 🧠 What FlowLedger Solves

Financial workflows require more than simply storing requests in a database.

A production-oriented system needs to answer questions such as:

- Who is making the request?
- Which organization does the user belong to?
- Which department owns the request?
- Which budget is being used?
- Does that budget belong to the user's department?
- Is the budget still active?
- Who is authorized to review the request?
- Can a manager from another department approve it?
- Can an already-approved request be modified?
- Who made the approval decision?
- Why was a request rejected?

FlowLedger addresses these concerns through explicit domain relationships and backend-enforced business rules.

---

## 🏗️ System Architecture

```text
                         ┌─────────────────────┐
                         │       Client        │
                         │   Web App / Postman │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   Express Router    │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Authentication      │
                         │ JWT Middleware      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Authorization       │
                         │ RBAC Middleware     │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Controllers         │
                         │ Business Logic      │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │ Mongoose Models     │
                         │ Domain Persistence  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    MongoDB Atlas    │
                         └─────────────────────┘
```

The backend is organized around clear responsibilities:

```text
Routes
   ↓
Authentication / Authorization
   ↓
Controllers
   ↓
Models
   ↓
MongoDB
```

This separation keeps HTTP concerns, security checks, business rules, and persistence responsibilities distinct.

---

## 🗂️ Project Structure

````text
FlowLedger/
│
├── backend/
│   │
│   ├── src/
│   │   │
│   │   ├── auth/
│   │   │   ├── authController.js
│   │   │   ├── authRoutes.js
│   │   │   └── authMiddleware.js
│   │   │
│   │   ├── controllers/
│   │   │   ├── organizationController.js
│   │   │   ├── departmentController.js
│   │   │   ├── budgetController.js
│   │   │   ├── financialRequestController.js
│   │   │   ├── userController.js
│   │   │   ├── notificationController.js
│   │   │   └── auditLogController.js
│   │   │
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   ├── validationMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   │
│   │   ├── models/
│   │   │   ├── Organization.js
│   │   │   ├── Department.js
│   │   │   ├── User.js
│   │   │   ├── Budget.js
│   │   │   ├── FinancialRequest.js
│   │   │   ├── Approval.js
│   │   │   ├── Notification.js
│   │   │   └── AuditLog.js
│   │   │
│   │   ├── routes/
│   │   │   ├── organizationRoutes.js
│   │   │   ├── departmentRoutes.js
│   │   │   ├── budgetRoutes.js
│   │   │   ├── financialRequestRoutes.js
│   │   │   ├── userRoutes.js
│   │   │   ├── notificationRoutes.js
│   │   │   └── auditLogRoutes.js
│   │   │
│   │   ├── services/
│   │   │   ├── notificationService.js
│   │   │   ├── auditLogService.js
│   │   │   ├── budgetService.js
│   │   │   └── financialRequestService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── password.js
│   │   │   ├── jwt.js
│   │   │   └── validators.js
│   │   │
│   │   └── server.js
│   │
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
│
├── frontend/
│   │
│   ├── src/
│   │   │
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   └── icons/
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── Table.jsx
│   │   │   │   ├── Loader.jsx
│   │   │   │   └── ErrorMessage.jsx
│   │   │   │
│   │   │   ├── layout/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   └── DashboardLayout.jsx
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.jsx
│   │   │   │
│   │   │   │
│   │   │   ├── dashboard/
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── BudgetOverview.jsx
│   │   │   │   └── RequestSummary.jsx
│   │   │   │
│   │   │   ├── requests/
│   │   │   │   ├── RequestForm.jsx
│   │   │   │   ├── RequestTable.jsx
│   │   │   │   ├── RequestDetails.jsx
│   │   │   │   └── ApprovalActions.jsx
│   │   │   │
│   │   │   ├── budgets/
│   │   │   │   ├── BudgetTable.jsx
│   │   │   │   ├── BudgetForm.jsx
│   │   │   │   └── BudgetCard.jsx
│   │   │   │
│   │   │   ├── departments/
│   │   │   │   ├── DepartmentTable.jsx
│   │   │   │   └── DepartmentForm.jsx
│   │   │   │
│   │   │   ├── users/
│   │   │   │   ├── UserTable.jsx
│   │   │   │   └── UserForm.jsx
│   │   │   │
│   │   │   ├── notifications/
│   │   │   │   ├── NotificationBell.jsx
│   │   │   │   └── NotificationList.jsx
│   │   │   │
│   │   │   └── audit/
│   │   │       └── AuditLogTable.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Requests.jsx
│   │   │   ├── RequestDetails.jsx
│   │   │   ├── Budgets.jsx
│   │   │   ├── Departments.jsx
│   │   │   ├── Users.jsx
│   │   │   ├── Notifications.jsx
│   │   │   ├── AuditLogs.jsx
│   │   │   └── NotFound.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   └── useApi.js
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   ├── authService.js
│   │   │   ├── requestService.js
│   │   │   ├── budgetService.js
│   │   │   ├── userService.js
│   │   │   ├── departmentService.js
│   │   │   ├── notificationService.js
│   │   │   └── auditLogService.js
│   │   │
│   │   ├── utils/
│   │   │   ├── constants.js
│   │   │   ├── formatCurrency.js
│   │   │   └── formatDate.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   ├── public/
│   │   └── ...
│   │
│   ├── package.json
│   └── vite.config.js
│
│
├── README.md
└── .gitignore

The structure includes dedicated areas for **authentication, controllers, models, routes, services, middleware, and utilities**, allowing the backend to scale without placing all business logic inside route handlers.

---

## 🧩 Domain Model

```text
Organization
    │
    ├── Departments
    │      │
    │      ├── Manager
    │      └── Employees
    │
    ├── Budgets
    │
    └── Financial Requests
             │
             ├── Approvals
             ├── Notifications
             └── Audit Logs
````

---

## 🏢 Organization

An Organization represents an isolated tenant within FlowLedger.

### Key fields

```text
name
email
address
status
```

### Status

```text
ACTIVE
INACTIVE
```

Organization ownership is propagated to relevant resources so that controllers can enforce tenant isolation.

---

## 🏬 Department

A Department belongs to an Organization and has a designated Department Manager.

### Relationships

```text
organizationId → Organization
managerId      → User
```

Department Manager validation ensures that the manager:

- Exists
- Belongs to the same organization
- Has the `DEPARTMENT_MANAGER` role
- Is active

Department names are also protected against duplicates within the same organization.

Manager assignment is synchronized with the corresponding user's `departmentId`.

---

## 👤 User

Users belong to an Organization and may belong to a Department.

### Supported roles

```text
EMPLOYEE
DEPARTMENT_MANAGER
FINANCE_MANAGER
ORGANIZATION_ADMIN
```

The `departmentId` is optional because a manager can exist before their department is created.

User management is permission-aware and organization-scoped.

---

## 💰 Budget

A Budget belongs to both an Organization and a Department.

### Monetary fields

```text
totalAmount
usedAmount
```

MongoDB `Decimal128` is used for monetary values to provide a database representation appropriate for financial data.

### Lifecycle

```text
ACTIVE → CLOSED
```

Closed budgets are terminal under the current design and cannot be updated or reopened.

Budget periods are protected against duplicate occupancy for the same organization and department.

---

## 📄 Financial Request

A Financial Request represents an employee's request for organizational funds.

### Relationships

```text
organizationId
departmentId
requestedBy
budgetId
```

### Categories

```text
PURCHASE
TRAVEL
REIMBURSEMENT
TRAINING
OTHER
```

### Statuses

```text
DRAFT
PENDING
APPROVED
REJECTED
CANCELLED
```

---

## ✅ Approval

An Approval represents a decision made during the financial request workflow.

### Fields

```text
requestId
reviewerId
level
decision
remarks
decidedAt
```

The `level` field provides a foundation for extending the current workflow to multiple approval levels.

---

## 🔔 Notification

The Notification model represents workflow-related notifications.

### Supported notification types

```text
REQUEST_SUBMITTED
REQUEST_APPROVED
REQUEST_REJECTED
REQUEST_CANCELLED
INFORMATION_REQUESTED
```

This domain is designed to support future in-app notification functionality without coupling notification logic directly to request controllers.

---

## 📝 Audit Log

The AuditLog model provides the foundation for traceability and security auditing.

### Tracked information

```text
userId
organizationId
action
entityType
entityId
details
ipAddress
```

### Supported entity types

```text
USER
ORGANIZATION
DEPARTMENT
BUDGET
FINANCIAL_REQUEST
APPROVAL
```

---

## 🔐 Authentication & Authorization

FlowLedger uses **JWT-based authentication** combined with role-based and resource-level authorization.

### Authentication flow

```text
Login
  ↓
Validate credentials
  ↓
Compare password hash
  ↓
Verify account status
  ↓
Generate JWT
  ↓
Client sends Bearer token
  ↓
JWT middleware verifies token
  ↓
Authenticated user attached to request
```

The JWT contains:

```text
userId
organizationId
role
```

### Why `departmentId` is not stored in the JWT

Department assignment is mutable.

Instead of trusting potentially stale department information in a token, department-sensitive operations derive the current relationship from the database:

```text
JWT userId
    ↓
Department lookup
    ↓
Current manager/department relationship
    ↓
Resource authorization
```

This keeps authorization tied to current persisted state.

---

## 🛡️ Security Model

FlowLedger treats authorization as a combination of:

```text
Identity
   +
Role
   +
Organization
   +
Department
   +
Resource Ownership
   +
Workflow State
```

A valid JWT is therefore only the first security boundary.

### Role-Based Authorization

Examples:

```text
EMPLOYEE
    → Create financial requests

DEPARTMENT_MANAGER
    → Review requests from managed department
    → Manage employees within permitted scope

FINANCE_MANAGER
    → Manage budgets and financial operations

ORGANIZATION_ADMIN
    → Manage organization resources
```

### Resource-Level Authorization

A Department Manager is not automatically authorized to operate on every department.

For approval operations:

```text
Authenticated Manager
        ↓
Find department managed by manager
        ↓
Compare request.departmentId
        ↓
Allow only if they match
```

This combines **RBAC with resource ownership checks**.

---

## 💳 Financial Request Workflow

The request creation workflow follows the defined business process:

```text
Login
  ↓
Authenticated?
  ├── No → Login Error
  │
  └── Yes
       ↓
Request Form
       ↓
Enter Details
       ↓
Select Category
       ↓
Enter Amount
       ↓
Validate Input
       ↓
Check Budget Availability
       │
       ├── Insufficient
       │      ↓
       │    Save as DRAFT
       │
       └── Available
              ↓
         Create Request
              ↓
         Status → PENDING
```

Before a request is created, the backend validates:

- User existence
- User active status
- Department assignment
- Budget existence
- Organization ownership
- Department ownership
- Budget status
- Positive request amount
- Budget availability

---

## 🔄 Approval Workflow

```text
                   PENDING
                      │
            Department Manager
                      │
              ┌───────┴───────┐
              │               │
              ▼               ▼
           APPROVE          REJECT
              │               │
              ▼               ▼
          APPROVED         REJECTED
              │               │
              └───────┬───────┘
                      ▼
              Approval Record
```

### Valid state transitions

```text
PENDING → APPROVED
PENDING → REJECTED
```

### Protected transitions

```text
APPROVED → APPROVED   ❌
APPROVED → REJECTED   ❌
REJECTED → REJECTED   ❌
REJECTED → APPROVED   ❌
DRAFT → APPROVED      ❌
DRAFT → REJECTED      ❌
```

The workflow is therefore implemented as a controlled state machine rather than exposing unrestricted status modification.

---

## 💵 Budget Integrity

Budget validation is performed server-side.

A request cannot use a budget merely because the supplied `budgetId` exists.

The backend verifies:

```text
Budget exists
    ↓
Budget organization == User organization
    ↓
Budget department == User department
    ↓
Budget status == ACTIVE
    ↓
Amount > 0
    ↓
Check available amount
```

### Request outcome

```text
Requested amount <= available amount
                ↓
             PENDING
```

```text
Requested amount > available amount
                ↓
              DRAFT
```

The `usedAmount` field is not incremented merely because a request is created; financial utilization is treated as a separate business concern.

---

## 👥 User Management & RBAC

### Organization Administrator

Can manage users within their organization according to the defined administrative permissions.

### Department Manager

Can create and manage employees within their own department.

Department Managers cannot:

- Create Organization Admin accounts through the managed user API
- Create other privileged manager roles
- Modify another Department Manager
- Move employees between departments
- Modify users outside their department

### Employee

Employees can create financial requests but cannot access management or approval operations.

---

## 🌐 API Overview

Base path:

```text
/api
```

### Authentication

```http
POST /api/auth/register
POST /api/auth/login
```

### Organizations

```http
POST /api/organizations
```

### Departments

```http
POST /api/departments
PATCH /api/departments/:departmentId
```

### Users

```http
POST /api/users
PATCH /api/users/:userId
```

### Budgets

```http
POST /api/budgets
GET /api/budgets
GET /api/budgets/:budgetId
PATCH /api/budgets/:budgetId
PATCH /api/budgets/:budgetId/close
```

### Financial Requests

```http
POST /api/financial-requests
GET /api/financial-requests/pending
PATCH /api/financial-requests/:requestId/approve
PATCH /api/financial-requests/:requestId/reject
```

---

## 🧪 Validation & Error Handling

The API uses standard HTTP status codes to communicate failures.

| Status | Meaning                                     |
| ------ | ------------------------------------------- |
| `200`  | Successful operation                        |
| `201`  | Resource created                            |
| `400`  | Invalid request or business-state violation |
| `401`  | Missing or invalid authentication           |
| `403`  | Authenticated but unauthorized              |
| `404`  | Resource not found                          |
| `409`  | Duplicate or conflicting resource           |
| `500`  | Unexpected server error                     |

Examples include:

```text
401 → Invalid or expired JWT
403 → Insufficient role
403 → Cross-department access
403 → Cross-organization access
404 → Resource not found
409 → Duplicate email
409 → Duplicate department/budget period
400 → Closed budget
400 → Invalid workflow transition
```

---

## 🧪 Testing Approach

FlowLedger is developed and validated through API-level testing using Postman.

Testing covers both:

- **Functional behavior**
- **Security and authorization boundaries**

The test strategy focuses particularly on negative cases such as:

- Unauthorized roles
- Cross-department access
- Cross-organization access
- Invalid workflow transitions
- Closed resources
- Invalid financial amounts
- Duplicate resources
- Missing required fields
- Invalid authentication

This ensures that authorization and business rules are validated independently of frontend behavior.

---

## 🔒 Engineering & System Design Focus

FlowLedger is intentionally designed as more than a conventional CRUD application.

### Backend Engineering

The project emphasizes modular REST API design, separation of concerns, controller-level business logic, schema modeling, and clear domain boundaries.

### Application Security

Security is treated as an architectural concern rather than a middleware-only feature.

The system distinguishes between:

```text
Authentication
      ↓
Role Authorization
      ↓
Resource Authorization
      ↓
Business Rule Validation
      ↓
Workflow State Validation
```

### System Design

The domain model is structured around independent but related entities:

```text
Organization
    ↓
Department
    ↓
User

Department
    ↓
Budget
    ↓
Financial Request
    ↓
Approval
```

This separation makes it possible to extend the platform with notifications, audit logging, multi-level approvals, and additional financial operations without collapsing the domain into a single resource.

### Financial Data Integrity

Financial values use `Decimal128`, budgets have explicit lifecycle states, and request processing validates budget ownership before performing workflow operations.

### Extensible Approval Architecture

Although the current workflow uses a single approval level, the `Approval.level` field provides a foundation for future approval chains such as:

```text
Employee
   ↓
Department Manager
   ↓
Finance Manager
   ↓
Organization Administrator
```

---

## 🚀 Future Architecture Extensions

The current structure provides dedicated models and architectural space for capabilities such as:

- In-app notifications
- Automatic audit logging
- Multi-level approvals
- Amount-based approval thresholds
- Finance-level approval
- Budget reservation
- Reimbursement processing
- Stronger input validation
- ObjectId validation
- Rate limiting
- Refresh-token architecture
- Structured logging
- Observability and metrics
- API documentation
- Deployment infrastructure

These extensions are intentionally separated from the current core workflow so that future functionality can be introduced without redesigning the primary domain model.

---

## 👨‍💻 Author

**Manav Joshi**

**Computer Engineering**

### Areas of Interest

- Backend Engineering
- System Design
- Application Security
- REST API Architecture
- Authentication & Authorization
- Database Design
- Secure Software Engineering
- Workflow Systems

---

## 📌 Project Philosophy

> **Build the backend so that authorization, ownership, and business rules remain enforced even when the client cannot be trusted.**

FlowLedger is built around that principle: authenticated users should receive only the permissions and data that their **role, organization, department, resource ownership, and current workflow state** permit.
