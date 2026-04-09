import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Zap,
  Target,
  AlertCircle,
  Play,
  Search,
  Filter,
  Calendar,
  X,
  History
} from 'lucide-react';
import { AdminService, AdminStats } from '@/services/adminService';
import styles from './AdminPage.module.css';

const AdminOverview: React.FC = () => {
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Estados para Modal de Atividade
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isRiskModalOpen, setIsRiskModalOpen] = useState(false);
  const [activitySearch, setActivitySearch] = useState('');
  const [activityTypeFilter, setActivityTypeFilter] = useState('all');
  const [activityDateFilter, setActivityDateFilter] = useState('');

  useEffect(() => {
    async function loadStats() {
      try {
        const data = await AdminService.getDashboardStats();
        setStatsData(data);
      } catch (err) {
        console.error('Erro ao carregar estatísticas:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingPulse}>
          <Play size={48} color="#8bf9ff" />
        </div>
      </div>
    );
  }

  if (!statsData) return null;

  return (
    <div className={styles.adminOverview}>
      <header className={styles.header}>
        <h1 className={styles.title}>Painel de Controle</h1>
        <p className={styles.subtitle}>Telemetria em tempo real da turma de exploradores.</p>
      </header>

      {/* Indicadores Principais */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(255, 209, 102, 0.1)', color: '#ffd166' }}><Users /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Total de Alunos</span>
            <div className={styles.statValue}>
              {statsData.totalPlayers}
              <span className={styles.trendUp}>
                <TrendingUp size={14} /> {statsData.newUsersWeekTrend || 0}%
              </span>
            </div>
            <span className={styles.statSub}>+{statsData.newUsersWeek} novos na semana</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}><Zap /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Vizinhança</span>
            <div className={styles.statValue}>
              <span style={{ color: '#10b981' }}>{statsData.activePlayers}</span>
              <span className={styles.valueSeparator}>/</span>
              <span style={{ color: '#ef4444' }}>{statsData.inactivePlayers}</span>
            </div>
            <span className={styles.statSub}>Atividade nos últimos 7 dias</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff' }}><Target /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Progresso</span>
            <div className={styles.statValue}>{statsData.averageProgress}%</div>
            <div className={styles.miniProgressBar}>
              <div className={styles.miniProgressFill} style={{ width: `${statsData.averageProgress}%`, background: '#00e5ff' }} />
            </div>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6' }}><Award /></div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Acertos</span>
            <div className={styles.statValue}>
              {statsData.averageAccuracy}%
              <span className={statsData.averageAccuracyTrend >= 0 ? styles.trendUp : styles.trendDown}>
                {statsData.averageAccuracyTrend >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />} 
                {Math.abs(statsData.averageAccuracyTrend || 0)}%
              </span>
            </div>
            <span className={styles.statSub}>Média geral de precisão</span>
          </div>
        </div>
      </div>

      <div className={styles.dashboardLayout}>
        {/* Painéis Pedagógicos */}
        <div className={styles.dashboardMain}>
          <div className={styles.glassPanel}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}><AlertCircle size={20} color="#ef4444" /> Alertas Operacionais</h2>
            </div>
            <div className={styles.alertsGrid}>
              <div 
                className={styles.alertItem} 
                onClick={() => setIsRiskModalOpen(true)}
                style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <div className={styles.alertValue} style={{ color: '#ef4444' }}>{statsData.atRiskCount}</div>
                <div className={styles.alertLabel}>Alunos com Dificuldade</div>
                <div className={styles.alertDesc}>Erro &gt; 30% (últimos 7 dias)</div>
              </div>
              <div className={styles.alertItem}>
                <div className={styles.alertValue} style={{ color: '#ffd166' }}>{statsData.absentCount}</div>
                <div className={styles.alertLabel}>Alunos Ausentes</div>
                <div className={styles.alertDesc}>Há mais de 7 dias</div>
              </div>
              <div className={styles.alertItem}>
                <div className={styles.alertValue} style={{ color: '#00e5ff' }}>{statsData.totalXP.toLocaleString()}</div>
                <div className={styles.alertLabel}>XP Coletivo</div>
                <div className={styles.alertDesc}>Conquista total da turma</div>
              </div>
            </div>
          </div>

          <div className={styles.analyticalGrid}>
            <div className={styles.glassPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle}><TrendingDown size={20} color="#ef4444" /> Temas Críticos</h2>
              </div>
              <div className={styles.themeList}>
                {statsData.topErrorThemes.map((theme, i) => (
                  <div key={i} className={styles.themeItem}>
                    <div className={styles.themeInfo}>
                      <span className={styles.themeName}>{theme.title}</span>
                      <span className={styles.themeRate}>{theme.errorRate}% erros</span>
                    </div>
                    <div className={styles.miniProgressBar}><div className={styles.miniProgressFill} style={{ width: `${theme.errorRate}%`, background: '#ef4444' }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.glassPanel}>
              <div className={styles.panelHeader}>
                <h2 className={styles.panelTitle} style={{ color: '#ffd166' }}><Award size={20} /> Melhor Desempenho</h2>
              </div>
              <div className={styles.rankList}>
                {statsData.topPlayers.map((player, i) => (
                  <div key={i} className={styles.rankItem}>
                    <div className={styles.rankPos}>{i + 1}º</div>
                    <div className={styles.rankInfo}>
                      <span className={styles.rankName}>{player.name}</span>
                      <span className={styles.rankXP}>{player.xp.toLocaleString()} XP</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Lado Direito: Atividade Recente */}
        <section className={styles.glassPanel}>
          <div className={styles.panelHeader}>
            <h2 className={styles.panelTitle}><Zap size={20} /> Atividade Recente</h2>
          </div>
          <div className={styles.activityFeed}>
            {statsData.recentActivity.slice(0, 5).map((activity) => (
              <div key={activity.id} className={styles.activityItem}>
                <div className={styles.activityDot} />
                <div className={styles.activityInfo}>
                  <div className={styles.activityAction}>{activity.title}</div>
                  <div className={styles.activityUser}>{activity.user}</div>
                  <div className={styles.activityTime}>{activity.time}</div>
                </div>
              </div>
            ))}
            {(!statsData.recentActivity || statsData.recentActivity.length === 0) && (
              <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: '2rem 0' }}>
                Nenhuma atividade registrada ainda.
              </p>
            )}
            
            {statsData.recentActivity.length > 5 && (
              <button 
                className={styles.secondaryBtn} 
                onClick={() => setIsActivityModalOpen(true)}
                style={{ width: '100%', marginTop: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
              >
                <History size={16} /> Ver todas
              </button>
            )}

          </div>
        </section>
      </div>

      {/* Modal de Histórico de Atividades */}
      {isActivityModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsActivityModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '900px', height: '80vh', display: 'flex', flexDirection: 'column' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Zap size={24} color="#00e5ff" />
                <h3>Histórico Completo de Atividades</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsActivityModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Filtros */}
            <div style={{ padding: '1.5rem 2rem', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '1rem' }}>
              <div className={styles.formGroup}>
                <label><Search size={14} /> Pesquisar Usuário</label>
                <input 
                  type="text" 
                  placeholder="Nome do aluno..." 
                  value={activitySearch}
                  onChange={e => setActivitySearch(e.target.value)}
                  style={{ padding: '0.6rem 1rem' }}
                />
              </div>
              <div className={styles.formGroup}>
                <label><Filter size={14} /> Tipo</label>
                <select 
                  className={styles.adminSelect}
                  value={activityTypeFilter}
                  onChange={e => setActivityTypeFilter(e.target.value)}
                  style={{ padding: '0.6rem 1rem' }}
                >
                  <option value="all">Todos</option>
                  <option value="Quiz">Desafios/Quizes</option>
                  <option value="Explorou">Exploração</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label><Calendar size={14} /> Data</label>
                <input 
                  type="date" 
                  value={activityDateFilter}
                  onChange={e => setActivityDateFilter(e.target.value)}
                  style={{ padding: '0.6rem 1rem' }}
                />
              </div>
            </div>

            {/* Lista com scroll */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 2rem' }}>
              <div className={styles.activityFeed}>
                {statsData.recentActivity
                  .filter(a => {
                    const matchSearch = a.user.toLowerCase().includes(activitySearch.toLowerCase());
                    const matchType = activityTypeFilter === 'all' || a.title.includes(activityTypeFilter);
                    const matchDate = !activityDateFilter || (a.rawDate && a.rawDate.startsWith(activityDateFilter));
                    return matchSearch && matchType && matchDate;
                  })
                  .map((activity) => (
                    <div key={activity.id} className={styles.activityItem} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)', padding: '1rem 0' }}>
                      <div className={styles.activityDot} />
                      <div className={styles.activityInfo} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div>
                          <div className={styles.activityAction}>{activity.title}</div>
                          <div className={styles.activityUser}>{activity.user}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div className={styles.activityTime} style={{ color: '#00e5ff', fontWeight: 600 }}>{activity.time}</div>
                          <div style={{ fontSize: '0.7rem', opacity: 0.3 }}>{activity.rawDate ? new Date(activity.rawDate).toLocaleString() : ''}</div>
                        </div>
                      </div>
                    </div>
                  ))
                }
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.secondaryBtn} onClick={() => setIsActivityModalOpen(false)}>
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Alunos com Dificuldade */}
      {isRiskModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setIsRiskModalOpen(false)}>
          <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className={styles.modalHeader}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <AlertCircle size={24} color="#ef4444" />
                <h3>Alunos Precisando de Atenção</h3>
              </div>
              <button className={styles.closeBtn} onClick={() => setIsRiskModalOpen(false)}>
                <X size={24} />
              </button>
            </div>

            <div style={{ padding: '1.5rem 2rem' }}>
              <p style={{ opacity: 0.6, fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Estes alunos apresentaram um índice de acerto inferior a 60% nas atividades recentes.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {statsData.atRiskPlayers.map((player) => (
                  <div 
                    key={player.id} 
                    style={{ 
                      padding: '1.25rem', 
                      background: 'rgba(255,255,255,0.03)', 
                      borderRadius: '16px',
                      border: '1px solid rgba(255,255,255,0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '1.1rem' }}>{player.name}</strong>
                      <span style={{ color: '#ef4444', fontWeight: 800, fontSize: '1.1rem' }}>{player.accuracy}%</span>
                    </div>
                    
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '4px' }}>
                      <span style={{ fontSize: '0.75rem', opacity: 0.5, width: '100%' }}>MAIORES DIFICULDADES EM:</span>
                      {player.difficultTopics.map((topic, idx) => (
                        <span 
                          key={idx} 
                          style={{ 
                            fontSize: '0.75rem', 
                            padding: '4px 10px', 
                            background: 'rgba(239, 68, 68, 0.1)', 
                            color: '#ef4444', 
                            borderRadius: '20px',
                            fontWeight: 600
                          }}
                        >
                          {topic}
                        </span>
                      ))}
                    </div>

                    <button 
                      className={styles.secondaryBtn} 
                      onClick={() => window.location.href = `/prof/alunos?id=${player.id}`}
                      style={{ marginTop: '8px', padding: '0.5rem', fontSize: '0.8rem', width: 'fit-content' }}
                    >
                      Acessar Dossiê
                    </button>
                  </div>
                ))}

                {statsData.atRiskPlayers.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌟</div>
                    <p style={{ opacity: 0.6 }}>Nenhum aluno com dificuldades críticas no momento!</p>
                  </div>
                )}
              </div>
            </div>

            <div className={styles.modalFooter}>
              <button className={styles.primaryBtn} onClick={() => setIsRiskModalOpen(false)}>
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOverview;
