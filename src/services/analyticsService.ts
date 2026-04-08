import { supabase } from '@/lib/supabase'
import { QuestionEvent, PedagogicalStats } from '@/components/InvasoresGame/types'

export const AnalyticsService = {
  /**
   * Registra um evento de resposta de pergunta no banco de dados
   */
  async logQuestionEvent(event: QuestionEvent) {
    try {
      const { error } = await supabase
        .from('game_pedagogical_logs')
        .insert({
          user_id: event.user_id,
          game_slug: event.game_slug,
          chapter_id: event.chapter_id,
          question_id: event.question_id,
          choice_text: event.choice_text,
          is_correct: event.is_correct,
          response_time_ms: event.response_time_ms,
          difficulty: event.difficulty,
          created_at: new Date().toISOString()
        })

      if (error) throw error
    } catch (err) {
      console.error('[AnalyticsService] Erro ao registrar evento:', err)
    }
  },

  /**
   * Retorna estatísticas pedagógicas resumidas para um jogador
   */
  async getPlayerStats(userId: string): Promise<PedagogicalStats | null> {
    try {
      const { data, error } = await supabase
        .from('game_pedagogical_logs')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      if (!data || data.length === 0) return null

      const total = data.length
      const correct = data.filter(d => d.is_correct).length
      const avgTime = data.reduce((acc, curr) => acc + curr.response_time_ms, 0) / total

      // Agrupar categorias masterizadas (ex: mais de 80% de acerto em pelo menos 3 perguntas)
      // Esta lógica seria enriquecida com joins se necessário
      
      return {
        accuracy_rate: (correct / total) * 100,
        avg_response_time: avgTime,
        total_questions: total,
        mastered_categories: [] // Lógica simplificada para o MVP
      }
    } catch (err) {
      console.error('[AnalyticsService] Erro ao buscar stats:', err)
      return null
    }
  },

  /**
   * Retorna a taxa de acerto por pergunta (Global)
   */
  async getQuestionAccuracy() {
    try {
      const { data, error } = await supabase
        .from('game_pedagogical_logs')
        .select('question_id, is_correct')

      if (error) throw error
      
      const stats: Record<string, { total: number, correct: number }> = {}
      data.forEach(d => {
        if (!stats[d.question_id]) stats[d.question_id] = { total: 0, correct: 0 }
        stats[d.question_id].total++
        if (d.is_correct) stats[d.question_id].correct++
      })

      return Object.entries(stats).map(([id, s]) => ({
        question_id: id,
        accuracy: (s.correct / s.total) * 100,
        total_attempts: s.total
      }))
    } catch (err) {
      console.error('[AnalyticsService] Erro ao buscar acurácia:', err)
      return []
    }
  },

  /**
   * Retorna um mapa de calor de dificuldade baseado em erros
   */
  async getDifficultyHeatmap() {
    try {
      const { data, error } = await supabase
        .from('game_pedagogical_logs')
        .select('chapter_id, difficulty, is_correct')
      
      if (error) throw error

      const heatmap: Record<string, { hits: number, misses: number }> = {}
      
      data.forEach(d => {
        const key = `Chapter ${d.chapter_id} - ${d.difficulty}`
        if (!heatmap[key]) heatmap[key] = { hits: 0, misses: 0 }
        if (d.is_correct) heatmap[key].hits++
        else heatmap[key].misses++
      })

      return heatmap
    } catch (err) {
      console.error('[AnalyticsService] Erro no heatmap:', err)
      return {}
    }
  }
}
