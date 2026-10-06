import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CreateBudget from "./pages/CreateBudget";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import CreateFinancialRequest from "./pages/CreateFinancialRequest";
import DepartmentManagement from "./pages/DepartmentManagement";
import UserManagement from "./pages/UserManagement";
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
              element={<ProtectedRoute allowedRoles={["ORGANIZATION_ADMIN"]} />}
            >
              <Route path="/users" element={<UserManagement />} />
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
