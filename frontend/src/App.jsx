import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Componentes de Layout y Páginas
import DashboardLayout from './components/DashboardLayout';
import LandingPage from './pages/LandingPage'; // Asegúrate de crear este archivo con el código que te di antes

// Páginas del Admin (Tus pantallas asignadas: 2, 5, 10)
import AdminDashboard from './pages/AdminDashboard';       // Pantalla 2: Dashboard administrativo
import OrgManagement from './pages/OrgManagement';         // Pantalla 5: Gestión de centros de trabajo
import AppliedSurveys from './pages/AppliedSurveys';       // Pantalla 10: Encuestas aplicadas

// Autenticación
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PÚBLICA: Landing Page (La cara del programa) */}
        <Route path="/" element={<LandingPage />} />

        {/* RUTA PÚBLICA: Login */}
        <Route path="/login" element={<Login />} />
        
        {/* RUTAS PROTEGIDAS: Dentro del Layout compartido */}
        <Route path="/admin" element={<DashboardLayout />}>
          {/* Redirección por defecto dentro del admin */}
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          
          {/* Tus pantallas asignadas */}
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="organizacion" element={<OrgManagement />} />
          <Route path="encuestas-aplicadas" element={<AppliedSurveys />} />
        </Route>

        {/* REDIRECCIÓN POR DEFECTO PARA RUTAS DESCONOCIDAS */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App; 