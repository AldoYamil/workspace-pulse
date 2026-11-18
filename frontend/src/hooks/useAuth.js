// src/hooks/useAuth.js
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient'; // Ajusta la ruta a tu cliente de Supabase

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [empresaId, setEmpresaId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        const { data: { user: authUser }, error } = await supabase.auth.getUser();

        if (error || !authUser) {
          setUser(null);
          setEmpresaId(null);
          return;
        }

        setUser(authUser);

        let empId = authUser.user_metadata?.empresa_id;

        if (!empId) {
          const { data: profile } = await supabase
            .from('usuario')
            .select('empresa_id, centro_trabajo(empresa_id)')
            .eq('email', authUser.email)
            .single();

          empId = profile?.empresa_id || profile?.centro_trabajo?.empresa_id || 1;
        }

        setEmpresaId(empId);
      } catch (err) {
        console.error("Error al obtener sesión de Supabase:", err);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, []);

  return { user, empresaId, loading };
};