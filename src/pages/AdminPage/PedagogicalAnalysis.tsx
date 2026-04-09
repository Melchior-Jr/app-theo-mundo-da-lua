import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  BarChart2, 
  Zap
} from 'lucide-react';
import { AdminService } from '@/services/adminService';
import { THEO_QUIZ_DATA } from '../../data/quizQuestions';
import styles from './AdminPage.module.css';
import { X, HelpCircle, Check, Info } from 'lucide-react';

const PedagogicalAnalysis: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<any>(null);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const data = await AdminService.getPedagogicalStats();
      setStats(data);
    } catch (err) {
      console.error('Erro ao carregar métricas:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', flexDirection: 'column', gap: '20px' }}>
      <Brain size={48} className={styles.pulse} style={{ color: '#00e5ff', opacity: 0.5 }} />
      <p style={{ opacity: 0.5 }}>Analisando padrões de aprendizagem...</p>
    </div>
  );

  if (!stats) return (
    <div className={styles.glassPanel} style={{ padding: '3rem', textAlign: 'center' }}>
      <AlertTriangle size={48} color="#ef4444" style={{ marginBottom: '1rem' }} />
      <h3>Erro na Base de Dados</h3>
      <p style={{ opacity: 0.6 }}>Não foi possível processar a telemetria pedagógica no momento.</p>
    </div>
  );

  const handleQuestionClick = (questionId: string) => {
    // THEO_QUIZ_DATA é um array plano de questões
    const q = THEO_QUIZ_DATA.find((quest: any) => quest.id === questionId);
    
    if (q) {
      const chapterTitles: Record<number, string> = {
        1: 'Sistema Solar',
        2: 'Planetas',
        3: 'Terra e Movimentos',
        4: 'Lua e Fases',
        5: 'Constelações'
      };

      setSelectedQuestion({
        ...q,
        chapterTitle: chapterTitles[q.level] || `Nível ${q.level}`
      });
    } else {
      console.warn(`Questão ${questionId} não encontrada nos dados locais.`);
    }
  };

  const renderQuestionModal = () => {
    if (!selectedQuestion) return null;

    return (
      <div className={styles.modalOverlay} onClick={() => setSelectedQuestion(null)}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()} style={{ maxWidth: '600px' }}>
          <div className={styles.modalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <HelpCircle size={24} color="#ffd166" />
              <h3>Detalhes da Questão</h3>
            </div>
            <button className={styles.closeBtn} onClick={() => setSelectedQuestion(null)}>
              <X size={24} />
            </button>
          </div>
          
          <div className={styles.modalBody}>
            <div style={{ marginBottom: '1.5rem' }}>
              <span className={styles.statusBadge} style={{ background: 'rgba(0, 229, 255, 0.1)', color: '#00e5ff', fontSize: '0.7rem' }}>
                {selectedQuestion.chapterTitle}
              </span>
              <h4 style={{ fontSize: '1.2rem', margin: '0.75rem 0', lineHeight: 1.4 }}>
                {selectedQuestion.question}
              </h4>
              <p style={{ fontSize: '0.8rem', opacity: 0.5 }}>ID: {selectedQuestion.id}</p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selectedQuestion.type === 'true-false' ? (
                // Verdadeiro ou Falso
                [true, false].map((val) => {
                  const isCorrect = selectedQuestion.correctAnswer === val;
                  return (
                    <div 
                      key={val.toString()}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {isCorrect ? <Check size={14} /> : null}
                      </div>
                      <span style={{ fontSize: '0.9rem', opacity: isCorrect ? 1 : 0.8 }}>
                        {val ? 'Verdadeiro' : 'Falso'}
                      </span>
                    </div>
                  );
                })
              ) : selectedQuestion.options ? (
                // Múltipla Escolha ou similar
                selectedQuestion.options.map((option: string, index: number) => {
                  const isCorrect = selectedQuestion.correctAnswer === option || index === selectedQuestion.correctAnswer;
                  return (
                    <div 
                      key={index}
                      style={{ 
                        padding: '1rem', 
                        borderRadius: '12px', 
                        background: isCorrect ? 'rgba(16, 185, 129, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                        border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255, 255, 255, 0.08)'}`,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px'
                      }}
                    >
                      <div style={{ 
                        width: '24px', 
                        height: '24px', 
                        borderRadius: '50%', 
                        background: isCorrect ? '#10b981' : 'rgba(255, 255, 255, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.7rem',
                        fontWeight: 700
                      }}>
                        {isCorrect ? <Check size={14} /> : String.fromCharCode(65 + index)}
                      </div>
                      <span style={{ fontSize: '0.9rem', opacity: isCorrect ? 1 : 0.8 }}>{option}</span>
                    </div>
                  );
                })
              ) : (
                <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', textAlign: 'center' }}>
                  Resposta Correta: <strong style={{ color: '#10b981' }}>{selectedQuestion.correctAnswer.toString()}</strong>
                </div>
              )}
            </div>

            {selectedQuestion.explanation && (
              <div style={{ 
                marginTop: '1.5rem', 
                padding: '1rem', 
                borderRadius: '12px', 
                background: 'rgba(247, 199, 98, 0.05)', 
                border: '1px solid rgba(247, 199, 98, 0.1)',
                display: 'flex',
                gap: '12px'
              }}>
                <Info size={18} color="#f7c762" style={{ flexShrink: 0 }} />
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f7c762', marginBottom: '4px' }}>Explicação Pedagógica</div>
                  <div style={{ fontSize: '0.85rem', opacity: 0.7, lineHeight: 1.5 }}>{selectedQuestion.explanation}</div>
                </div>
              </div>
            )}
          </div>

          <div className={styles.modalFooter}>
            <button className={styles.secondaryBtn} onClick={() => setSelectedQuestion(null)}>
              Fechar
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pedagogicalContainer}>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
          <Brain size={24} color="#00e5ff" />
          <h1 className={styles.title} style={{ margin: 0 }}>Análise Pedagógica Profunda</h1>
        </div>
        <p className={styles.subtitle}>Insights baseados em IA sobre o rendimento, retenção e dificuldades da turma.</p>
      </header>

      {/* Cards de KPIs */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.statLabel}>Aproveitamento Global</div>
              <div className={styles.statValue} style={{ color: '#10b981' }}>{stats.globalAccuracy}</div>
            </div>
            <Target size={24} opacity={0.2} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.6 }}>
            Consistência de acertos nos desafios
          </div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.statLabel}>Quizes Realizados</div>
              <div className={styles.statValue}>{stats.totalQuizzes}</div>
            </div>
            <CheckCircle2 size={24} opacity={0.2} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.6 }}>
            Volume de engajamento pedagógico
          </div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.statLabel}>Risco Pedagógico</div>
              <div className={styles.statValue} style={{ color: stats.pedagogicalRisk.replace('%','') > 20 ? '#ef4444' : '#f59e0b' }}>
                {stats.pedagogicalRisk}
              </div>
            </div>
            <AlertTriangle size={24} opacity={0.2} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.6 }}>
            Alunos com aproveitamento &lt; 60%
          </div>
        </div>

        <div className={styles.statCard}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div className={styles.statLabel}>Curva de Evolução</div>
              <div className={styles.statValue} style={{ color: '#ffd166' }}>
                {stats.learningCurve.improvement > 0 ? `+${stats.learningCurve.improvement}%` : `${stats.learningCurve.improvement}%`}
              </div>
            </div>
            <TrendingUp size={24} opacity={0.2} />
          </div>
          <div style={{ fontSize: '0.8rem', marginTop: '10px', opacity: 0.6 }}>
            Ganho de performance (1ª vs 2ª tentativa)
          </div>
        </div>
      </div>

      <div className={styles.chartRow}>
        {/* Desempenho por Tópico */}
        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
          <div className={styles.panelHeader}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Desempenho por Tema (Capítulos)</h2>
            <BarChart2 size={20} opacity={0.5} />
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '2rem' }}>
            {stats.performanceByTopic.map((topic: any) => (
              <div key={topic.label} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>{topic.label}</span>
                  <span style={{ opacity: 0.7 }}>{topic.pct}% de acertos</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${topic.pct}%`, height: '100%', background: topic.color, borderRadius: '4px', transition: 'width 1s ease-out' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Evolução de Acertos (Timeline) */}
        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
          <div className={styles.panelHeader}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Evolução de Acertos (7 dias)</h2>
            <TrendingUp size={20} opacity={0.5} />
          </div>
          
          <div style={{ marginTop: '2rem', overflowX: 'auto', paddingBottom: '1rem', msOverflowStyle: 'none', scrollbarWidth: 'none' }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '150px', gap: '8px', minWidth: '400px' }}>
              {stats.accuracyTimeline.map((item: any) => (
                <div key={item.date} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '100%', height: `${item.pct}%`, background: 'linear-gradient(to top, #3b82f6, #00e5ff)', borderRadius: '4px 4px 0 0', position: 'relative', minHeight: '4px' }}>
                    {item.pct > 0 && <span style={{ position: 'absolute', top: '-20px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.7rem', fontWeight: 700 }}>{item.pct}%</span>}
                  </div>
                  <div style={{ fontSize: '0.6rem', opacity: 0.5, transform: 'rotate(-45deg)', whiteSpace: 'nowrap', marginTop: '5px' }}>
                    {new Date(item.date).toLocaleDateString([], {day: '2-digit', month: '2-digit'})}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className={styles.villainRow}>
        {/* Perguntas "Vilãs" */}
        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
          <div className={styles.panelHeader}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Perguntas Maiores Taxas de Erro</h2>
            <AlertTriangle size={20} opacity={0.5} />
          </div>
          
          <div style={{ marginTop: '1.5rem' }}>
            {stats.villainQuestions.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', fontSize: '0.8rem', opacity: 0.5, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                    <th style={{ padding: '10px 5px' }}>ID Questão</th>
                    <th>Taxa Erro</th>
                    <th>Tempo Médio</th>
                    <th>Amostra</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.villainQuestions.map((q: any) => (
                    <tr 
                      key={q.id} 
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '0.9rem', cursor: 'pointer' }}
                      onClick={() => handleQuestionClick(q.id)}
                      className={styles.villainTableRow}
                    >
                      <td style={{ padding: '12px 5px', fontWeight: 600, color: '#00e5ff' }}>{q.id}</td>
                      <td style={{ color: '#ef4444', fontWeight: 700 }}>{q.errorRate}%</td>
                      <td>{q.avgTime}s</td>
                      <td style={{ opacity: 0.5 }}>{q.totalAttempts} x</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p style={{ opacity: 0.4, fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>Aguardando telemetria de erros...</p>
            )}
          </div>
        </div>

        {/* Alertas Pedagógicos */}
        <div className={styles.glassPanel} style={{ padding: '2rem' }}>
          <div className={styles.panelHeader}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Alertas de Intervenção</h2>
            <Zap size={20} opacity={0.5} />
          </div>
          <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {stats.alertZones.map((alert: any, idx: number) => (
              <div 
                key={idx} 
                className={styles.glassPanel} 
                style={{ 
                  padding: '1rem', 
                  background: alert.type === 'error' ? 'rgba(239, 68, 68, 0.05)' : 'rgba(16, 185, 129, 0.05)', 
                  borderLeft: `4px solid ${alert.type === 'error' ? '#ef4444' : '#10b981'}`, 
                  borderRadius: '4px' 
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {alert.type === 'error' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                  {alert.title}
                </div>
                <p style={{ fontSize: '0.8rem', opacity: 0.6, margin: '5px 0 0 0' }}>{alert.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {renderQuestionModal()}
    </div>
  );
};

export default PedagogicalAnalysis;
