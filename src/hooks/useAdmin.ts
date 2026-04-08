import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook para gerenciar o acesso administrativo.
 * Verifica se o usuário logado possui e-mail autorizado na tabela admin_config.
 */
export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdminStatus() {
      if (authLoading) return;
      
      if (!user?.email) {
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('admin_config')
          .select('value')
          .eq('key', 'authorized_emails')
          .single();

        if (error) throw error;

        const authorizedEmails: string[] = (data.value as string[]).map(e => e.toLowerCase());
        setIsAdmin(authorizedEmails.includes(user.email.toLowerCase()));
      } catch (err) {
        console.error('Erro ao verificar status de admin:', err);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    }

    checkAdminStatus();
  }, [user, authLoading]);

  return { isAdmin, loading };
}
