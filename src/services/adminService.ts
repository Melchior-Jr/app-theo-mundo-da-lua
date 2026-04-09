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
  atRiskPlayers: AtRiskPlayer[];
  absentCount: number;
  recentActivity: RecentActivity[];
  popularChapters: { title: string; views: string; completion: string; status: string }[];
  topErrorThemes: { title: string; errorRate: number }[];
  topPlayers: { name: string; xp: number; accuracy: number }[];
}

export interface AtRiskPlayer {
  id: string;
  name: string;
  accuracy: number;
  difficultTopics: string[];
}

export interface RecentActivity {
  id: string;
  title: string;
  user: string;
  time: string;
  rawDate: string;
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
    
    // Identificar jogadores ativos olhando atividades recentes nos logs (últimos 7 dias)
    const { data: recentExpo } = await supabase.rpc('admin_get_all_exploration_logs');
    const filteredExpo = recentExpo?.filter((l: any) => new Date(l.created_at) >= sevenDaysAgo) || [];
    
    const { data: recentGame } = await supabase.rpc('admin_get_all_game_sessions');
    const filteredGame = recentGame?.filter((l: any) => new Date(l.played_at) >= sevenDaysAgo) || [];
    
    const activeIdsFromLogs = new Set([
      ...filteredExpo.map((l: any) => l.player_id),
      ...filteredGame.map((l: any) => l.player_id)
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

    // 3. XP e Trending (Global)
    const { data: xpData, error: xpError } = await supabase.rpc('admin_get_all_player_stats');
    
    if (xpError) console.error('Erro ao buscar XP:', xpError);
    
    const totalXP = xpData?.reduce((acc: number, curr: any) => acc + (curr.galactic_xp || 0), 0) || 0;
    const xpLastWeek = xpData?.filter((d: any) => new Date(d.updated_at) >= sevenDaysAgo).reduce((acc: number, curr: any) => acc + (curr.galactic_xp || 0), 0) || 0;
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
      const { data: progressAll } = await supabase.rpc('admin_get_all_chapter_progress');
      const { count: totalChaptersPossible } = await supabase.from('app_subjects').select('*', { count: 'exact', head: true });
      
      const possibleTotal = totalPlayers * (totalChaptersPossible || 10);
      const completedTotal = progressAll?.filter((p: any) => p.completed === true).length || 0;
      averageProgress = possibleTotal > 0 ? Math.round((completedTotal / possibleTotal) * 100) : 0;
    } catch (e) {
      console.error('Erro ao calcular progresso:', e);
    }

    // 6. Alunos com Dificuldade (Risco Pedagógico)
    const atRiskPlayers = pedagogicalStats.playersWithDifficulty.map((p: any) => {
      const player = playersData?.find(pl => pl.id === p.id);
      return {
        ...p,
        name: player?.full_name || player?.username || 'Astronauta'
      };
    });
    const atRiskCount = atRiskPlayers.length;

    // 7. Rankings e Atividades Unificadas (Exploração + Games)
    const topPlayers = playersData?.map(p => {
      const pXP = xpData?.find((x: any) => x.player_id === p.id)?.galactic_xp || 0;
      return { 
        name: p.username || p.full_name || 'Astronauta', 
        xp: pXP, 
        accuracy: 0 
      };
    }).sort((a, b) => b.xp - a.xp).slice(0, 3) || [];

    // Busca de logs de exploração (Global via RPC)
    const { data: expoLogs } = await supabase.rpc('admin_get_all_exploration_logs');
    const limitedExpo = (expoLogs || []).slice(0, 30);

    // Busca de logs de sessões de jogos (Global via RPC)
    const { data: quizSessions } = await supabase.rpc('admin_get_all_game_sessions');
    const limitedQuiz = (quizSessions || []).slice(0, 40);

    // Unificar e formatar
    const unifiedLogs = [
      ...(limitedExpo.map((log: any) => ({
        id: `expo-${log.id}`,
        created_at: log.created_at,
        title: `Explorou Capítulo: ${log.exploration_id}`,
        player_id: log.player_id
      }))),
      ...(limitedQuiz.map((log: any) => ({
        id: `quiz-${log.id}`,
        created_at: log.played_at,
        title: `Finalizou Quiz/Jogo (Score: ${log.score})`,
        player_id: log.player_id
      })))
    ].sort((a, b) => new Date(b.created_at as string).getTime() - new Date(a.created_at as string).getTime())
     .slice(0, 50);

    const recentActivity: RecentActivity[] = unifiedLogs.map(log => {
      const player = playersData?.find(p => p.id === log.player_id);
      return {
        id: log.id,
        title: log.title,
        user: player?.username || player?.full_name || 'Astronauta',
        time: this.formatTimeAgo(new Date(log.created_at)),
        rawDate: log.created_at
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
      atRiskPlayers,
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

  /** Busca lista de alunos com união manual para evitar erros de relacionamento e respeitar RLS */
  async getPlayersList() {
    // 1. Busca os dados básicos dos jogadores
    const { data: players, error: pError } = await supabase
      .from('players')
      .select('*')
      .order('created_at', { ascending: false });

    if (pError) throw pError;
    if (!players) return [];

    // 2. Busca as estatísticas via RPCs administrativas (Bypass RLS)
    const [statsRes, progressRes, trophiesRes] = await Promise.all([
      supabase.rpc('admin_get_all_player_stats'),
      supabase.rpc('admin_get_all_chapter_progress'),
      supabase.rpc('admin_get_all_user_trophies')
    ]);

    // 3. Une os dados no código (Manual Join)
    return players.map(p => {
      const statsData = statsRes.data?.find((s: any) => s.player_id === p.id);
      
      // Conta ocorrências manualmente para progresso e troféus
      // Progresso: conta capítulos que foram concluídos (completed: true)
      const chapterCount = progressRes.data?.filter((pr: any) => pr.player_id === p.id && pr.completed === true).length || 0;
      const trophyCount = trophiesRes.data?.filter((t: any) => t.user_id === p.id).length || 0;

      // Fallback para último acesso: usa last_activity_at se last_login estiver vazio
      const safeLastLogin = p.last_login || statsData?.last_activity_at;

      return {
        ...p,
        last_login: safeLastLogin,
        player_global_stats: statsData || { 
          galactic_xp: 0, 
          total_trophies: 0,
          total_score: 0,
          last_activity_at: null
        },
        player_chapter_progress: { count: chapterCount },
        user_trophies: { count: trophyCount }
      };
    });
  },

  /** Busca dossiê completo de um único usuário com inteligência de dados (Bypass RLS via RPCs se necessário) */
  async getUserDetails(playerId: string) {
    // Para o dossiê detalhado, buscamos dados globais via RPC e filtramos localmente
    // Isso garante que o admin veja os dados mesmo com RLS
    const [statsAll, progressAll, expoLogsAll, trophiesAll, gamesAll, totalSubjects] = await Promise.all([
      supabase.rpc('admin_get_all_player_stats'),
      supabase.rpc('admin_get_all_chapter_progress'),
      supabase.rpc('admin_get_all_exploration_logs'),
      supabase.rpc('admin_get_all_user_trophies'),
      supabase.rpc('admin_get_all_game_sessions'),
      supabase.from('app_subjects').select('*', { count: 'exact', head: true })
    ]);

    const { data: profile } = await supabase.from('players').select('*').eq('id', playerId).single();

    const stats = statsAll.data?.find((s: any) => s.player_id === playerId) || null;
    const progress = progressAll.data?.filter((p: any) => p.player_id === playerId) || [];
    const logs = expoLogsAll.data?.filter((l: any) => l.player_id === playerId).sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()) || [];
    const trophies = trophiesAll.data?.filter((t: any) => t.user_id === playerId) || [];
    const games = gamesAll.data?.filter((g: any) => g.player_id === playerId).sort((a: any, b: any) => new Date(b.played_at).getTime() - new Date(a.played_at).getTime()) || [];

    // Cálculo de Duração Média (Baseado em metadados de sessões)
    const durations = games?.map((s: any) => s.metadata?.duration || 0).filter((d: number) => d > 0) || [];
    const avgDuration = durations.length > 0 
      ? Math.round(durations.reduce((a: number, b: number) => a + b, 0) / durations.length / 60) 
      : 0;

    // Insights Pedagógicos Dinâmicos
    const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253';
    const quizSessions = (games || []).filter((s: any) => s.game_id === QUIZ_GAME_ID);
    
    // Tópicos com erros frequentes (Analisando o log de questões de cada sessão)
    const topicErrors: Record<string, number> = {};
    quizSessions.forEach((session: any) => {
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
      profile: {
        ...profile,
        last_login: profile?.last_login || stats?.last_activity_at
      },
      stats,
      progress,
      logs,
      trophies,
      games,
      insights: {
        avgDurationMinutes: avgDuration || 12, // Fallback amigável se não houver dados de tempo
        topDifficulties: topDifficulties.length > 0 ? topDifficulties : null,
        totalChaptersAvailable: totalSubjects.count || 10
      }
    };
  },

  /** Ações de Gestão */
  async resetPlayerProgress(playerId: string) {
    const { error } = await supabase.rpc('reset_player_data', { p_player_id: playerId });
    if (error) throw error;
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
    const { error } = await supabase.rpc('admin_send_notification', {
      p_user_id: playerId,
      p_title: title,
      p_message: content,
      p_type: 'system'
    });
    if (error) throw error;
  },

  async getPedagogicalStats() {
    // 1. Fetch data from sessions (Global via RPC for Admin)
    const { data: sessions, error: sessErr } = await supabase.rpc('admin_get_all_game_sessions');

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
    sessions?.forEach((session: any) => {
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
      color: (stats.totalCorrect / stats.totalQuestions) > 0.85 ? '#10b981' : 
             (stats.totalCorrect / stats.totalQuestions) > 0.7 ? '#3b82f6' : 
             (stats.totalCorrect / stats.totalQuestions) > 0.5 ? '#f59e0b' : '#ef4444'
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

    sessions?.forEach((session: any) => {
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

    // 4. Pedagogical Risk (Last 7 Days, Accuracy < 70% / Errors >= 30%)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentSessions = (sessions as any[])?.filter((s: any) => new Date(s.played_at) >= sevenDaysAgo) || [];
    const recentPlayersAccuracy: Record<string, { correct: number, total: number }> = {};
    
    recentSessions.forEach((session: any) => {
       const pid = session.player_id;
       if (pid) {
         if (!recentPlayersAccuracy[pid]) recentPlayersAccuracy[pid] = { correct: 0, total: 0 };
         recentPlayersAccuracy[pid].correct += (session.metadata?.correct_count || 0);
         recentPlayersAccuracy[pid].total += (session.metadata?.total_questions || 5);
       }
    });

    const playersWithDifficulty: any[] = [];
    Object.entries(recentPlayersAccuracy).forEach(([pid, stats]) => {
      const acc = stats.correct / stats.total;
      if (acc < 0.7) { // 30% de erro ou mais
        // Encontrar tópicos difíceis para este player nos últimos 7 dias
        const playerRecentSessions = recentSessions.filter((s: any) => s.player_id === pid);
        const playerTopicErrors: Record<string, number> = {};
        playerRecentSessions.forEach((s: any) => {
          const tName = topicMap[s.metadata?.level] || 'Outros';
          const logs = s.metadata?.questions_log || [];
          logs.forEach((l: any) => {
            if (!l.isCorrect) playerTopicErrors[tName] = (playerTopicErrors[tName] || 0) + 1;
          });
        });

        const diffTopics = Object.entries(playerTopicErrors)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 2)
          .map(([t]) => t);

        playersWithDifficulty.push({
          id: pid,
          accuracy: Math.round(acc * 100),
          difficultTopics: diffTopics.length > 0 ? diffTopics : ['Geral']
        });
      }
    });

    const totalRecentPlayers = Object.keys(recentPlayersAccuracy).length;
    const pedagogicalRisk = totalRecentPlayers > 0 ? Math.round((playersWithDifficulty.length / totalRecentPlayers) * 100) : 0;

    // Identify alert zones
    const alertZones = performanceByTopic
      .filter(t => t.pct > 0 && t.pct < 70)
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
      playersWithDifficulty,
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
