import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para gerenciar o acesso administrativo.
 * Regra: Apenas o Administrador Master (jamelchior72@gmail.com) tem acesso ao painel de /admin.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function checkAdminStatus() {
      if (authLoading) return;
      
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // Regra de Negócio: Administrador Master Único
      const MASTER_ADMIN_EMAIL = 'jamelchior72@gmail.com';
      const isMaster = user.email.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase();
      
      setIsAdmin(isMaster);
      setLoading(false);
    }

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
