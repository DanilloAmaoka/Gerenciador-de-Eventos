import { Navigate } from "react-router-dom";
import { ROUTES } from "../constants/routes";
import { useAuth } from "../contexts/AuthContext";
import { LoadingOverlay } from "../components/ui/LoadingOverlay";

export const PublicRoute = ({ children }) => {
  const { isAuthenticated, isCheckingAuth } = useAuth();

  if (isCheckingAuth) {
    return <LoadingOverlay isVisible message="Carregando sessão..." />;
  }

  if (isAuthenticated) {
    return <Navigate to={ROUTES.home} replace />;
  }

  return children;
};
