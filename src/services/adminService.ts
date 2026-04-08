import { supabase } from '@/lib/supabase';

export interface AdminStats {
  totalPlayers: number;
  activePlayers: number;
  inactivePlayers: number;
  newUsersWeek: number;
  newUsersWeekTrend: number;
  totalXP: number;
  totalXPTrend: number;
  averageAccuracy: number;
  averageAccuracyTrend: number;
  averageProgress: number;
  atRiskCount: number;
  absentCount: number;
  recentActivity: { id: string | number; title: string; user: string; time: string }[];
  popularChapters: { title: string; views: string; completion: string; status: string }[];
  topErrorThemes: { title: string; errorRate: number }[];
  topPlayers: { name: string; xp: number; accuracy: number }[];
}

export const AdminService = {
  /** Busca estatísticas gerais para o dashboard */
  async getDashboardStats(): Promise<AdminStats> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    // 1. Contagem Básica de Alunos e Status (Campos verificados: full_name, username, last_login)
    const { data: playersData, error: pError } = await supabase
      .from('players')
      .select('id, full_name, username, last_login, created_at');
    
    if (pError) console.error('Erro ao buscar players:', pError);
    
    const totalPlayers = playersData?.length || 0;
    
    // Identificar jogadores ativos olhando last_login OU atividade recente nos logs (últimos 7 dias)
    const { data: recentExpo } = await supabase.from('player_exploration_logs').select('player_id').gte('created_at', sevenDaysAgo.toISOString());
    const { data: recentGame } = await supabase.from('game_pedagogical_logs').select('user_id').gte('created_at', sevenDaysAgo.toISOString());
    
    const activeIdsFromLogs = new Set([
      ...(recentExpo?.map(l => l.player_id) || []),
      ...(recentGame?.map(l => l.user_id) || [])
    ]);

    const activePlayers = playersData?.filter(p => {
      const hasRecentLogin = p.last_login && new Date(p.last_login) >= sevenDaysAgo;
      const hasRecentActivity = activeIdsFromLogs.has(p.id);
      return hasRecentLogin || hasRecentActivity;
    }).length || 0;
    
    const inactivePlayers = totalPlayers - activePlayers;
    const absentCount = playersData?.filter(p => !p.last_login || new Date(p.last_login) < sevenDaysAgo).length || 0;

    // 2. Novos usuários na semana vs semana anterior
    const newUsersWeek = playersData?.filter(p => new Date(p.created_at) >= sevenDaysAgo).length || 0;
    const newUsersPrevWeek = playersData?.filter(p => new Date(p.created_at) >= fourteenDaysAgo && new Date(p.created_at) < sevenDaysAgo).length || 0;
    const newUsersWeekTrend = newUsersPrevWeek > 0 ? Math.round(((newUsersWeek - newUsersPrevWeek) / newUsersPrevWeek) * 100) : (newUsersWeek > 0 ? 100 : 0);

    // 3. XP e Trending
    const { data: xpData, error: xpError } = await supabase
      .from('player_global_stats')
      .select('player_id, galactic_xp, updated_at');
    
    if (xpError) console.error('Erro ao buscar XP:', xpError);
    
    const totalXP = xpData?.reduce((acc, curr) => acc + (curr.galactic_xp || 0), 0) || 0;
    const xpLastWeek = xpData?.filter(d => new Date(d.updated_at) >= sevenDaysAgo).reduce((acc, curr) => acc + (curr.galactic_xp || 0), 0) || 0;
    const xpTrend = totalXP > 0 ? Math.round((xpLastWeek / totalXP) * 100) : 0;

    // 4. Pedagógico Profundo
    let pedagogicalStats;
    try {
      pedagogicalStats = await this.getPedagogicalStats();
    } catch (e) {
      console.error('Erro em getPedagogicalStats:', e);
      pedagogicalStats = {
        globalAccuracy: '0%',
        learningCurve: { improvement: 0 },
        performanceByTopic: [],
        pedagogicalRisk: '0%'
      } as any;
    }
    
    const averageAccuracy = parseInt(pedagogicalStats.globalAccuracy.replace('%', ''));
    const accuracyTrend = pedagogicalStats.learningCurve?.improvement || 0;

    // 5. Progresso Médio da Turma
    let averageProgress = 0;
    try {
      const { data: progressAll } = await supabase.from('player_chapter_progress').select('player_id, status');
      const { count: totalChaptersPossible } = await supabase.from('app_subjects').select('*', { count: 'exact', head: true });
      
      const possibleTotal = totalPlayers * (totalChaptersPossible || 10);
      const completedTotal = progressAll?.filter(p => p.status === 'completed').length || 0;
      averageProgress = possibleTotal > 0 ? Math.round((completedTotal / possibleTotal) * 100) : 0;
    } catch (e) {
      console.error('Erro ao calcular progresso:', e);
    }

    // 6. Alunos com Dificuldade (Risco Pedagógico)
    const riskPct = parseInt(pedagogicalStats.pedagogicalRisk?.replace('%', '') || '0');
    const atRiskCount = Math.round(riskPct * totalPlayers / 100);

    // 7. Rankings e Atividades Unificadas (Exploração + Games)
    const topPlayers = playersData?.map(p => {
      const pXP = xpData?.find(x => x.player_id === p.id)?.galactic_xp || 0;
      return { 
        name: p.username || p.full_name || 'Astronauta', 
        xp: pXP, 
        accuracy: 0 
      };
    }).sort((a, b) => b.xp - a.xp).slice(0, 3) || [];

    // Busca de logs de exploração
    const { data: expoLogs } = await supabase
      .from('player_exploration_logs')
      .select('id, created_at, exploration_id, player_id')
      .order('created_at', { ascending: false })
      .limit(10);

    // Busca de logs de sessões de jogos (Quizzes e Mini-games)
    const { data: quizSessions } = await supabase
      .from('game_sessions')
      .select('id, played_at, game_id, score, player_id')
      .order('played_at', { ascending: false })
      .limit(15);

    // Unificar e formatar
    const unifiedLogs = [
      ...(expoLogs?.map(log => ({
        id: `expo-${log.id}`,
        created_at: log.created_at,
        title: `Explorou Capítulo: ${log.exploration_id}`,
        player_id: log.player_id
      })) || []),
      ...(quizSessions?.map(log => ({
        id: `quiz-${log.id}`,
        created_at: log.played_at,
        title: `Finalizou Quiz/Jogo (Score: ${log.score})`,
        player_id: log.player_id
      })) || [])
    ].sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
     .slice(0, 15);

    const recentActivity = unifiedLogs.map(log => {
      const player = playersData?.find(p => p.id === log.player_id);
      return {
        id: log.id,
        title: log.title,
        user: player?.username || player?.full_name || 'Astronauta',
        time: this.formatTimeAgo(new Date(log.created_at))
      };
    });

    const popularChapters = pedagogicalStats.performanceByTopic.slice(0, 3).map((t: any) => ({
      title: t.label,
      views: '---',
      completion: `${t.pct}%`,
      status: 'Publicado'
    }));

    const topErrorThemes = pedagogicalStats.performanceByTopic
      .filter((t: any) => t.pct > 0)
      .sort((a: any, b: any) => a.pct - b.pct)
      .slice(0, 3)
      .map((t: any) => ({ title: t.label, errorRate: 100 - t.pct }));

    return {
      totalPlayers,
      activePlayers,
      inactivePlayers,
      newUsersWeek,
      newUsersWeekTrend,
      totalXP,
      totalXPTrend: xpTrend,
      averageAccuracy,
      averageAccuracyTrend: accuracyTrend,
      averageProgress,
      atRiskCount,
      absentCount,
      recentActivity,
      popularChapters,
      topErrorThemes,
      topPlayers
    };
  },

  /** Helper para formatar tempo relativo em Português */
  formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diff < 60) return 'agora mesmo';
    if (diff < 3600) return `${Math.floor(diff / 60)}m atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  },

  /** Helper para formatar números grandes (ex: 1.2k) */
  formatNumber(num: number): string {
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
  },

  /** Busca lista de alunos com união manual para evitar erros de relacionamento */
  async getPlayersList() {
    // 1. Busca os dados básicos dos jogadores
    const { data: players, error: pError } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (pError) throw pError;
    if (!players) return [];

    // 2. Busca as estatísticas em paralelo
    const [statsRes, progressRes, trophiesRes] = await Promise.all([
      supabase.from('player_global_stats').select('*'),
      supabase.from('player_chapter_progress').select('player_id'),
      supabase.from('user_trophies').select('user_id')
    ]);

    // 3. Une os dados no código (Manual Join)
    return players.map(p => {
      const pStats = statsRes.data?.find(s => s.player_id === p.id);
      
      // Conta ocorrências manualmente para progresso e troféus
      const chapterCount = progressRes.data?.filter(pr => pr.player_id === p.id).length || 0;
      const trophyCount = trophiesRes.data?.filter(t => t.user_id === p.id).length || 0;

      return {
        ...p,
        player_global_stats: pStats ? { 
          galactic_xp: pStats.galactic_xp, 
          level: pStats.level 
        } : { galactic_xp: 0, level: 1 },
        player_chapter_progress: { count: chapterCount },
        user_trophies: { count: trophyCount }
      };
    });
  },

  /** Busca dossiê completo de um único usuário com inteligência de dados */
  async getUserDetails(playerId: string) {
    const [profile, stats, progress, logs, trophies, games, totalSubjects] = await Promise.all([
      supabase.from('players').select('*').eq('id', playerId).single(),
      supabase.from('player_global_stats').select('*').eq('player_id', playerId).single(),
      supabase.from('player_chapter_progress').select('*').eq('player_id', playerId),
      supabase.from('player_exploration_logs').select('*').eq('player_id', playerId).order('created_at', { ascending: false }),
      supabase.from('user_trophies').select('*').eq('user_id', playerId),
      supabase.from('game_sessions').select('*').eq('player_id', playerId).order('played_at', { ascending: false }),
      supabase.from('app_subjects').select('*', { count: 'exact', head: true })
    ]);

    // Cálculo de Duração Média (Baseado em metadados de sessões)
    const durations = games.data?.map(s => s.metadata?.duration || 0).filter(d => d > 0) || [];
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length / 60) 
      : 0;

    // Insights Pedagógicos Dinâmicos
    const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253';
    const quizSessions = games.data?.filter(s => s.game_id === QUIZ_GAME_ID) || [];
    
    // Tópicos com erros frequentes (Analisando o log de questões de cada sessão)
    const topicErrors: Record<string, number> = {};
    quizSessions.forEach(session => {
      const qLog = session.metadata?.questions_log || [];
      qLog.forEach((q: any) => {
        if (!q.isCorrect) {
          const topic = q.topic || 'Conhecimentos Gerais';
          topicErrors[topic] = (topicErrors[topic] || 0) + 1;
        }
      });
    });

    const topDifficulties = Object.entries(topicErrors)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([topic]) => topic);

    return {
      profile: profile.data,
      stats: stats.data,
      progress: progress.data || [],
      logs: logs.data || [],
      trophies: trophies.data || [],
      games: games.data || [],
      insights: {
        avgDurationMinutes: avgDuration || 12, // Fallback amigável se não houver dados de tempo
        topDifficulties: topDifficulties.length > 0 ? topDifficulties : null,
        totalChaptersAvailable: totalSubjects.count || 10
      }
    };
  },

  /** Ações de Gestão */
  async resetPlayerProgress(playerId: string) {
    await Promise.all([
      // 1. Limpar progresso nos capítulos e exploração
      supabase.from('player_chapter_progress').delete().eq('player_id', playerId),
      supabase.from('player_exploration_logs').delete().eq('player_id', playerId),
      
      // 2. Limpar estatísticas e sessões de jogos (mini-games e quizes)
      supabase.from('player_game_stats').delete().eq('player_id', playerId),
      supabase.from('game_sessions').delete().eq('player_id', playerId),
      
      // 3. Limpar conquistas, troféus e notificações
      supabase.from('user_trophies').delete().eq('user_id', playerId),
      supabase.from('notifications').delete().eq('user_id', playerId),
      
      // 4. Resetar estatísticas globais para o valor inicial
      supabase.from('player_global_stats').update({ 
        galactic_xp: 0, 
        level: 1,
        updated_at: new Date().toISOString()
      }).eq('player_id', playerId)
    ]);
  },

  async togglePlayerLock(playerId: string, isLocked: boolean) {
    const { error } = await supabase
      .from('players')
      .update({ is_locked: isLocked })
      .eq('id', playerId);
    if (error) throw error;
  },

  async awardManualTrophy(playerId: string, trophyId: string) {
    const { error } = await supabase
      .from('user_trophies')
      .upsert({
        user_id: playerId,
        trophy_id: trophyId,
        unlocked: true,
        unlocked_at: new Date().toISOString()
      });
    if (error) throw error;
  },

  /** CRUD de Matérias */
  async getSubjects() {
    const { data, error } = await supabase
      .from('app_subjects')
      .select('*')
      .order('order_index', { ascending: true });
    if (error) throw error;
    return data;
  },

  async upsertSubject(subject: any) {
    const { data, error } = await supabase
      .from('app_subjects')
      .upsert(subject)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async deleteSubject(id: string) {
    const { error } = await supabase
      .from('app_subjects')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async updateEducatorNotes(playerId: string, notes: string) {
    const { error } = await supabase
      .from('players')
      .update({ educator_notes: notes })
      .eq('id', playerId);
    if (error) throw error;
  },

  async sendPlayerNotification(playerId: string, title: string, content: string) {
    const { error } = await supabase
      .from('notifications')
      .insert([{
        user_id: playerId,
        title,
        message: content,
        type: 'system',
        is_read: false
      }]);
    if (error) throw error;
  },

  async getPedagogicalStats() {
    // 1. Fetch data from sessions (where most pedagogical meta is stored)
    const { data: sessions, error: sessErr } = await supabase
      .from('game_sessions')
      .select('*')
      .order('played_at', { ascending: false });

    if (sessErr) throw sessErr;

    // 2. Topic Mapping
    const topicMap: Record<number, string> = {
      1: 'Sistema Solar',
      2: 'Planetas',
      3: 'Terra e Movimentos',
      4: 'Lua e Fases',
      5: 'Constelações'
    };

    const topicStats: Record<string, { totalCorrect: number, totalQuestions: number, sessions: number }> = {};
    Object.values(topicMap).forEach(name => {
      topicStats[name] = { totalCorrect: 0, totalQuestions: 0, sessions: 0 };
    });

    let globalCorrect = 0;
    let globalQuestions = 0;
    const playersAccuracy: Record<string, { correct: number, total: number }> = {};
    const timelineData: Record<string, { correct: number, total: number }> = {};

    // Get last 7 date strings
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      timelineData[d.toISOString().split('T')[0]] = { correct: 0, total: 0 };
    }

    // Process sessions and their metadata logs
    sessions.forEach(session => {
      const topicName = topicMap[session.metadata?.level] || 'Outros';
      const logs = session.metadata?.questions_log || [];
      
      logs.forEach((log: any) => {
        const correct = log.isCorrect ? 1 : 0;
        const total = 1;

        if (!topicStats[topicName]) {
          topicStats[topicName] = { totalCorrect: 0, totalQuestions: 0, sessions: 0 };
        }
        topicStats[topicName].totalCorrect += correct;
        topicStats[topicName].totalQuestions += total;
        
        globalCorrect += correct;
        globalQuestions += total;

        const dateKey = new Date(session.played_at).toISOString().split('T')[0];
        if (timelineData[dateKey]) {
          timelineData[dateKey].correct += correct;
          timelineData[dateKey].total += total;
        }

        if (session.player_id) {
          if (!playersAccuracy[session.player_id]) playersAccuracy[session.player_id] = { correct: 0, total: 0 };
          playersAccuracy[session.player_id].correct += correct;
          playersAccuracy[session.player_id].total += total;
        }
      });

      topicStats[topicName].sessions += 1;
    });

    const performanceByTopic = Object.entries(topicStats).map(([name, stats]) => ({
      label: name,
      pct: stats.totalQuestions > 0 ? Math.round((stats.totalCorrect / stats.totalQuestions) * 100) : 0,
      color: (stats.totalCorrect / stats.totalQuestions) > 0.8 ? '#10b981' : 
             (stats.totalCorrect / stats.totalQuestions) > 0.6 ? '#3b82f6' : 
             (stats.totalCorrect / stats.totalQuestions) > 0.4 ? '#f59e0b' : '#ef4444'
    }));

    const globalAccuracy = globalQuestions > 0 ? Math.round((globalCorrect / globalQuestions) * 100) : 0;
    
    // 3. Advanced Analysis: Questions & Response Time
    const questionsStats: Record<string, { total: number, correct: number, totalTime: number }> = {};
    let abandonedQuizzes = 0;
    const playerFirstAttempts: Record<string, Record<string, boolean>> = {}; // {playerId: {challengeKey: true}}
    let firstAttemptCorrect = 0;
    let subsequentAttemptCorrect = 0;
    let firstAttemptCount = 0;
    let subsequentAttemptCount = 0;

    sessions?.forEach(session => {
      const challengeKey = `L${session.metadata?.level}C${session.metadata?.challenge}`;
      const pid = session.player_id;

      if (!session.completed) {
        abandonedQuizzes++;
      }

      // First vs Subsequent Attempt Logic
      if (pid) {
        if (!playerFirstAttempts[pid]) playerFirstAttempts[pid] = {};
        const isFirst = !playerFirstAttempts[pid][challengeKey];
        playerFirstAttempts[pid][challengeKey] = true;

        const correctNum = session.metadata?.correct_count || 0;
        const totalNum = session.metadata?.total_questions || 5;

        if (isFirst) {
          firstAttemptCorrect += correctNum;
          firstAttemptCount += totalNum;
        } else {
          subsequentAttemptCorrect += correctNum;
          subsequentAttemptCount += totalNum;
        }
      }

      const logs = session.metadata?.questions_log || [];
      logs.forEach((log: any) => {
        const qid = log.questionId;
        if (!questionsStats[qid]) {
          questionsStats[qid] = { total: 0, correct: 0, totalTime: 0 };
        }
        questionsStats[qid].total++;
        if (log.isCorrect) questionsStats[qid].correct++;
        questionsStats[qid].totalTime += log.timeSpent || 0;
      });
    });

    // Identifying Villain Questions (Top 3 error rates)
    const villainQuestions = Object.entries(questionsStats)
      .map(([id, s]) => ({
        id,
        errorRate: Math.round(((s.total - s.correct) / s.total) * 100),
        avgTime: Math.round(s.totalTime / s.total),
        totalAttempts: s.total
      }))
      .filter(q => q.totalAttempts > 2) // Minimum data
      .sort((a, b) => b.errorRate - a.errorRate)
      .slice(0, 3);

    // Learning Curve (First vs Second)
    const firstAcc = firstAttemptCount > 0 ? Math.round((firstAttemptCorrect / firstAttemptCount) * 100) : 0;
    const subAcc = subsequentAttemptCount > 0 ? Math.round((subsequentAttemptCorrect / subsequentAttemptCount) * 100) : 0;

    // Pedagogical Risk: % players with accuracy < 60%
    const lowAccuracyPlayers = Object.values(playersAccuracy).filter(p => (p.correct / p.total) < 0.6).length;
    const totalActivePlayers = Object.keys(playersAccuracy).length;
    const pedagogicalRisk = totalActivePlayers > 0 ? Math.round((lowAccuracyPlayers / totalActivePlayers) * 100) : 0;

    // Identify alert zones
    const alertZones = performanceByTopic
      .filter(t => t.pct > 0 && t.pct < 60)
      .map(t => ({
        title: `Dificuldade em '${t.label}'`,
        description: `${t.pct}% de aproveitamento médio da turma. Considere revisar este conteúdo.`,
        type: 'error'
      }));

    // Add Abandonment Alert
    if (sessions && sessions.length > 5 && abandonedQuizzes / sessions.length > 0.25) {
      alertZones.push({
        title: 'Alta Taxa de Abandono',
        description: `${Math.round((abandonedQuizzes / (sessions?.length || 1)) * 100)}% dos quizes não são finalizados.`,
        type: 'error'
      });
    }

    if (alertZones.length === 0) {
      alertZones.push({
        title: 'Desempenho Estável',
        description: 'Nenhum tópico crítico identificado até o momento.',
        type: 'success'
      });
    }

    return {
      globalAccuracy: `${globalAccuracy}%`,
      totalQuizzes: (sessions?.length || 0).toLocaleString(),
      pedagogicalRisk: `${pedagogicalRisk}%`,
      abandonmentRate: `${Math.round((abandonedQuizzes / (sessions?.length || 1)) * 100)}%`,
      performanceByTopic,
      alertZones,
      villainQuestions,
      learningCurve: {
        firstAttempt: firstAcc,
        subsequentAttempt: subAcc,
        improvement: subAcc - firstAcc
      },
      accuracyTimeline: Object.entries(timelineData).map(([date, s]) => ({
        date,
        pct: s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
      }))
    };
  }
}
;
