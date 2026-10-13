# FlowLedger — AI Coding Agent Guidelines & Operating Rules

This document defines persistent instructions and constraints for AI coding agents operating within the **FlowLedger** repository. All agents must adhere strictly to these rules across every development, maintenance, and redesign task.

---

## 1. Project Overview & Technology Stack

FlowLedger is a multi-tenant enterprise financial workflow and budget governance platform. It enforces multi-layered authorization across organizations, departments, users, budgets, and financial request lifecycles.

### Verified Technology Stack (Source of Truth)

Agents must **never guess or assume** dependencies based on outdated documentation. The current source code reflects the following verified stack:

- **Frontend Runtime & Framework:** React 19 (`react` ^19.2.8, `react-dom` ^19.2.8) built on Vite 8 (`vite` ^8.3.0).
- **Frontend Compiler:** Babel React Compiler (`babel-plugin-react-compiler` ^1.0.0 via `@rolldown/plugin-babel`).
- **Routing:** React Router DOM v7 (`react-router-dom` ^7.18.4) with nested layout routes and role guards.
- **HTTP Client:** Axios (`axios` ^1.20.0) configured with request Bearer interceptors and 401 response redirects.
- **Styling Architecture:** **Vanilla CSS with CSS Custom Properties** (design tokens in [frontend/src/index.css](file:///c:/Users/manav/FlowLedger/frontend/src/index.css)) and component-scoped stylesheets. **Tailwind CSS is NOT installed or configured** (disregard outdated references in legacy documentation).
- **Typography:** Self-hosted Playfair Display serif (`@fontsource/playfair-display` ^5.3.0) paired with system sans-serif.
- **Backend Runtime & Framework:** Node.js (ES Modules, `"type": "module"`), Express 5 (`express` ^5.2.1).
- **Database & ODM:** MongoDB Atlas with Mongoose 9 (`mongoose` ^9.9.2). Monetary values are persisted strictly as `Decimal128`.
- **Authentication & Security:** Stateless JSON Web Tokens (`jsonwebtoken` ^9.0.3) with 1-hour validity, password hashing via bcryptjs (`bcryptjs` ^3.0.3), and CORS (`cors` ^2.8.6).

---

## 2. Source-of-Truth Hierarchy & Repository Inspection

1. **Active Source Code is Ground Truth:** When evaluating schemas, routes, middleware, permissions, or components, inspect the actual source code (`backend/src/` and `frontend/src/`).
2. **Never Rely on Legacy Documentation:** The legacy `README.md` contains historical inaccuracies (e.g., claiming Tailwind CSS and Vite 7). Always verify configuration files (`package.json`, `vite.config.js`).
3. **Mandatory Pre-Edit Inspection:** Before modifying or extending any component, service, route, or model, read the target file and its direct consumers.
4. **Stitch MCP Status:** Stitch MCP is connected but currently contains no FlowLedger project assets. Do not assume Stitch assets exist until generated or imported.

---

## 3. Core Coding Conventions & Architecture Principles

- **Layer Separation:**
  - `frontend/src/services/`: All backend network requests must be abstracted here. Components must never call Axios directly.
  - `frontend/src/context/`: Global session and auth state only ([AuthContext.jsx](file:///c:/Users/manav/FlowLedger/frontend/src/context/AuthContext.jsx)).
  - `frontend/src/components/`: Reusable, modular UI components with co-located CSS.
  - `frontend/src/pages/`: Domain views assembling components and managing page-level state.
  - `backend/src/routes/`: Route declarations and middleware bindings.
  - `backend/src/controllers/`: Business logic, request validation, and database operations.
  - `backend/src/models/`: Authoritative Mongoose schemas and indexes.
- **Design Token Discipline:**
  - Always use predefined CSS variables from [frontend/src/index.css](file:///c:/Users/manav/FlowLedger/frontend/src/index.css) (e.g., `var(--color-ink)`, `var(--color-teal)`, `var(--radius-sm)`).
  - Do not hardcode arbitrary hex colors, inline CSS styles, or external CSS utility libraries.
- **Monetary Precision:**
  - Backend persists all currency and financial amounts using `mongoose.Schema.Types.Decimal128`.
  - Frontend services must normalize MongoDB decimal representations (`$numberDecimal`) via `normalizeBudget` or `normalizeRequest` before passing amounts to state.
  - Currency inputs must be validated as positive whole numbers where required by business logic.

---

## 4. Security, Multi-Tenancy & Authorization Rules

- **Multi-Tenant Organization Isolation:**
  - Every database query for tenant-scoped resources (`departments`, `budgets`, `users`, `financial-requests`, `audit-logs`) must explicitly filter by `req.user.organizationId`.
  - Never allow cross-organization reads, writes, approvals, or reassignments.
- **Defense-in-Depth Authorization:**
  - Frontend guards in [ProtectedRoute.jsx](file:///c:/Users/manav/FlowLedger/frontend/src/components/auth/ProtectedRoute.jsx) only control navigation; they do not guarantee security.
  - Backend middleware ([authMiddleware.js](file:///c:/Users/manav/FlowLedger/backend/src/auth/authMiddleware.js)) enforces token verification (`authenticate`) and static role permissions (`authorizeRole`).
  - Controllers must enforce real-time database checks:
    - Verify that the calling user has `status === "ACTIVE"` in MongoDB (invalidating deactivated users even if their JWT is unexpired).
    - Verify that `DEPARTMENT_MANAGER` callers actually manage the relevant department.
    - Validate that requests belong to the manager's assigned department before approval or rejection.
- **Preserve Existing API Contracts:**
  - Never alter existing endpoint paths, parameter signatures, or response structures without an explicit mandate.
  - Never invent undocumented endpoints (e.g., the backend has an internal `AuditLog` model but currently does not expose a `GET /api/audit-logs` endpoint; the frontend synthesizes audit history in [auditLogService.js](file:///c:/Users/manav/FlowLedger/frontend/src/services/auditLogService.js)).

---

## 5. Prohibited Practices

1. **NO Mock or Synthetic Data in Production Code:** Do not replace working API service calls with dummy JSON objects, synthetic delays, or local hardcoded arrays.
2. **NO Unapproved Dependencies:** Do not install Tailwind CSS, Lucide, Material UI, Redux, or other external libraries without explicit user instruction.
3. **NO Destructive Refactoring:** Do not rewrite functioning controllers, services, or layouts when tasked with visual or incremental updates.
4. **NO Silent Failures:** Ensure all asynchronous errors are captured, logged, and surfaced through user-facing alert elements.

---

## 6. Incremental Implementation & Verification Workflow

When executing any task:
1. **Analyze:** Inspect relevant source files, services, and CSS stylesheets.
2. **Plan:** Identify specific files to update and isolate potential side effects.
3. **Execute:** Implement minimal, high-cohesion changes adhering to design tokens.
4. **Verify:** Check syntax, route accessibility, error boundaries, and responsiveness.
5. **Report:** Provide a concise summary of changes, design rationale, and verified behavior.

---

## 7. Project Documentation Index

Refer to the following authoritative technical guides in `docs/`:

- [docs/ARCHITECTURE.md](file:///c:/Users/manav/FlowLedger/docs/ARCHITECTURE.md) — System topology, entry points, data flows, and schema relationships.
- [docs/DESIGN_SYSTEM.md](file:///c:/Users/manav/FlowLedger/docs/DESIGN_SYSTEM.md) — Enterprise finance tokens, typography, component standards, and Stitch translation guide.
- [docs/ROLE_PERMISSIONS.md](file:///c:/Users/manav/FlowLedger/docs/ROLE_PERMISSIONS.md) — Comprehensive RBAC matrix and defense-in-depth rules.
- [docs/API_CONTRACTS.md](file:///c:/Users/manav/FlowLedger/docs/API_CONTRACTS.md) — Authoritative endpoint signatures, payloads, and status codes.
- [docs/FRONTEND_GUIDE.md](file:///c:/Users/manav/FlowLedger/docs/FRONTEND_GUIDE.md) — Frontend engineering guidelines, service patterns, and form conventions.
- [docs/REDESIGN_PLAN.md](file:///c:/Users/manav/FlowLedger/docs/REDESIGN_PLAN.md) — Phased UI redesign roadmap and verification checklist.
- [.agents/rules/frontend-ui.md](file:///c:/Users/manav/FlowLedger/.agents/rules/frontend-ui.md) — Specific rules for frontend UI engineering tasks.
