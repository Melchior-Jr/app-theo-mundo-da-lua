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
  AlertCircle
} from 'lucide-react';
import { AdminService } from '@/services/adminService';
import { calcLevel, getLevelTitle } from '@/utils/playerUtils';
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
    } catch (err) {
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

  const filteredPlayers = players.filter(p => 
    p.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Aluno</th>
              <th>Nível / XP</th>
              <th>Status</th>
              <th>Cadastro</th>
              <th>Último Acesso</th>
              <th>Progresso</th>
              <th style={{ textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredPlayers.map(p => {
              const status = getStatus(p.last_login);
              const stats = Array.isArray(p.player_global_stats) ? p.player_global_stats[0] : p.player_global_stats;
              const chapterCount = Array.isArray(p.player_chapter_progress) ? p.player_chapter_progress[0]?.count : p.player_chapter_progress?.count;
              const trophyCount = Array.isArray(p.user_trophies) ? p.user_trophies[0]?.count : p.user_trophies?.count;

              return (
                <tr key={p.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
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
                      {p.last_login ? new Date(p.last_login).toLocaleDateString() : 'Nunca'}
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
          <div className={styles.fullPageDossier}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px', flexWrap: 'wrap', justifyContent: 'center' }}>
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
                <div className={styles.hStatItem}>
                  <div className={styles.hStatValue}>{selectedPlayer.trophies.length}</div>
                  <div className={styles.hStatLabel}>TROFÉUS</div>
                </div>
                <div className={styles.hStatItem} style={{ background: 'rgba(255, 209, 102, 0.1)' }}>
                  <div className={styles.hStatValue} style={{ color: '#ffd166' }}>{streak}</div>
                  <div className={styles.hStatLabel}>STREAK (DIAS)</div>
                </div>
              </div>
            </div>

            <div className={styles.dossierContent}>
              {/* Ficha Cadastral e Dados Frios */}
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
                
                {/* Coluna Esquerda: BI Analítico */}
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

                  <div className={styles.glassPanel} style={{ padding: '2rem' }}>
                    <div className={styles.sectionTitle}><Clock size={18} /> Histórico de Atividades Recentes</div>
                    <div className={styles.activityTimeline}>
                      {logs.slice(0, 10).map((log: any, i: number) => (
                        <div key={i} className={styles.timelineItem}>
                          <div className={styles.timelinePoint} />
                          <div className={styles.timelineContent}>
                            <div className={styles.tHeader}>
                              <strong>{log.exploration_id}</strong>
                              <span>{new Date(log.created_at).toLocaleDateString()} {new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <div className={styles.tDesc}>Recompensa Galáctica: +{log.xp_awarded} XP</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Coluna Direita: Gestão e Conquistas */}
                <div className={styles.dossierCol}>
                  <div className={styles.sectionTitle}><Trophy size={18} /> Galeria de Conquistas</div>
                  <div className={styles.trophyWall}>
                    {selectedPlayer.trophies.map((t: any, i: number) => (
                      <div key={i} className={styles.trophyItem} title={t.trophy_id}>🏆</div>
                    ))}
                    {selectedPlayer.trophies.length === 0 && <div style={{ opacity: 0.3 }}>Nenhum troféu conquistado ainda.</div>}
                  </div>

                  <div className={styles.glassPanel} style={{ padding: '2rem', marginTop: '2rem' }}>
                    <div className={styles.sectionTitle} style={{ color: '#ef4444' }}><ShieldAlert size={18} /> Gestão Discente</div>
                    <p style={{ fontSize: '0.9rem', opacity: 0.6, marginBottom: '1.5rem' }}>Ações de intervenção direta no progresso e acesso do aluno.</p>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <button onClick={() => handleResetProgress(selectedPlayer.profile.id)} disabled={actionLoading} className={styles.managementBtn}>
                        <RotateCcw size={18} /> Reiniciar Jornada (Reset)
                      </button>
                      <button 
                        onClick={() => handleToggleLock(selectedPlayer.profile.id, selectedPlayer.profile.is_locked)} 
                        disabled={actionLoading}
                        className={styles.managementBtn}
                        style={{ color: selectedPlayer.profile.is_locked ? '#10b981' : '#ef4444' }}
                      >
                        {selectedPlayer.profile.is_locked ? <Unlock size={18} /> : <Lock size={18} />}
                        {selectedPlayer.profile.is_locked ? 'Desbloquear Acesso' : 'Bloquear Acesso'}
                      </button>
                      <button onClick={() => handleAwardTrophy(selectedPlayer.profile.id)} disabled={actionLoading} className={styles.managementBtn}>
                        <Award size={18} /> Conceder Troféu Especial
                      </button>
                      <button onClick={() => handleSendNotification(selectedPlayer.profile.id)} disabled={actionLoading} className={styles.primaryBtn} style={{ marginTop: '1rem' }}>
                        Enviar Notificação no App
                      </button>
                    </div>
                  </div>

                  <div className={styles.glassPanel} style={{ padding: '2rem', marginTop: '2rem', background: 'linear-gradient(135deg, rgba(0,229,255,0.05) 0%, rgba(26,26,64,0) 100%)' }}>
                    <h4 style={{ margin: '0 0 10px 0' }}>Observações do Educador</h4>
                    <textarea 
                      placeholder="Adicione notas sobre o progresso ou dificuldades específicas deste aluno..."
                      value={educatorNotes}
                      onChange={(e) => setEducatorNotes(e.target.value)}
                      className={styles.dossierNotesArea}
                    />
                    <button 
                      onClick={handleSaveNotes}
                      disabled={actionLoading}
                      className={styles.secondaryBtn} 
                      style={{ width: '100%', marginTop: '10px' }}
                    >
                      {actionLoading ? 'Salvando...' : 'Salvar Notas'}
                    </button>
                  </div>
                </div>
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
