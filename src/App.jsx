import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { FeedbackCenter } from "./components/feedback/FeedbackCenter";
import { ToastContainer } from "./components/feedback/ToastContainer";
import { ROUTES } from "./constants/routes";
import { AuthProvider } from "./contexts/AuthContext";
import { FeedbackProvider } from "./contexts/FeedbackContext";
import { AppLayout } from "./layouts/AppLayout";
import { ProtectedRoute } from "./layouts/ProtectedRoute";
import { PublicRoute } from "./layouts/PublicRoute";
import { AccessDeniedPage } from "./pages/Errors/AccessDeniedPage";
import { NotFoundPage } from "./pages/Errors/NotFoundPage";
import { CalendarPage } from "./pages/Calendar/CalendarPage";
import { EventsPage } from "./pages/Events/EventsPage";
import { HomePage } from "./pages/Home/HomePage";
import { LoginPage } from "./pages/Login/LoginPage";
import { ReportsPage } from "./pages/Reports/ReportsPage";
import { SettingsPage } from "./pages/Settings/SettingsPage";
import { TemplatesPage } from "./pages/Templates/TemplatesPage";
import { EventWorkspace } from "./features/events/EventWorkspace";

export const App = () => (
  <AuthProvider>
    <FeedbackProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path={ROUTES.login}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/"
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to={ROUTES.home} replace />} />
            <Route path="inicio" element={<HomePage />} />
            <Route path="eventos" element={<EventsPage />} />
            <Route path="eventos/novo" element={<Navigate to={ROUTES.events} replace />} />
            <Route path="eventos/:eventId/*" element={<EventWorkspace />} />
            <Route path="calendario" element={<CalendarPage />} />
            <Route path="modelos" element={<TemplatesPage />} />
            <Route path="relatorios" element={<ReportsPage />} />
            <Route
              path="configuracoes"
              element={
                <ProtectedRoute roles="administrador">
                  <SettingsPage />
                </ProtectedRoute>
              }
            />
            <Route path="acesso-negado" element={<AccessDeniedPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
        <FeedbackCenter />
        <ToastContainer />
      </BrowserRouter>
    </FeedbackProvider>
  </AuthProvider>
);
