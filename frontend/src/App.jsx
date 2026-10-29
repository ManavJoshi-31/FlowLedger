import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateBudget from "./pages/budget/CreateBudget";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import LandingPage from "./pages/landing/LandingPage";
import Dashboard from "./pages/dashboard/Dashboard";
import Budgets from "./pages/budget/Budgets";
import CreateFinancialRequest from "./pages/financialRequest/CreateFinancialRequest";
import DepartmentManagement from "./pages/department/DepartmentManagement";
import UserManagement from "./pages/user/UserManagement";
import AuditLogs from "./pages/audit/AuditLogs";
import NotFound from "./pages/error/NotFound";
import Forbidden from "./pages/error/Forbidden";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/forbidden" element={<Forbidden />} />
        <Route path="/404" element={<NotFound />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            {/* Default protected redirect */}
            <Route path="/dashboard" element={<Dashboard />} />

            {/* Department Management - Org Admin only */}
            <Route
              element={<ProtectedRoute allowedRoles={["ORGANIZATION_ADMIN"]} />}
            >
              <Route path="/departments" element={<DepartmentManagement />} />
            </Route>

            {/* User Management - Org Admin & Department Manager */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"]}
                />
              }
            >
              <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Audit & Activity History - Org Admin & Department Manager */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"]}
                />
              }
            >
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>

            {/* Budget viewing - Department Manager, Finance Manager, Org Admin */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={[
                    "DEPARTMENT_MANAGER",
                    "FINANCE_MANAGER",
                    "ORGANIZATION_ADMIN",
                  ]}
                />
              }
            >
              <Route path="/budgets" element={<Budgets />} />
            </Route>

            {/* Employee request creation - Employee only */}
            <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
              <Route
                path="/requests/new"
                element={<CreateFinancialRequest />}
              />
            </Route>

            {/* Budget allocation - Finance Manager & Org Admin */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["FINANCE_MANAGER", "ORGANIZATION_ADMIN"]}
                />
              }
            >
              <Route path="/budgets/new" element={<CreateBudget />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
