import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp, 
  TrendingDown,
  Award, 
  Zap,
  Target,
  AlertCircle,
  Play
} from 'lucide-react';
import { AdminService, AdminStats } from '@/services/adminService';
import styles from './AdminPage.module.css';

const AdminOverview: React.FC = () => {
  const [statsData, setStatsData] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

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
              <div className={styles.alertItem}>
                <div className={styles.alertValue} style={{ color: '#ef4444' }}>{statsData.atRiskCount}</div>
                <div className={styles.alertLabel}>Alunos com Dificuldade</div>
                <div className={styles.alertDesc}>Precisão abaixo de 60%</div>
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
            {statsData.recentActivity.map((activity) => (
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
            <button className={styles.primaryBtn} onClick={() => window.location.href='/prof/alunos'} style={{ width: '100%', marginTop: '1.5rem', background: 'rgba(255,255,255,0.05)', boxShadow: 'none' }}>
              Gerenciar Alunos
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminOverview;
