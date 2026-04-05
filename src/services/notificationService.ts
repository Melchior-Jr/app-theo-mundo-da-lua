import { supabase } from '@/lib/supabase'

export type NotificationSource = 'jornada' | 'quiz' | 'invasores' | 'global' | 'profile'
export type NotificationType = 'trophy' | 'success' | 'warning' | 'info' | 'system'

export interface Notification {
  id:         string
  user_id:    string
  title:      string
  content:    string | null
  type:       NotificationType
  source:     NotificationSource
  read:       boolean
  created_at: string
}

export const NotificationService = {
  /**
   * Busca todas as notificações de um usuário.
   * Pode ser filtrada por source ('jornada', 'quiz', etc).
   * No modo global (sem source), agrega também desafios do Quiz.
   */
  async fetch(userId: string, source?: NotificationSource): Promise<Notification[]> {
    // 1. Busca notificações da tabela padrão
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    if (source) query = query.eq('source', source)
    const { data: standard, error: stdErr } = await query
    if (stdErr) throw stdErr

    // 2. Se for global ou quiz, busca também da 'quiz_challenges'
    let challenges: Notification[] = []
    if (!source || source === 'quiz') {
      try {
        // A - Convites pendentes (eu sou o desafiado)
        const { data: pending } = await supabase
          .from('quiz_challenges')
          .select('*, challenger:players!challenger_id(full_name, username)')
          .eq('challenged_id', userId)
          .eq('status', 'pending')

        // B - Resultados não vistos (eu sou o desafiante)
        const { data: results } = await supabase
          .from('quiz_challenges')
          .select('*, opponent:players!challenged_id(full_name, username)')
          .eq('challenger_id', userId)
          .eq('status', 'completed')
          .eq('challenger_seen', false)

        const all = [...(pending || []), ...(results || [])]
        challenges = all.map(c => ({
          id: c.id,
          user_id: userId,
          title: c.status === 'pending' ? '⚔️ Novo Duelo!' : '🏁 Resultado de Duelo',
          content: c.status === 'pending' 
            ? `${c.challenger?.full_name || c.challenger?.username} te desafiou para um duelo de ${c.stake} XP!`
            : `Duelo finalizado contra ${c.opponent?.full_name}! Placar: ${c.challenger_score}x${c.challenged_score}.`,
          type: c.status === 'pending' ? 'warning' : (c.challenger_score > c.challenged_score ? 'success' : 'info'),
          source: 'quiz',
          read: false,
          created_at: c.created_at
        }))
      } catch (e) {
        console.error('Falha ao buscar desafios agregados:', e)
      }
    }

    const merged = [...(standard || []), ...challenges]
      .sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 20)

    return merged
  },

  /**
   * Conta notificações não lidas.
   */
  async countUnread(userId: string, source?: NotificationSource): Promise<number> {
    // 1. Contagem padrão
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (source) query = query.eq('source', source)
    const { count: stdCount, error: stdErr } = await query
    if (stdErr) throw stdErr

    let qCount = 0
    if (!source || source === 'quiz') {
      const { count: pending } = await supabase
        .from('quiz_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('challenged_id', userId)
        .eq('status', 'pending')
      
      const { count: results } = await supabase
        .from('quiz_challenges')
        .select('*', { count: 'exact', head: true })
        .eq('challenger_id', userId)
        .eq('status', 'completed')
        .eq('challenger_seen', false)
      
      qCount = (pending || 0) + (results || 0)
    }

    return (stdCount || 0) + qCount
  },

  /**
   * Marca uma notificação como lida.
   * Agora lida com IDs das tabelas notifications e quiz_challenges.
   */
  async markAsRead(id: string): Promise<void> {
    // 1. Tenta na tabela padrão
    const { data } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id)
      .select('id')
    
    // Se não encontrou nada na tabela padrão, tenta na quiz_challenges
    if (!data || data.length === 0) {
       await supabase
        .from('quiz_challenges')
        .update({ challenger_seen: true })
        .eq('id', id)
    }
  },

  /**
   * Marca todas as notificações de uma fonte (ou geral) como lidas.
   */
  async markAllAsRead(userId: string, source?: NotificationSource): Promise<void> {
    // 1. Marca na tabela padrão
    let query = supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false)

    if (source) query = query.eq('source', source)
    await query

    // 2. Marca na quiz_challenges se for global ou quiz
    if (!source || source === 'quiz') {
      await supabase
        .from('quiz_challenges')
        .update({ challenger_seen: true })
        .eq('challenger_id', userId)
        .eq('status', 'completed')
        .eq('challenger_seen', false)
    }
  },

  /**
   * Envia uma nova notificação (útil para eventos manuais na UI).
   */
  async notify(data: Partial<Notification>): Promise<Notification> {
    const { data: result, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single()

    if (error) throw error
    return result
  }
}
