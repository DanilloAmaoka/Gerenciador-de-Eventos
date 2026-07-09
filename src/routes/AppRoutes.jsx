import { Navigate, Route, Routes } from "react-router-dom";

import DashboardLayout from "../layout/DashboardLayout";
import Ajuda from "../pages/Ajuda";
import Eventos from "../pages/Eventos";
import Configuracoes from "../pages/Configuracoes";
import Arquivo from "../pages/Arquivo";
import Cronograma from "../pages/Cronograma";
import Inicio from "../pages/Inicio";
import Login from "../pages/Login";
import Custos from "../pages/Custos";
import Relatorios from "../pages/Relatorios";
import Orcamento from "../pages/Orcamento";
import { SchoolDataProvider } from "../context/SchoolDataContext";
import { TutorialProvider } from "../context/TutorialContext";
import { ProtectedRoute } from "./ProtectedRoutes";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />

      <Route
        element={
          <ProtectedRoute>
            <SchoolDataProvider>
              <TutorialProvider>
                <DashboardLayout />
              </TutorialProvider>
            </SchoolDataProvider>
          </ProtectedRoute>
        }
      >
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/eventos" element={<Eventos />} />
        <Route path="/custos" element={<Custos />} />
        <Route path="/orcamento" element={<Orcamento />} />
        <Route path="/cronograma" element={<Cronograma />} />
        <Route path="/arquivo" element={<Arquivo />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/ajuda" element={<Ajuda />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
