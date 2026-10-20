// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout'; // ← Ruta corregida
import AdminDashboard from './pages/AdminDashboard';
import OrgManagement from './pages/OrgManagement';
import AppliedSurveys from './pages/AppliedSurveys';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: Login fuera del layout */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS PROTEGIDAS: Dentro del Layout compartido */}
        <Route path="/admin" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="organizacion" element={<OrgManagement />} />
          <Route path="encuestas-aplicadas" element={<AppliedSurveys />} />
        </Route>

        {/* REDIRECCIÓN POR DEFECTO */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;