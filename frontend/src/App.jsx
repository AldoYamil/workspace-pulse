import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import Login from './pages/Login';
import CuestionarioActivo from './pages/CuestionarioActivo';
import PanelRiesgos from './pages/PanelRiesgos';
import ConfiguracionAlertas from './pages/ConfiguracionAlertas';
import PlanesAccion from './pages/PlanesAccion'
import ReportesAuditoria from './pages/ReportesAuditoria';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Ruta pública de Login */}
        <Route path="/login" element={<Login />} />

        {/* Rutas con menú lateral */}
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Módulos activos */}
          <Route path="/cuestionario" element={<CuestionarioActivo />} />
          <Route path="/riesgos" element={<PanelRiesgos />} />
          <Route path="/alertas" element={<ConfiguracionAlertas />} />
          <Route path="/planes-accion" element={<PlanesAccion />} />
          <Route path="/reportes-auditoria" element={<ReportesAuditoria />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}