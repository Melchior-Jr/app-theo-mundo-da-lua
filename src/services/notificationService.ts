import { supabase } from '@/lib/supabase'

export type NotificationSource = 'jornada' | 'quiz' | 'invasores' | 'global' | 'profile'
export type NotificationType = 'trophy' | 'success' | 'warning' | 'info' | 'system' | 'error'

export interface Notification {
  id:         string
  user_id:    string
  title:      string
  content:    string | null
  type:       NotificationType
  source?:     NotificationSource
  sender_name?: string
  sender_role?: string
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
      .select('id, user_id, title, message, type, is_read, created_at, sender_name, sender_role, category')
      .eq('user_id', userId)

    if (source) {
      query = query.eq('category', source)
    }

    query = query.order('created_at', { ascending: false }).limit(10)

    const { data: standardRaw, error: stdErr } = await query
    if (stdErr) throw stdErr

    // Mapear colunas do banco para o modelo do frontend
    const standard: Notification[] = (standardRaw || []).map(n => ({
      id: n.id,
      user_id: n.user_id,
      title: n.title,
      content: n.message,
      type: n.type as NotificationType,
      source: n.category as NotificationSource, // Mapeia category de volta para source
      read: n.is_read,
      sender_name: n.sender_name,
      sender_role: n.sender_role,
      created_at: n.created_at
    }))

