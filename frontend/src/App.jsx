import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CreateBudget from "./pages/budget/CreateBudget";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/auth/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import Budgets from "./pages/budget/Budgets";
import CreateFinancialRequest from "./pages/financialRequest/CreateFinancialRequest";
import DepartmentManagement from "./pages/department/DepartmentManagement";
import UserManagement from "./pages/user/UserManagement";
import AuditLogs from "./pages/audit/AuditLogs";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              element={<ProtectedRoute allowedRoles={["ORGANIZATION_ADMIN"]} />}
            >
              <Route path="/departments" element={<DepartmentManagement />} />
            </Route>
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"]}
                />
              }
            >
              <Route path="/users" element={<UserManagement />} />
            </Route>

            {/* Audit & Activity History */}
            <Route
              element={
                <ProtectedRoute
                  allowedRoles={["ORGANIZATION_ADMIN", "DEPARTMENT_MANAGER"]}
                />
              }
            >
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
            {/* Budget viewing */}
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

            {/* Employee request creation */}
            <Route element={<ProtectedRoute allowedRoles={["EMPLOYEE"]} />}>
              <Route
                path="/requests/new"
                element={<CreateFinancialRequest />}
              />
            </Route>

            {/* Budget creation */}
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
