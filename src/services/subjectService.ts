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
  created_at: string;
}

export const SubjectService = {
  /**
   * Lista todas as matérias publicadas ou em breve
   * Se includeDrafts for falso, filtra apenas publicadas e em breve
   */
  async listAll(includeDrafts = false): Promise<Subject[]> {
    let query = supabase
      .from('app_subjects')
      .select('*')
      .order('order_index', { ascending: true });

    if (!includeDrafts) {
      query = query.neq('status', 'draft');
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
