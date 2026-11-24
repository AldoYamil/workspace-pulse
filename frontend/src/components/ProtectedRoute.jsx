import { Navigate, Outlet } from 'react-router-dom';
import { useRol } from '../context/AuthContext';

// Uso:
//   <ProtectedRoute acceso="rh" />       -> Administrador, Gerente y Asistente
//   <ProtectedRoute acceso="gestion" />  -> solo Administrador y Gerente
export default function ProtectedRoute({ acceso = 'rh' }) {
  const { session, rol, cargando, puedeAcceder } = useRol();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Verificando sesión...
      </div>
    );
  }

  // Sin sesión de Supabase
  if (!session) {
    return <Navigate to="/login" replace />;
  }

  // Con sesión, pero el backend no devolvió un rol
  if (!rol) {
    return <Navigate to="/unauthorized" replace />;
  }

  // Con rol, pero sin permiso para esta sección
  if (!puedeAcceder(acceso)) {
    // El rol "usuario" solo contesta encuestas
    return <Navigate to={rol === 'usuario' ? '/encuesta' : '/unauthorized'} replace />;
  }

  return <Outlet />;
}
