import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

/**
 * Hook para gerenciar o acesso de professores.
 * Regra: Administrador Master ou usuários com 'is_teacher' true no banco.
 */
export function useTeacher() {
  const { user, loading: authLoading } = useAuth();
  const [isTeacher, setIsTeacher] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkTeacherStatus() {
      if (authLoading) return;
      
      if (!user?.id) {
        setIsTeacher(false);
        setLoading(false);
        return;
      }

      // Regra 1: Administrador Master sempre tem acesso
      const MASTER_ADMIN_EMAIL = 'jamelchior72@gmail.com';
      if (user.email?.toLowerCase() === MASTER_ADMIN_EMAIL.toLowerCase()) {
        setIsTeacher(true);
        setLoading(false);
        return;
      }

      // Regra 2: Verificar no banco se o usuário é professor
      try {
        const { data, error } = await supabase
          .from('players')
          .select('is_teacher')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Erro ao verificar status de professor:', error);
          setIsTeacher(false);
        } else {
          setIsTeacher(!!data?.is_teacher);
        }
      } catch (err) {
        setIsTeacher(false);
      } finally {
        setLoading(false);
      }
    }

    checkTeacherStatus();
  }, [user, authLoading]);

  return { isTeacher, loading };
}
