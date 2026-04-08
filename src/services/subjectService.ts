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
   */
  async listAll(): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('app_subjects')
      .select('*')
      .order('order_index', { ascending: true });

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
