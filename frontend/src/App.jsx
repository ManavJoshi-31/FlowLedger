import { BrowserRouter, Routes, Route } from "react-router-dom";
import CreateBudget from "./pages/CreateBudget";
import AppLayout from "./layouts/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Budgets from "./pages/Budgets";
import CreateFinancialRequest from "./pages/CreateFinancialRequest";
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/budgets" element={<Budgets />} />

            <Route path="/requests/new" element={<CreateFinancialRequest />} />

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
