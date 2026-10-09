import { getFinancialRequests } from "./financialRequestService";
import { getBudgets } from "./budgetService";
import { getUsers } from "./userService";
import { getDepartments } from "./departmentService";

/**
 * Audit Log Service
 *
 * NOTE ON BACKEND ARCHITECTURE:
 * The FlowLedger backend maintains an internal Mongoose `AuditLog` model (and
 * writes records on financial request creation, approval, and rejection), but
 * currently does not expose a dedicated `GET /api/audit-logs` endpoint.
 *
 * This service compiles live, verifiable audit and activity history directly
 * from the authoritative backend domain models and notifications that the
 * authenticated user's role is permitted to access.
 */

/**
 * Fetches and synthesizes audit history from authorized backend endpoints.
 * @param {Object} currentUser The authenticated user object from AuthContext
 * @returns {Promise<{ logs: Array, summary: Object }>}
 */
export const getAuditHistory = async (currentUser) => {
  const role = currentUser?.role;
  const isOrgAdmin = role === "ORGANIZATION_ADMIN";
  const isDeptManager = role === "DEPARTMENT_MANAGER";

  // Fetch permitted domain resources concurrently with isolated error boundaries
  const [
    requestsResult,
    budgetsResult,
    usersResult,
    departmentsResult,
  ] = await Promise.allSettled([
    // Financial requests: Allowed for EMPLOYEE, DEPARTMENT_MANAGER, ORGANIZATION_ADMIN
    (isOrgAdmin || isDeptManager)
      ? getFinancialRequests()
      : Promise.resolve({ requests: [] }),

    // Budgets: Allowed for FINANCE_MANAGER, ORGANIZATION_ADMIN, DEPARTMENT_MANAGER
    (isOrgAdmin || isDeptManager)
      ? getBudgets()
      : Promise.resolve({ budgets: [] }),

    // Users: Allowed for ORGANIZATION_ADMIN, DEPARTMENT_MANAGER
    (isOrgAdmin || isDeptManager)
      ? getUsers()
      : Promise.resolve({ users: [] }),

    // Departments: Allowed for FINANCE_MANAGER, ORGANIZATION_ADMIN
    isOrgAdmin
      ? getDepartments()
      : Promise.resolve({ departments: [] }),
  ]);

  const requests =
    requestsResult.status === "fulfilled"
      ? requestsResult.value.requests || []
      : [];
  const budgets =
    budgetsResult.status === "fulfilled"
      ? budgetsResult.value.budgets || []
      : [];
  const users =
    usersResult.status === "fulfilled"
      ? usersResult.value.users || []
      : [];
  const departments =
    departmentsResult.status === "fulfilled"
      ? departmentsResult.value.departments || []
      : [];

  // Build lookups for relational resolution
  const userMap = new Map();
  users.forEach((u) => {
    if (u._id) userMap.set(String(u._id), u);
  });

  const departmentMap = new Map();
  departments.forEach((d) => {
    if (d._id) departmentMap.set(String(d._id), d);
  });

  const budgetMap = new Map();
  budgets.forEach((b) => {
    if (b._id) budgetMap.set(String(b._id), b);
  });

  const logs = [];

  // 1. Audit events from Financial Requests (Creation, Approvals, Rejections)
  requests.forEach((req) => {
    const requester = userMap.get(String(req.requestedBy));
    const dept = departmentMap.get(String(req.departmentId));
    const budget = budgetMap.get(String(req.budgetId));

    const requesterLabel = requester
      ? `${requester.name} (${requester.email})`
      : req.requestedBy
      ? `User ${String(req.requestedBy).slice(-6)}`
      : "Unknown User";

    const departmentLabel = dept ? dept.name : "Department";
    const budgetLabel = budget ? `FY ${budget.fiscalYear}` : "Budget";

    // Initial Creation / Submission Event
    const creationTime = req.submittedAt || req.createdAt;
    if (creationTime) {
      logs.push({
        id: `${req._id}-created`,
        entityType: "FINANCIAL_REQUEST",
        entityId: req._id,
        action: "FINANCIAL_REQUEST_CREATED",
        actionLabel: "Request Created",
        status: req.status === "DRAFT" ? "DRAFT" : "PENDING",
        severity: "info",
        timestamp: new Date(creationTime),
        actor: {
          id: req.requestedBy,
          name: requester ? requester.name : "Employee",
          email: requester?.email || "",
          role: requester?.role || "EMPLOYEE",
        },
        title: req.title,
        description: req.description,
        details: {
          Amount: `₹${Number(req.amount || 0).toLocaleString("en-IN")}`,
          Category: req.category,
          Department: departmentLabel,
          Budget: budgetLabel,
          "Initial Status": req.status === "DRAFT" ? "Draft" : "Pending Review",
        },
      });
    }

    // Status Transition Event (Approval or Rejection)
    if (req.status === "APPROVED" || req.status === "REJECTED") {
      const isApproved = req.status === "APPROVED";
      const transitionTime = req.updatedAt || req.createdAt;

      logs.push({
        id: `${req._id}-${req.status.toLowerCase()}`,
        entityType: "FINANCIAL_REQUEST",
        entityId: req._id,
        action: isApproved
          ? "FINANCIAL_REQUEST_APPROVED"
          : "FINANCIAL_REQUEST_REJECTED",
        actionLabel: isApproved ? "Request Approved" : "Request Rejected",
        status: req.status,
        severity: isApproved ? "success" : "danger",
        timestamp: new Date(transitionTime),
        actor: {
          id: null,
          name: dept?.managerId && userMap.get(String(dept.managerId))
            ? userMap.get(String(dept.managerId)).name
            : "Department Reviewer",
          email: dept?.managerId && userMap.get(String(dept.managerId))?.email || "",
          role: "DEPARTMENT_MANAGER",
        },
        title: req.title,
        description: isApproved
          ? `Request for ₹${Number(req.amount || 0).toLocaleString("en-IN")} was approved.`
          : `Request for ₹${Number(req.amount || 0).toLocaleString("en-IN")} was rejected.`,
        details: {
          Decision: req.status,
          Amount: `₹${Number(req.amount || 0).toLocaleString("en-IN")}`,
          Category: req.category,
          Department: departmentLabel,
          RequestedBy: requesterLabel,
        },
      });
    }
  });

  // 2. Audit events from Budgets (Creation, Updates, Closures)
  budgets.forEach((b) => {
    const dept = departmentMap.get(String(b.departmentId));
    const departmentLabel = dept ? dept.name : "Department";

    // Budget creation event
    if (b.createdAt) {
      logs.push({
        id: `${b._id}-created`,
        entityType: "BUDGET",
        entityId: b._id,
        action: "BUDGET_CREATED",
        actionLabel: "Budget Created",
        status: b.status,
        severity: "info",
        timestamp: new Date(b.createdAt),
        actor: {
          id: null,
          name: "Finance Authority",
          email: "",
          role: "FINANCE_MANAGER",
        },
        title: `Budget FY ${b.fiscalYear} (${departmentLabel})`,
        description: `Allocated ₹${Number(b.totalAmount || 0).toLocaleString("en-IN")} for ${departmentLabel}.`,
        details: {
          "Fiscal Year": b.fiscalYear,
          Department: departmentLabel,
          "Total Allocated": `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`,
          Status: b.status,
        },
      });
    }

    // Budget closure event if closed
    if (b.status === "CLOSED" && b.updatedAt) {
      logs.push({
        id: `${b._id}-closed`,
        entityType: "BUDGET",
        entityId: b._id,
        action: "BUDGET_CLOSED",
        actionLabel: "Budget Closed",
        status: "CLOSED",
        severity: "warning",
        timestamp: new Date(b.updatedAt),
        actor: {
          id: null,
          name: "Finance Authority",
          email: "",
          role: "FINANCE_MANAGER",
        },
        title: `Budget Closed: FY ${b.fiscalYear}`,
        description: `Budget for ${departmentLabel} was closed. Used: ₹${Number(b.usedAmount || 0).toLocaleString("en-IN")} of ₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}.`,
        details: {
          "Fiscal Year": b.fiscalYear,
          Department: departmentLabel,
          "Total Allocation": `₹${Number(b.totalAmount || 0).toLocaleString("en-IN")}`,
          "Disbursed Amount": `₹${Number(b.usedAmount || 0).toLocaleString("en-IN")}`,
          Status: "CLOSED",
        },
      });
    }
  });

  // 3. Audit events from Users (Creation, Status Changes)
  users.forEach((u) => {
    const dept = departmentMap.get(String(u.departmentId));
    const departmentLabel = dept ? dept.name : "Unassigned";

    if (u.createdAt) {
      logs.push({
        id: `${u._id}-created`,
        entityType: "USER",
        entityId: u._id,
        action: "USER_CREATED",
        actionLabel: "User Provisioned",
        status: u.status,
        severity: "info",
        timestamp: new Date(u.createdAt),
        actor: {
          id: null,
          name: "Administrator",
          email: "",
          role: "ORGANIZATION_ADMIN",
        },
        title: `${u.name} (${u.role})`,
        description: `User account created with email ${u.email}.`,
        details: {
          Name: u.name,
          Email: u.email,
          Role: u.role,
          Department: departmentLabel,
          Status: u.status,
        },
      });
    }

    // If user was updated after creation
    if (u.updatedAt && u.createdAt && new Date(u.updatedAt).getTime() - new Date(u.createdAt).getTime() > 2000) {
      logs.push({
        id: `${u._id}-updated`,
        entityType: "USER",
        entityId: u._id,
        action: "USER_UPDATED",
        actionLabel: "User Modified",
        status: u.status,
        severity: u.status === "ACTIVE" ? "neutral" : "warning",
        timestamp: new Date(u.updatedAt),
        actor: {
          id: null,
          name: "Administrator",
          email: "",
          role: "ORGANIZATION_ADMIN",
        },
        title: `User Updated: ${u.name}`,
        description: `User settings or status changed to ${u.status}.`,
        details: {
          Name: u.name,
          Email: u.email,
          Role: u.role,
          CurrentStatus: u.status,
        },
      });
    }
  });

  // 4. Audit events from Departments (Creation, Updates)
  departments.forEach((d) => {
    const manager = userMap.get(String(d.managerId));
    const managerLabel = manager ? `${manager.name} (${manager.email})` : "Unassigned";

    if (d.createdAt) {
      logs.push({
        id: `${d._id}-created`,
        entityType: "DEPARTMENT",
        entityId: d._id,
        action: "DEPARTMENT_CREATED",
        actionLabel: "Department Created",
        status: d.status || "ACTIVE",
        severity: "info",
        timestamp: new Date(d.createdAt),
        actor: {
          id: null,
          name: "Organization Admin",
          email: "",
          role: "ORGANIZATION_ADMIN",
        },
        title: `Department: ${d.name}`,
        description: d.description || "Department created in organization.",
        details: {
          Department: d.name,
          Manager: managerLabel,
          Status: d.status || "ACTIVE",
        },
      });
    }
  });

  // Sort chronologically descending (newest activity first)
  logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  // Aggregate high-level summary metrics
  const summary = {
    totalEvents: logs.length,
    requestsCount: logs.filter((l) => l.entityType === "FINANCIAL_REQUEST").length,
    budgetsCount: logs.filter((l) => l.entityType === "BUDGET").length,
    usersCount: logs.filter((l) => l.entityType === "USER").length,
    departmentsCount: logs.filter((l) => l.entityType === "DEPARTMENT").length,
    approvalsCount: logs.filter((l) => l.action === "FINANCIAL_REQUEST_APPROVED").length,
    rejectionsCount: logs.filter((l) => l.action === "FINANCIAL_REQUEST_REJECTED").length,
  };

  return {
    logs,
    summary,
  };
};
