import { supabase } from '@/lib/supabase';

export interface Subject {
  id: string;
  name: string;
  slug: string;
  icon: string;
  theme_color: string;
  description: string;
  order_index: number;
  status: 'draft' | 'published' | 'coming_soon';
  tester_ids?: string[];
  created_at: string;
}

export const SubjectService = {
  /**
   * Lista todas as matérias publicadas ou em breve
   * Se includeDrafts for falso, filtra apenas publicadas e em breve
   */
  async listAll(includeAllDrafts = false, userId?: string): Promise<Subject[]> {
    let query = supabase
      .from('app_subjects')
      .select('*')
      .order('order_index', { ascending: true });

    if (!includeAllDrafts) {
      if (userId) {
        // Mostra publicados/em_breve OU rascunhos onde o usuário está no array tester_ids
        query = query.or(`status.neq.draft,tester_ids.cs.{"${userId}"}`);
      } else {
        // Usuário não logado: esconde todos os rascunhos
        query = query.neq('status', 'draft');
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  /**
   * Busca uma matéria específica pelo slug
   */
  async getBySlug(slug: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('app_subjects')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) return null;
    return data;
  }
};
