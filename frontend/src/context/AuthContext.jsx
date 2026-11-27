import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import api from '../api/axios';


export const ACCESOS = {
  administrador: ['gestion', 'rh', 'encuestas'],
  gerente_rh: ['gestion', 'rh', 'encuestas'],
  asistente_rh: ['rh', 'encuestas'],
  usuario: ['encuestas'],
};

export const ETIQUETAS_ROL = {
  administrador: 'Administrador',
  gerente_rh: 'Gerente RH',
  asistente_rh: 'Asistente RH',
  usuario: 'Usuario',
};

export const INICIALES_ROL = {
  administrador: 'AD',
  gerente_rh: 'GR',
  asistente_rh: 'AR',
  usuario: 'US',
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [rol, setRol] = useState(null);
  const [estadoRol, setEstadoRol] = useState('idle'); // idle | cargando | listo | error

  useEffect(() => {
    if (!supabase) {
      setCargandoSesion(false);
      return undefined;
    }

    let activo = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!activo) return;
      setSession(data.session);
      setCargandoSesion(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_evento, nuevaSesion) => {
      setSession(nuevaSesion);
    });

    return () => {
      activo = false;
      subscription.unsubscribe();
    };
  }, []);

  const userId = session?.user?.id;

  useEffect(() => {
    if (!userId) {
      setRol(null);
      setEstadoRol('idle');
      return undefined;
    }

    let activo = true;
    setEstadoRol('cargando');

    api
      .get('me/')
      .then((res) => {
        if (!activo) return;
        setRol(res.data.rol);
        setEstadoRol('listo');
      })
      .catch((err) => {
        if (!activo) return;
        console.error('No se pudo obtener el rol del usuario:', err);
        setRol(null);
        setEstadoRol('error');
      });

    return () => {
      activo = false;
    };
  }, [userId]);

  const cargando =
    cargandoSesion ||
    (Boolean(userId) && estadoRol !== 'listo' && estadoRol !== 'error');

  const puedeAcceder = (acceso) => (ACCESOS[rol] ?? []).includes(acceso);

  return (
    <AuthContext.Provider value={{ session, rol, cargando, puedeAcceder }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useRol() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useRol debe usarse dentro de <AuthProvider>');
  }
  return ctx;
}
