import { useState, useEffect } from 'react';
import { 
  Search, 
  TrendingUp, 
  Clock, 
  ShieldAlert, 
  Trophy, 
  Zap,
  RotateCcw,
  Lock,
  Unlock,
  Award,
  Calendar,
  Activity,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  FlaskConical
} from 'lucide-react';
import { AdminService } from '@/services/adminService';
import { calcLevel, getLevelTitle } from '@/utils/playerUtils';
import { THEO_QUIZ_DATA } from '@/data/quizQuestions';
import styles from './AdminPage.module.css';

interface PlayerDetails {
  profile: any;
  stats: any;
  progress: any[];
  logs: any[];
  trophies: any[];
  games: any[];
  insights: {
    avgDurationMinutes: number;
    topDifficulties: string[] | null;
    totalChaptersAvailable: number;
  };
}

export default function UsersManager() {
  const [players, setPlayers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerDetails | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [educatorNotes, setEducatorNotes] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>({ key: 'full_name', direction: 'asc' });
  const [activeTab, setActiveTab] = useState('resumo');
  const [historyFilter, setHistoryFilter] = useState('todos');

  useEffect(() => {
    loadPlayers();
  }, []);

  async function loadPlayers() {
    try {
      const data = await AdminService.getPlayersList();
      setPlayers(data || []);
    } catch (err) {
      console.error('Erro ao carregar alunos:', err);
    }
  }

  const getStatus = (lastLogin: string) => {
    if (!lastLogin) return { label: 'Inativo', class: styles.statusDraft, color: '#999' };
    const days = Math.floor((new Date().getTime() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 3) return { label: 'Ativo', class: styles.statusPublished, color: '#10b981' };
    if (days < 7) return { label: 'Pouco Ativo', class: styles.statusComing, color: '#f59e0b' };
    if (days < 14) return { label: 'Ausente', class: styles.statusComing, color: '#ef4444' };
    return { label: 'Crítico', class: styles.statusDraft, color: '#ef4444' };
  };

  async function handleViewDetails(id: string) {
    try {
      const details = await AdminService.getUserDetails(id);
      setSelectedPlayer(details);
      setEducatorNotes(details.profile.educator_notes || '');
    } catch (err) {
      alert('Erro ao carregar dossiê do aluno.');
    }
  }

  async function handleResetProgress(id: string) {
    if (!confirm('ATENÇÃO: Isso apagará TODO o progresso, XP e troféus deste aluno. Esta ação é irreversível. Deseja continuar?')) return;
    setActionLoading(true);
    try {
      await AdminService.resetPlayerProgress(id);
      alert('Progresso resetado com sucesso.');
      
      // Recarregar dados para refletir na UI imediatamente
      await loadPlayers();
      if (selectedPlayer && selectedPlayer.profile.id === id) {
        await handleViewDetails(id);
      }
    } catch (err) {
      console.error('Erro ao resetar:', err);
      alert('Falha ao resetar.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSaveNotes() {
    if (!selectedPlayer) return;
    setActionLoading(true);
    try {
      await AdminService.updateEducatorNotes(selectedPlayer.profile.id, educatorNotes);
      alert('Notas salvas com sucesso!');
    } catch (err) {
      alert('Erro ao salvar notas.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleLock(id: string, currentLock: boolean) {
    const action = currentLock ? 'desbloquear' : 'bloquear';
    if (!confirm(`Deseja realmente ${action} o acesso deste aluno?`)) return;
    setActionLoading(true);
    try {
      await AdminService.togglePlayerLock(id, !currentLock);
      alert(`Aluno ${currentLock ? 'desbloqueado' : 'bloqueado'} com sucesso.`);
      // Atualiza o estado local
      if (selectedPlayer) {
        setSelectedPlayer({
          ...selectedPlayer,
          profile: { ...selectedPlayer.profile, is_locked: !currentLock }
        });
      }
      loadPlayers();
    } catch (err) {
      alert('Erro ao alterar status de acesso.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleToggleTester(id: string, currentStatus: boolean) {
    setActionLoading(true);
    try {
      await AdminService.toggleTesterStatus(id, !currentStatus);
      alert(`Status de testador ${!currentStatus ? 'ativado' : 'desativado'} com sucesso.`);
      if (selectedPlayer) {
        setSelectedPlayer({
          ...selectedPlayer,
          profile: { ...selectedPlayer.profile, is_tester: !currentStatus }
        });
      }
      loadPlayers();
    } catch (err) {
      alert('Erro ao alterar status de testador.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAwardTrophy(id: string) {
    const trophyId = prompt('Digite o ID do troféu especial (Ex: astronauta_honra, mestre_orbita):');
    if (!trophyId) return;
    setActionLoading(true);
    try {
      await AdminService.awardManualTrophy(id, trophyId);
      alert('Troféu concedido com sucesso!');
      handleViewDetails(id); // Recarrega os dados do aluno
    } catch (err) {
      alert('Erro ao conceder troféu.');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleSendNotification(id: string) {
    const title = prompt('Título da Notificação:');
    if (!title) return;
    const content = prompt('Mensagem da Notificação:');
    if (!content) return;

    setActionLoading(true);
    try {
      await AdminService.sendPlayerNotification(id, title, content);
      alert('Notificação enviada com sucesso!');
    } catch (err) {
      alert('Erro ao enviar notificação.');
    } finally {
      setActionLoading(false);
    }
  }

  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedPlayers = [...players]
    .filter(p => 
      p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.username?.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      if (!sortConfig) return 0;
      
      const getValue = (p: any, key: string) => {
        switch(key) {
          case 'full_name': return p.full_name?.toLowerCase() || '';
          case 'xp': {
            const stats = Array.isArray(p.player_global_stats) ? p.player_global_stats[0] : p.player_global_stats;
            return stats?.galactic_xp || 0;
          }
          case 'created_at': return new Date(p.created_at).getTime();
          case 'last_login': return p.last_login ? new Date(p.last_login).getTime() : 0;
          case 'status': {
            const s = getStatus(p.last_login);
            return s.label;
          }
          case 'progress': {
            const chapterCount = Array.isArray(p.player_chapter_progress) ? p.player_chapter_progress[0]?.count : p.player_chapter_progress?.count;
            return chapterCount || 0;
          }
          default: return 0;
        }
      };

      const aVal = getValue(a, sortConfig.key);
      const bVal = getValue(b, sortConfig.key);

      if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

  const SortIcon = ({ column }: { column: string }) => {
    if (!sortConfig || sortConfig.key !== column) return <ArrowUpDown size={14} style={{ marginLeft: 8, opacity: 0.3 }} />;
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={14} style={{ marginLeft: 8, color: '#00e5ff' }} /> 
      : <ChevronDown size={14} style={{ marginLeft: 8, color: '#00e5ff' }} />;
  };

  return (
    <div>
      <header className={styles.header}>
        <h1 className={styles.title}>Dossiê de Astronautas</h1>
        <p className={styles.subtitle}>Acompanhe o engajamento e a evolução dos seus alunos em tempo real.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total de Alunos</div>
          <div className={styles.statValue}>{players.length}</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Ativos na Semana</div>
          <div className={styles.statValue}>
            {players.filter(p => {
              if (!p.last_login) return false;
              const days = Math.floor((new Date().getTime() - new Date(p.last_login).getTime()) / (1000 * 60 * 60 * 24));
              return days <= 7;
            }).length}
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Em Risco (Crítico)</div>
          <div className={styles.statValue} style={{ color: '#ef4444' }}>
            {players.filter(p => {
              if (!p.last_login) return true;
              const days = Math.floor((new Date().getTime() - new Date(p.last_login).getTime()) / (1000 * 60 * 60 * 24));
              return days >= 14;
            }).length}
          </div>
        </div>
      </div>

      <div className={styles.glassPanel} style={{ marginBottom: '2rem', padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Search size={20} color="rgba(255,255,255,0.4)" />
          <input 
            type="text" 
            placeholder="Filtro rápido..." 
            className={styles.noneInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ flex: 1, background: 'none', border: 'none', color: '#fff', outline: 'none', fontSize: '1rem' }}
          />
        </div>
      </div>

      <section className={styles.glassPanel}>
        <div className={styles.tableContainer}>
          <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => requestSort('full_name')} style={{ cursor: 'pointer' }}>
                Aluno <SortIcon column="full_name" />
              </th>
              <th onClick={() => requestSort('xp')} style={{ cursor: 'pointer' }}>
                Nível / XP <SortIcon column="xp" />
              </th>
              <th onClick={() => requestSort('status')} style={{ cursor: 'pointer' }}>
                Status <SortIcon column="status" />
              </th>
              <th onClick={() => requestSort('created_at')} style={{ cursor: 'pointer' }}>
                Cadastro <SortIcon column="created_at" />
              </th>
              <th onClick={() => requestSort('last_login')} style={{ cursor: 'pointer' }}>
                Último Acesso <SortIcon column="last_login" />
              </th>
              <th onClick={() => requestSort('progress')} style={{ cursor: 'pointer' }}>
                Progresso <SortIcon column="progress" />
              </th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {sortedPlayers.map(p => {
              const status = getStatus(p.last_login);
              const stats = Array.isArray(p.player_global_stats) ? p.player_global_stats[0] : p.player_global_stats;
              const chapterCount = Array.isArray(p.player_chapter_progress) ? p.player_chapter_progress[0]?.count : p.player_chapter_progress?.count;
              const trophyCount = Array.isArray(p.user_trophies) ? p.user_trophies[0]?.count : p.user_trophies?.count;

              return (
                <tr key={p.id}>
                  <td>
                    <div 
                      onClick={() => handleViewDetails(p.id)}
                      className={styles.userClickableInfo}
                      style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}
                    >
                      <img src={p.avatar_url || 'https://via.placeholder.com/40'} alt="" style={{ width: 40, height: 40, borderRadius: '50%', border: '2px solid ' + status.color }} />
                      <div>
                        <div style={{ fontWeight: 600 }}>{p.full_name}</div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>@{p.username}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Zap size={14} color="#ffd166" />
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span>Lvl {calcLevel(stats?.galactic_xp || 0)}</span>
                        <span style={{ fontSize: '0.7rem', color: '#00e5ff', fontWeight: 500 }}>
                          {getLevelTitle(calcLevel(stats?.galactic_xp || 0))}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>({stats?.galactic_xp || 0} XP)</span>
                    </div>
                  </td>
                  <td>
                    <span className={`${styles.statusBadge} ${status.class}`}>
                      {status.label}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                      <Calendar size={14} opacity={0.5} />
                      {new Date(p.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem' }}>
                      <Clock size={14} opacity={0.5} />
                      {p.last_login ? new Date(p.last_login).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Nunca'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Trophy size={14} color="#ffd166" />
                        <span>{trophyCount || 0}</span>
                      </div>
                      <div style={{ width: '1px', height: '12px', background: 'rgba(255,255,255,0.1)' }} />
                      <span>{chapterCount || 0} Aulas</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button 
                      onClick={() => handleViewDetails(p.id)}
                      className={styles.actionBtn}
                      style={{ color: '#00e5ff' }}
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>

      {/* --- MODO DOSSIÊ (PÁGINA CHEIA) --- */}
      {selectedPlayer && (() => {
        // --- Cérebro de Análise de Dados ---
        const logs = selectedPlayer.logs || [];
        const progress = selectedPlayer.progress || [];
        const games = selectedPlayer.games || [];
        
        const uniqueDays = new Set(logs.map((l: any) => new Date(l.created_at).toDateString())).size;
        const last7DaysLogs = logs.filter((l: any) => {
          const diff = (new Date().getTime() - new Date(l.created_at).getTime()) / (1000 * 60 * 60 * 24);
          return diff <= 7;
        });
        const weeklyFreq = weeklyFreqCount(last7DaysLogs);
        
        const daysSinceLast = selectedPlayer.profile.last_login 
          ? Math.floor((new Date().getTime() - new Date(selectedPlayer.profile.last_login).getTime()) / (1000 * 60 * 60 * 24))
          : Math.floor((new Date().getTime() - new Date(selectedPlayer.profile.created_at).getTime()) / (1000 * 60 * 60 * 24));
        
        let riskStatus = { label: 'Saudável', color: '#10b981', desc: 'Engajamento regular' };
        if (daysSinceLast >= 3) riskStatus = { label: 'Em Alerta', color: '#f59e0b', desc: 'Sinal instável' };
        if (daysSinceLast >= 7) riskStatus = { label: 'Risco de Abandono', color: '#ef4444', desc: 'Ausente há muito tempo' };

        const chaptersVisited = new Set(progress.map((p: any) => p.chapter_id)).size;
        const lessonsDone = progress.length;
        const gamesPlayed = new Set(games.map((g: any) => g.game_id)).size;

        // Cálculo de Streak (Sequência de dias ativos)
        const sortedDates = Array.from(new Set(logs.map((l: any) => new Date(l.created_at).toDateString())))
          .map(d => new Date(d).getTime())
          .sort((a, b) => b - a);
        
        let streak = 0;
        let checkDate = new Date();
        checkDate.setHours(0,0,0,0);

        for (const dateVal of sortedDates) {
          const d = new Date(dateVal);
          d.setHours(0,0,0,0);
          const diffDays = Math.floor((checkDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
          
          if (diffDays <= 1) {
            streak++;
            checkDate = d;
          } else {
            break;
          }
        }

        return (
          <div className={styles.dossierModalOverlay}>
            <div className={styles.dossierModalContent}>
              <div className={styles.dossierHeader}>
                <button onClick={() => setSelectedPlayer(null)} className={styles.backBtn}>
                  <ArrowLeft size={20} /> Voltar para a Lista
                </button>
                
                <div className={styles.dossierAvatarWrapper}>
                  <div style={{ position: 'relative' }}>
                    <img src={selectedPlayer.profile.avatar_url} alt="" className={styles.dossierAvatar} />
                    <div className={styles.riskOrb} style={{ background: riskStatus.color }} />
                  </div>
                  <div className={styles.dossierNameInfo}>
                    <h1>{selectedPlayer.profile.full_name}</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px', flexWrap: 'wrap' }}>
                      <span className={styles.dossierBadge}>Lvl {calcLevel(selectedPlayer.stats?.galactic_xp || 0)}</span>
                      <span style={{ color: '#00e5ff', fontWeight: 500 }}>{getLevelTitle(calcLevel(selectedPlayer.stats?.galactic_xp || 0))}</span>
                      <span style={{ opacity: 0.5 }}>• @{selectedPlayer.profile.username}</span>
                    </div>
                  </div>
                </div>

                <div className={styles.headerStats}>
                  <div className={styles.hStatItem}>
                    <div className={styles.hStatValue}>{selectedPlayer.stats?.galactic_xp || 0}</div>
                    <div className={styles.hStatLabel}>XP TOTAL</div>
                  </div>
                  <div className={styles.hStatItem} style={{ background: 'rgba(255, 209, 102, 0.1)', padding: '8px 15px', borderRadius: '12px' }}>
                    <div className={styles.hStatValue} style={{ color: '#ffd166' }}>{streak}</div>
                    <div className={styles.hStatLabel}>STREAK (DIAS)</div>
                  </div>
                </div>
              </div>

              <div className={styles.tabsNav}>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'resumo' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('resumo')}
                >
                  <TrendingUp size={18} /> Resumo do Aluno
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'historico' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('historico')}
                >
                  <Activity size={18} /> Histórico Detalhado
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'conversa' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('conversa')}
                >
                  <Zap size={18} /> Conversa & Notas
                </button>
                <button 
                  className={`${styles.tabBtn} ${activeTab === 'config' ? styles.tabBtnActive : ''}`}
                  onClick={() => setActiveTab('config')}
                >
                  <ShieldAlert size={18} /> Configurações
                </button>
              </div>

              <div className={styles.dossierContent}>
                
                {activeTab === 'resumo' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className={styles.dossierMetaGrid}>
                      <div className={styles.metricCard}>
                        <span className={styles.mLabel}>Idade / Série</span>
                        <div className={styles.mValue} style={{ fontSize: '1.2rem' }}>
                          {selectedPlayer.profile.birth_date 
                            ? `${Math.floor((new Date().getTime() - new Date(selectedPlayer.profile.birth_date).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} Anos` 
                            : '---'} • {selectedPlayer.profile.class_name || 'NI'}
                        </div>
                        <div className={styles.mSub}>{selectedPlayer.profile.school || 'Escola não informada'}</div>
                      </div>
                      <div className={styles.metricCard}>
                        <span className={styles.mLabel}>Último Acesso</span>
                        <div className={styles.mValue} style={{ fontSize: '1.2rem' }}>{selectedPlayer.profile.last_login ? new Date(selectedPlayer.profile.last_login).toLocaleDateString() : '---'}</div>
                        <div className={styles.mSub}>{selectedPlayer.profile.last_login ? new Date(selectedPlayer.profile.last_login).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}) : 'Nunca entrou'}</div>
                      </div>
                      <div className={styles.metricCard}>
                        <span className={styles.mLabel}>Cadastro</span>
                        <div className={styles.mValue} style={{ fontSize: '1.2rem' }}>{new Date(selectedPlayer.profile.created_at).toLocaleDateString()}</div>
                        <div className={styles.mSub}>Inscrito há {Math.floor((new Date().getTime() - new Date(selectedPlayer.profile.created_at).getTime()) / (1000 * 60 * 60 * 24))} dias</div>
                      </div>
                      <div className={styles.metricCard}>
                        <span className={styles.mLabel}>Presença Mensal</span>
                        <div className={styles.mValue} style={{ fontSize: '1.2rem' }}>{uniqueDays} Dias</div>
                        <div className={styles.mSub}>Total de dias ativos</div>
                      </div>
                    </div>

                    <div className={styles.dossierGrid}>
                      <div className={styles.dossierCol}>
                        <div className={styles.sectionTitle}><Activity size={18} /> Diagnóstico de Engajamento</div>
                        <div className={styles.metricGrid}>
                          <div className={styles.metricCard}>
                            <span className={styles.mLabel}>Taxa de Retorno (7d)</span>
                            <div className={styles.mValue}>{((weeklyFreq / 7) * 100).toFixed(0)}%</div>
                            <div className={styles.mSub}>{weeklyFreq} dias ativos esta semana</div>
                          </div>
                          <div className={styles.metricCard}>
                            <span className={styles.mLabel}>Ausência Atual</span>
                            <div className={styles.mValue} style={{ color: riskStatus.color }}>{daysSinceLast} dias</div>
                            <div className={styles.mSub}>{riskStatus.label}</div>
                          </div>
                          <div className={styles.metricCard}>
                            <span className={styles.mLabel}>Duração p/ Sessão</span>
                            <div className={styles.mValue}>~{selectedPlayer.insights.avgDurationMinutes}m</div>
                            <div className={styles.mSub}>Tempo médio de exploração</div>
                          </div>
                        </div>

                        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                          <div className={styles.sectionTitle}><TrendingUp size={18} /> Cobertura Pedagógica</div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
                            <div className={styles.progressRow}>
                              <div className={styles.pInfo}><span>Módulos de Astronomia</span> <span>{chaptersVisited}/{selectedPlayer.insights.totalChaptersAvailable}</span></div>
                              <div className={styles.pBar}><div className={styles.pFill} style={{ width: `${(chaptersVisited / selectedPlayer.insights.totalChaptersAvailable) * 100}%`, background: '#00e5ff' }} /></div>
                            </div>
                            <div className={styles.progressRow}>
                              <div className={styles.pInfo}><span>Desafios Concluídos</span> <span>{lessonsDone} quizes</span></div>
                              <div className={styles.pBar}><div className={styles.pFill} style={{ width: `${Math.min(100, (lessonsDone / (selectedPlayer.insights.totalChaptersAvailable * 2)) * 100)}%`, background: '#10b981' }} /></div>
                            </div>
                            <div className={styles.progressRow}>
                              <div className={styles.pInfo}><span>Missões e Jogos</span> <span>{gamesPlayed} explorados / {games.length} sessões</span></div>
                              <div className={styles.pBar}><div className={styles.pFill} style={{ width: `${Math.min(100, (gamesPlayed / 15) * 100)}%`, background: '#ffd166' }} /></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className={styles.dossierCol}>
                        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                          <div className={styles.sectionTitle} style={{ color: '#ef4444' }}><AlertCircle size={18} /> Dificuldades Recorrentes</div>
                          <div style={{ marginTop: '1rem', fontSize: '0.95rem' }}>
                            {selectedPlayer.insights.topDifficulties ? (
                              <p style={{ opacity: 0.8 }}>O sistema detectou menor aproveitamento em módulos de: <strong style={{ color: '#ef4444' }}>{selectedPlayer.insights.topDifficulties.join(', ')}</strong>.</p>
                            ) : lessonsDone > 0 ? (
                              <p style={{ opacity: 0.8, color: '#10b981' }}>Excelente! O explorador demonstra domínio sólido em todos os temas analisados.</p>
                            ) : (
                              <p style={{ opacity: 0.4, fontStyle: 'italic' }}>Dados insuficientes para análise de dificuldades.</p>
                            )}
                          </div>
                        </div>

                        <div className={styles.sectionTitle}><Trophy size={18} /> Galeria de Conquistas</div>
                        <div className={styles.trophyWall}>
                          {selectedPlayer.trophies.map((t: any, i: number) => (
                            <div key={i} className={styles.trophyItem} title={t.trophy_id}>🏆</div>
                          ))}
                          {selectedPlayer.trophies.length === 0 && <div style={{ opacity: 0.3 }}>Nenhum troféu conquistado ainda.</div>}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'historico' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className={styles.filtersRow} style={{ marginBottom: '2rem' }}>
                      <button 
                        className={`${styles.filterChip} ${historyFilter === 'todos' ? styles.filterChipActive : ''}`}
                        onClick={() => setHistoryFilter('todos')}
                      >
                        Todos
                      </button>
                      <button 
                        className={`${styles.filterChip} ${historyFilter === 'jornada' ? styles.filterChipActive : ''}`}
                        onClick={() => setHistoryFilter('jornada')}
                      >
                        Jornada
                      </button>
                      <button 
                        className={`${styles.filterChip} ${historyFilter === 'quiz' ? styles.filterChipActive : ''}`}
                        onClick={() => setHistoryFilter('quiz')}
                      >
                        Quizes
                      </button>
                      <button 
                        className={`${styles.filterChip} ${historyFilter === 'jogos' ? styles.filterChipActive : ''}`}
                        onClick={() => setHistoryFilter('jogos')}
                      >
                        Jogos
                      </button>
                    </div>

                    <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                      <div className={styles.sectionTitle}><Clock size={18} /> Histórico Expandido</div>
                      <div className={styles.activityTimeline}>
                        {(() => {
                          const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253';

                          const constellations: Record<string, string> = {
                            orion: 'Órion', 'tres-marias': 'Três Marias', cruzeiro: 'Cruzeiro do Sul',
                            aries: 'Áries', touro: 'Touro', gemeos: 'Gêmeos', cancer: 'Câncer',
                            leao: 'Leão', virgem: 'Virgem', libra: 'Libra', escorpiao: 'Escorpião',
                            sagitario: 'Sagitário', capricornio: 'Capricórnio', aquario: 'Aquário', peixes: 'Peixes'
                          };

                          const celestial: Record<string, string> = {
                            mercurio: 'Mercúrio', venus: 'Vênus', terra: 'Terra', marte: 'Marte',
                            jupiter: 'Júpiter', saturno: 'Saturno', urano: 'Urano', netuno: 'Netuno',
                            sol: 'Sol', lua: 'Lua'
                          };

                          const translateAction = (slug: string) => {
                            if (!slug) return 'Atividade Desconhecida';
                            
                            // Mapeamento específico para Constelações
                            const constMatch = slug.match(/(view|reveal)-constellation-(.+)/);
                            if (constMatch) {
                              const [,, id] = constMatch;
                              const name = constellations[id] || id.replace(/-/g, ' ');
                              return `${constMatch[1] === 'view' ? 'Observou' : 'Revelou'} a Constelação de ${name}`;
                            }

                            // Mapeamento específico para Planetas
                            const planetMatch = slug.match(/(view|interact-3d)-planet-(.+)/);
                            if (planetMatch) {
                              const [,, id] = planetMatch;
                              const name = celestial[id] || id.replace(/-/g, ' ');
                              return `${planetMatch[1] === 'view' ? 'Visitou' : 'Explorou 3D de'} ${name}`;
                            }

                            if (slug.startsWith('stat-detail-')) {
                              const id = slug.split('-').pop() || '';
                              return `Estudou ficha técnica: ${celestial[id] || id}`;
                            }
                            
                            if (slug.startsWith('view-moon-phase-')) {
                              const id = slug.replace('view-moon-phase-', '');
                              const phases: Record<string, string> = {
                                'nova': 'Lua Nova', 'quarto-crescente': 'Quarto Crescente',
                                'cheia': 'Lua Cheia', 'quarto-minguante': 'Quarto Minguante'
                              };
                              return `Observou a fase: ${phases[id] || 'da Lua'}`;
                            }

                            if (slug.includes('const-intro-guide')) return 'Seguiu o guia estelar do Théo';
                            
                            if (slug.startsWith('completion-')) {
                              const id = slug.replace('completion-', '');
                              const chapters: Record<string, string> = {
                                'sistema-solar': 'Sistema Solar',
                                'movimentos-da-terra': 'Movimentos da Terra',
                                'constelacoes': 'Constelações',
                                'fases-da-lua': 'Fases da Lua'
                              };
                              return `Concluiu a jornada: ${chapters[id] || id}`;
                            }

                            if (slug.startsWith('share-')) return 'Compartilhou descobertas com a turma';
                            
                            // Fallback para slugs limpos
                            return slug
                              .replace(/view-constellation-/g, 'Observou ')
                              .replace(/reveal-constellation-/g, 'Revelou ')
                              .replace(/view-planet-/g, 'Visitou ')
                              .replace(/-/g, ' ')
                              .replace(/\b\w/g, l => l.toUpperCase());
                          };

                          const translateGame = (gameId: string) => {
                            if (gameId === QUIZ_GAME_ID || gameId === 'quiz-espacial') return 'Quiz Espacial';
                            const gamesMap: Record<string, string> = {
                              'invasores-conhecimento': 'Invasores do Conhecimento',
                              'invasores': 'Invasores do Conhecimento',
                              'memoria-astral': 'Memória Astral',
                              'memoria': 'Memória Astral',
                              'quebra-cabeca': 'Quebra-cabeça Galáctico'
                            };
                            return gamesMap[gameId] || `Jogo: ${gameId}`;
                          };
                          
                          // Unifica e filtra os logs conforme a aba
                          const unified = [
                            ...logs.map(l => ({ 
                              ...l, 
                              type: 'jornada', 
                              date: l.created_at, 
                              title: translateAction(l.exploration_id), 
                              xp: l.xp_awarded 
                            })),
                            ...games.map(g => ({ 
                              ...g, 
                              type: g.game_id === QUIZ_GAME_ID ? 'quiz' : 'jogos', 
                              date: g.played_at, 
                              title: g.game_id === QUIZ_GAME_ID 
                                ? `Respondeu Quiz (Nível ${g.metadata?.level}, Desafio ${g.metadata?.challenge})` 
                                : `Jogou: ${translateGame(g.game_id)}`,
                              xp: g.metadata?.xp_earned || 0
                            }))
                          ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

                          const filtered = unified.filter(item => {
                            if (historyFilter === 'todos') return true;
                            return item.type === historyFilter;
                          });

                          if (filtered.length === 0) return <p style={{ opacity: 0.4, fontStyle: 'italic', padding: '2rem' }}>Nenhuma atividade encontrada neste filtro.</p>;

                          return filtered.map((item: any, i: number) => (
                            <div key={i} className={styles.timelineItem}>
                              <div className={styles.timelinePoint} />
                              <div className={styles.timelineContent}>
                                <div className={styles.tHeader}>
                                  <strong>{item.title}</strong>
                                  <span>{new Date(item.date).toLocaleDateString()} {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div className={styles.tDesc}>
                                  Recompensa Galáctica: +{item.xp || 0} XP
                                  {item.type === 'quiz' && item.metadata && (
                                    <div style={{ marginTop: '0.5rem' }}>
                                      <div style={{ color: '#10b981', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10b981' }} />
                                        Aproveitamento: {item.metadata.correct_count}/{item.metadata.total_questions} ({((item.metadata.correct_count / (item.metadata.total_questions || 1)) * 100).toFixed(0)}%)
                                      </div>
                                      
                                      {item.metadata.questions_log && item.metadata.questions_log.some((q: any) => !q.isCorrect) && (
                                        <div style={{ 
                                          marginTop: '1rem', 
                                          padding: '1.25rem', 
                                          background: 'rgba(239, 68, 68, 0.08)', 
                                          borderRadius: '16px', 
                                          border: '1px solid rgba(239, 68, 68, 0.15)',
                                          boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                        }}>
                                          <div style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                            <AlertCircle size={14} /> Questões que Precisam de Atenção
                                          </div>
                                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                            {item.metadata.questions_log.filter((q: any) => !q.isCorrect).map((q: any, idx: number) => {
                                              const qid = q.questionId || q.id;
                                              const qData = THEO_QUIZ_DATA.find(tq => tq.id === qid);
                                              return (
                                                <div key={idx} style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.9)', lineHeight: '1.5', paddingLeft: '1rem', borderLeft: '2px solid rgba(239, 68, 68, 0.3)' }}>
                                                  {qData?.question || `Questão: Identificador ${qid}`}
                                                </div>
                                              );
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'conversa' && (
                  <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                      <div className={styles.sectionTitle}><Zap size={18} /> Interação Direta</div>
                      <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '2rem' }}>Envie mensagens em tempo real para o tablet do aluno durante a jornada.</p>
                      
                      <button 
                        onClick={() => handleSendNotification(selectedPlayer.profile.id)} 
                        disabled={actionLoading} 
                        className={styles.primaryBtn} 
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                      >
                        <Zap size={18} /> Enviar Mensagem Instantânea
                      </button>
                      
                      <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(255, 209, 102, 0.05)', borderRadius: '16px', border: '1px solid rgba(255, 209, 102, 0.1)' }}>
                        <h4 style={{ color: '#ffd166', margin: '0 0 10px 0' }}>Dica do Mestre</h4>
                        <p style={{ fontSize: '0.85rem', opacity: 0.8, margin: 0 }}>Você pode usar as notificações para dar feedbacks motivacionais ou orientar o aluno a revisar algum tópico específico.</p>
                      </div>
                    </div>

                    <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                      <div className={styles.sectionTitle}><Activity size={18} /> Prontuário do Educador</div>
                      <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '1rem' }}>Notas internas visíveis apenas para professores e administradores.</p>
                      
                      <textarea 
                        placeholder="Adicione notas sobre o progresso ou dificuldades específicas deste aluno..."
                        value={educatorNotes}
                        onChange={(e) => setEducatorNotes(e.target.value)}
                        className={styles.dossierNotesArea}
                        style={{ marginBottom: '1rem' }}
                      />
                      <button 
                        onClick={handleSaveNotes}
                        disabled={actionLoading}
                        className={styles.secondaryBtn} 
                        style={{ width: '100%' }}
                      >
                        {actionLoading ? 'Salvando...' : 'Salvar no Prontuário'}
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'config' && (
                  <div style={{ animation: 'fadeIn 0.3s ease' }}>
                    <div className={styles.sectionTitle} style={{ color: '#ef4444' }}><ShieldAlert size={18} /> Central de Controle Discente</div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '2.5rem' }}>Ações críticas de intervenção técnica e administrativa.</p>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
                      <div className={styles.managementCard}>
                        <div className={styles.mgmtIcon} style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}><RotateCcw size={24} /></div>
                        <div className={styles.mgmtInfo}>
                          <h4>Resetar Jornada</h4>
                          <p>Apaga todo o XP, troféus e progresso. O aluno começará do zero.</p>
                          <button onClick={() => handleResetProgress(selectedPlayer.profile.id)} disabled={actionLoading} className={styles.dangerActionBtn}>
                            Reiniciar do Zero
                          </button>
                        </div>
                      </div>

                      <div className={styles.managementCard}>
                        <div className={styles.mgmtIcon} style={{ 
                          background: selectedPlayer.profile.is_locked ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
                          color: selectedPlayer.profile.is_locked ? '#10b981' : '#ef4444' 
                        }}>
                          {selectedPlayer.profile.is_locked ? <Unlock size={24} /> : <Lock size={24} />}
                        </div>
                        <div className={styles.mgmtInfo}>
                          <h4>Status de Acesso</h4>
                          <p>{selectedPlayer.profile.is_locked ? 'O aluno está bloqueado e não pode entrar no app.' : 'O aluno tem acesso total à plataforma.'}</p>
                          <button 
                            onClick={() => handleToggleLock(selectedPlayer.profile.id, selectedPlayer.profile.is_locked)} 
                            disabled={actionLoading}
                            className={selectedPlayer.profile.is_locked ? styles.successActionBtn : styles.dangerActionBtn}
                          >
                            {selectedPlayer.profile.is_locked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
                          </button>
                        </div>
                      </div>

                      <div className={styles.managementCard}>
                        <div className={styles.mgmtIcon} style={{ background: 'rgba(255, 209, 102, 0.1)', color: '#ffd166' }}><Award size={24} /></div>
                        <div className={styles.mgmtInfo}>
                          <h4>Premiação Manual</h4>
                          <p>Conceda troféus exclusivos para incentivar o engajamento.</p>
                          <button onClick={() => handleAwardTrophy(selectedPlayer.profile.id)} disabled={actionLoading} className={styles.warningActionBtn}>
                            Dar Troféu Especial
                          </button>
                        </div>
                      </div>

                      <div className={styles.managementCard}>
                        <div className={styles.mgmtIcon} style={{ 
                          background: selectedPlayer.profile.is_tester ? 'rgba(0, 229, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)', 
                          color: selectedPlayer.profile.is_tester ? '#00e5ff' : 'rgba(255, 255, 255, 0.4)' 
                        }}><FlaskConical size={24} /></div>
                        <div className={styles.mgmtInfo}>
                          <h4>Acesso Beta (Testador)</h4>
                          <p>{selectedPlayer.profile.is_tester ? 'Este aluno pode visualizar conteúdos em rascunho (Beta).' : 'Este aluno visualiza apenas conteúdos publicados.'}</p>
                          <button 
                            onClick={() => handleToggleTester(selectedPlayer.profile.id, selectedPlayer.profile.is_tester)} 
                            disabled={actionLoading} 
                            className={selectedPlayer.profile.is_tester ? styles.successActionBtn : styles.secondaryBtn}
                            style={{ width: '100%', marginTop: 'auto' }}
                          >
                            {selectedPlayer.profile.is_tester ? 'Remover Acesso Beta' : 'Tornar Testador'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

// Auxiliar para contagem de dias únicos
function weeklyFreqCount(logs: any[]) {
  return new Set(logs.map((l: any) => new Date(l.created_at).toDateString())).size;
}
