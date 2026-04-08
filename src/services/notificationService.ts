import { supabase } from '@/lib/supabase'

export type NotificationSource = 'jornada' | 'quiz' | 'invasores' | 'global' | 'profile'
export type NotificationType = 'trophy' | 'success' | 'warning' | 'info' | 'system'

export interface Notification {
  id:         string
  user_id:    string
  title:      string
  content:    string | null
  type:       NotificationType
  source?:     NotificationSource
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
      .select('id, user_id, title, message, type, is_read, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)

    const { data: standardRaw, error: stdErr } = await query
    if (stdErr) throw stdErr

    // Mapear colunas do banco para o modelo do frontend
    const standard: Notification[] = (standardRaw || []).map(n => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      content: n.message,
      type: n.type as NotificationType,
      read: n.is_read,
      created_at: n.created_at
    }))

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
      .eq('is_read', false)

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
      .update({ is_read: true })
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
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

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
    // Prepara o objeto para o formato do banco
    const dbData = {
      user_id: data.user_id,
      title: data.title,
      message: data.content,
      type: data.type || 'info',
      is_read: false
    }

    const { data: result, error } = await supabase
      .from('notifications')
      .insert([dbData])
      .select()
      .single()

    if (error) throw error
    
    // Retorna mapeado de volta para o frontend
    return {
      id: result.id,
      user_id: result.user_id,
      title: result.title,
      content: result.message,
      type: result.type,
      read: result.is_read,
      created_at: result.created_at
    }
  },

  /**
   * Envia uma notificação para TODOS os usuários (Global).
   * Operação administrativa.
   */
  async notifyAll(title: string, content: string, type: NotificationType = 'info'): Promise<void> {
    // 1. Busca todos os usuários
    const { data: players, error: plErr } = await supabase
      .from('players')
      .select('id');
    
    if (plErr) throw plErr;
    if (!players || players.length === 0) return;

    // 2. Cria as instâncias de notificação no formato do banco
    const notifications = players.map(p => ({
      user_id: p.id,
      title,
      message: content,
      type,
      is_read: false
    }));

    // 3. Insere em lote
    const { error: insErr } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (insErr) throw insErr;
  }
}