    // 2. Trazendo duelos de volta de forma ULTRA SEGURA
    let challenges: Notification[] = []
    if (!source || source === 'quiz') {
      try {
        // Busca duelos onde o usuário é desafiado (convites pendentes) 
        // ou desafiante (resultados/aceites que ele ainda não viu)
        const { data: all } = await supabase
          .from('quiz_challenges')
          .select('id, created_at, status, stake, challenger_id, challenged_id, challenger_name, challenged_name, quiz_title, challenged_seen, challenger_seen')
          .or(`challenged_id.eq.${userId},challenger_id.eq.${userId}`)
          .order('created_at', { ascending: false })
          .limit(10)

        challenges = (all || []).filter(c => {
          // Se sou o desafiado, mostro se estiver pendente (convite) OU se já terminou e eu não vi o resultado
          if (c.challenged_id === userId && !c.challenged_seen) {
            // Só ignoro se estiver recusado e não for eu que recusei (mas no caso challenged_seen já resolve)
            return true;
          }
          // Se sou o desafiante, mostro se o status mudou (não é mais pending) e eu ainda não vi
          if (c.challenger_id === userId && c.status !== 'pending' && !c.challenger_seen) return true;
          return false;
        }).map(c => {
          const isChallenged = c.challenged_id === userId;
          let title = '⚔️ Duelo!';
          let content = '';

          if (isChallenged && c.status === 'pending') {
            title = '⚔️ Novo Desafio!';
            content = `Você foi desafiado por ${c.challenger_name || 'um astronauta'} para um duelo de ${c.stake} XP!`;
          } else if (c.status === 'completed') {
            title = '🏁 Duelo Finalizado!';
            content = `O duelo em "${c.quiz_title || 'Missão'}" terminou. Veja o resultado!`;
          } else if (c.status === 'declined') {
            title = '❌ Duelo Recusado';
            content = isChallenged ? 'Você recusou este desafio.' : `Seu desafio foi recusado por ${c.challenged_name || 'o oponente'}.`;
          } else if (c.status === 'accepted') {
            title = '✅ Duelo Aceito!';
            content = `Seu desafio foi aceito! Prepare-se para a batalha.`;
          }

          return {
            id: c.id,
            user_id: userId,
            title,
            content: content || `Status do duelo: ${c.status}`,
            type: c.status === 'completed' ? 'success' : (c.status === 'declined' ? 'error' : 'warning'),
            source: 'quiz',
            read: false,
            created_at: c.created_at
          }
        })
      } catch (e) {
        console.warn('Falha segura ao buscar duelos:', e)
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
  async countUnread(userId: string): Promise<number> {
    if (!userId) return 0;
    
    try {
      // 1. Notificações normais não lidas
      const { count: notifCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('is_read', false);

      // 2. Desafios que o usuário ainda não "limpou" da visão dele
      // Caso 1: Alguém me desafiou e eu não vi o convite
      // Caso 2: Eu desafiei alguém, o jogo acabou e eu não vi o resultado
      const { data: challenges } = await supabase
        .from('quiz_challenges')
        .select('id, challenger_id, challenged_id, challenger_seen, challenged_seen, status')
        .or(`challenged_id.eq.${userId},challenger_id.eq.${userId}`);

      const pendingChallenges = (challenges || []).filter(c => {
        if (c.challenged_id === userId && !c.challenged_seen) return true;
        if (c.challenger_id === userId && !c.challenger_seen && c.status !== 'pending') return true;
        return false;
      }).length;

      const total = (notifCount || 0) + pendingChallenges;
      console.log(`📊 [Radar] Contagem Unread para ${userId}: ${total} (Notifs: ${notifCount}, Duels: ${pendingChallenges})`);
      return total;
    } catch (e) {
      console.error('❌ [Radar] Erro ao contar notificações:', e);
      return 0;
    }
  },

  /**
   * Marca uma notificação como lida.
   */
  async markAsRead(id: string, userId: string): Promise<void> {
    console.log('🌌 [Radar] markAsRead iniciado:', id);
    
    try {
      // 1. Atualização paralela em ambas as tabelas (mais seguro que adivinhar)
      await Promise.all([
        supabase.from('notifications').update({ is_read: true }).eq('id', id).eq('user_id', userId),
        supabase.from('quiz_challenges').update({ challenger_seen: true, challenged_seen: true }).eq('id', id).or(`challenger_id.eq.${userId},challenged_id.eq.${userId}`)
      ]);

      // 2. Refresh imediato e obrigatório da contagem
      const newTotal = await this.countUnread(userId);
      window.dispatchEvent(new CustomEvent('notification-updated', { detail: { count: newTotal } }));
      
      console.log('✅ [Radar] markAsRead concluído e sininho notificado.');
    } catch (e) {
      console.error('❌ [Radar] Falha no markAsRead:', e);
      throw e;
    }
  },

  /**
   * Marca todas as notificações de uma fonte (ou geral) como lidas.
   */
  async markAllAsRead(userId: string, source?: NotificationSource): Promise<void> {
    console.log('🌌 [Radar] Operação de Limpeza Galáctica iniciada para:', userId);
    
    try {
      // 1. Disparo imediato de evento local para esconder o sinal visual (Optimistic UI)
      window.dispatchEvent(new CustomEvent('notification-updated', { detail: { count: 0 } }));

      // 2. Limpeza de notificações padrão
      const q = supabase.from('notifications').update({ is_read: true }).eq('user_id', userId);
      // No banco a coluna se chama 'category'
      if (source && source !== 'global') {
        q.eq('category', source);
      }
      const { error: notifError } = await q;
      if (notifError) throw notifError;

      // 3. Limpeza de desafios (Operação absoluta: marca tudo como visto para o usuário)
      const [res1, res2] = await Promise.all([
        supabase.from('quiz_challenges').update({ challenged_seen: true }).eq('challenged_id', userId),
        supabase.from('quiz_challenges').update({ challenger_seen: true }).eq('challenger_id', userId)
      ]);
      
      if (res1.error) console.warn('Aviso na limpeza de desafios (challenged):', res1.error);
      if (res2.error) console.warn('Aviso na limpeza de desafios (challenger):', res2.error);

      console.log('✅ [Radar] Banco de dados sincronizado (Estado Zero).');
    } catch (error) {
      console.error('❌ [Radar] Falha na Sincronização Galáctica:', error);
      // Recarrega contagem real em caso de erro crítico
      const errorCount = await this.countUnread(userId);
      window.dispatchEvent(new CustomEvent('notification-updated', { detail: { count: errorCount } }));
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
      category: data.source || 'global', // Persiste a categoria/source
      sender_name: data.sender_name,
      sender_role: data.sender_role,
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
      source: result.category,
      sender_name: result.sender_name,
      sender_role: result.sender_role,
      read: result.is_read,
      created_at: result.created_at
    }
  },

  /**
   * Envia uma notificação para TODOS os usuários (Global).
   * Operação administrativa.
   */
  async notifyAll(title: string, content: string, type: NotificationType = 'info', senderName?: string, senderRole?: string, category: NotificationSource = 'global'): Promise<void> {
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
      category, // Adicionado suporte a categoria
      sender_name: senderName,
      sender_role: senderRole,
      is_read: false
    }));

    // 3. Insere em lote
    const { error: insErr } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (insErr) throw insErr;
  },

  /**
   * Envia uma notificação para uma lista específica de usuários.
   */
  async notifyMany(userIds: string[], title: string, content: string, type: NotificationType = 'info', senderName?: string, senderRole?: string, category: NotificationSource = 'global'): Promise<void> {
    if (!userIds || userIds.length === 0) return;

    const notifications = userIds.map(id => ({
      user_id: id,
      title,
      message: content,
      type,
      category, // Adicionado suporte a categoria
      sender_name: senderName,
      sender_role: senderRole,
      is_read: false
    }));

    const { error } = await supabase
      .from('notifications')
      .insert(notifications);
    
    if (error) throw error;
  }
}
