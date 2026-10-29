import { Navigate, Outlet } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

function ProtectedRoute({ allowedRoles }) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return (
      <Navigate
        to="/403"
        replace
        state={{ currentRole: user?.role, requiredRoles: allowedRoles }}
      />
    );
  }

  return <Outlet />;
}

export default ProtectedRoute;
