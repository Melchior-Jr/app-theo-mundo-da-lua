import { supabase } from '@/lib/supabase';

export interface DBChapter {
  id: string;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  color: string;
  color_dim: string;
  color_bg: string;
  path: string;
  intro: string;
  fun_fact: string;
  xp_award: number;
  status: 'draft' | 'published' | 'hidden';
  is_coming_soon: boolean;
}

export interface DBMission {
  id: string;
  chapter_id: string;
  description: string;
  xp: number;
  category: string;
}

export const ChapterService = {
  /** Busca capítulos filtrados por matéria (opcional) */
  async getBySubject(subjectId?: string) {
    let query = supabase
      .from('app_chapters')
      .select('*')
      .order('order', { ascending: true });
    
    if (subjectId) {
      query = query.eq('subject_id', subjectId);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    return data as DBChapter[];
  },

  /** Alias para manter compatibilidade mas incentivando o uso do filtro */
  async getAll() {
    return this.getBySubject();
  },

  /** Atualiza um capítulo */
  async update(id: string, updates: Partial<DBChapter>) {
    const { data, error } = await supabase
      .from('app_chapters')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as DBChapter;
  },

  /** Busca missões de um capítulo */
  async getMissions(chapterId: string) {
    const { data, error } = await supabase
      .from('app_missions')
      .select('*')
      .eq('chapter_id', chapterId);
    
    if (error) throw error;
    return data as DBMission[];
  },

  /** Atualiza status de um capítulo rapidamente */
  async setStatus(id: string, status: DBChapter['status']) {
    return this.update(id, { status });
  }
};
