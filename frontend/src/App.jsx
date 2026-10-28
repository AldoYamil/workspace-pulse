import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import DashboardLayout from './components/DashboardLayout';

import LandingPage from './pages/LandingPage';
import Login from './pages/Login';

import AdminDashboard from './pages/AdminDashboard';
import OrgManagement from './pages/OrgManagement';
import AppliedSurveys from './pages/AppliedSurveys';
import CuestionarioActivo from './pages/CuestionarioActivo';
import PanelRiesgos from './pages/PanelRiesgos';
import ConfiguracionAlertas from './pages/ConfiguracionAlertas';
import PlanesAccion from './pages/PlanesAccion';
import ReportesAuditoria from './pages/ReportesAuditoria';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="organizacion" element={<OrgManagement />} />
          <Route path="encuestas-aplicadas" element={<AppliedSurveys />} />
          
          <Route path="cuestionario" element={<CuestionarioActivo />} />
          <Route path="riesgos" element={<PanelRiesgos />} />
          <Route path="alertas" element={<ConfiguracionAlertas />} />
          <Route path="planes-accion" element={<PlanesAccion />} />
          <Route path="reportes-auditoria" element={<ReportesAuditoria />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}