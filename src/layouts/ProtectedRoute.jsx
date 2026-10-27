import { Navigate, useLocation } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../contexts/AuthContext";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";

export const ProtectedRoute = ({ children, roles }) => {
  const location = useLocation();
  const { isAuthenticated, isCheckingAuth, hasRole } = useAuth();

  if (isCheckingAuth) {
    return <LoadingOverlay isVisible message="Verificando acesso..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} state={{ from: location }} replace />;
  }

  if (roles && !hasRole(roles)) {
    return <Navigate to="/acesso-negado" replace />;
  }

  return children;
};
