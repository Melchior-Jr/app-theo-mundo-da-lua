import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Bell, 
  AlertCircle, 
  CheckCircle, 
  Info,
  History,
  Sparkles,
  Zap,
  Star
} from 'lucide-react';
import { NotificationService, NotificationType } from '@/services/notificationService';
import { AdminService } from '@/services/adminService';
import { useAuth } from '@/context/AuthContext';
import styles from './Communication.module.css';

type TargetType = 'all' | 'school' | 'class' | 'individual';

const Communication: React.FC = () => {
  const { user } = useAuth();
  const [players, setPlayers] = useState<any[]>([]);
  const [targetType, setTargetType] = useState<TargetType>('all');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  
  const [searchTerm, setSearchTerm] = useState('');
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<NotificationType>('info');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setFetching(true);
      const data = await AdminService.getPlayersList();
      setPlayers(data || []);
    } catch (err) {
      console.error('Erro ao carregar dados de alunos:', err);
    } finally {
      setFetching(false);
    }
  }

  // Extrair opções únicas
  const schools = Array.from(new Set(players.map(p => p.school).filter(Boolean))).sort();
  const classes = Array.from(new Set(
    players
      .filter(p => !selectedSchool || p.school === selectedSchool)
      .map(p => p.class_name)
      .filter(Boolean)
  )).sort();


  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!title || !content) return;

    setLoading(true);
    const teacherName = user?.user_metadata?.full_name || user?.user_metadata?.name || 'Professor';
    
    // Detecta o cargo (Tipo de usuário)
    let teacherRole = 'Professor';
    if (user?.user_metadata?.role) {
      teacherRole = user.user_metadata.role; // Se já estiver no metadata
    } else if (user?.email === 'jamelchior72@gmail.com') {
      teacherRole = 'Diretor'; // Exemplo manual para o admin se necessário
    }

    try {
      let targetIds: string[] = [];

      if (targetType === 'all') {
        await NotificationService.notifyAll(title, content, type, teacherName, teacherRole);
      } else if (targetType === 'individual') {
        if (!selectedStudentId) throw new Error('Selecione um aluno');
        await AdminService.sendPlayerNotification(selectedStudentId, title, content, teacherName, teacherRole);
      } else {
        // Filtra os IDs baseado na escola ou turma
        targetIds = players
          .filter(p => {
            if (targetType === 'school') return p.school === selectedSchool;
            if (targetType === 'class') {
              const matchSchool = !selectedSchool || p.school === selectedSchool;
              return matchSchool && p.class_name === selectedClass;
            }
            return false;
          })
          .map(p => p.id);
        
        if (targetIds.length === 0) throw new Error('Nenhum aluno encontrado para os critérios selecionados');
        await NotificationService.notifyMany(targetIds, title, content, type, teacherName, teacherRole);
      }

      setSuccess(true);
      setTitle('');
      setContent('');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Erro ao enviar comunicação:', err);
      alert(err.message || 'Erro ao enviar mensagem');
    } finally {
      setLoading(false);
    }
  }

  const types = [
    { id: 'info' as NotificationType, label: 'Informativo', icon: <Info size={18} />, color: '#00e5ff' },
    { id: 'success' as NotificationType, label: 'Recompensa', icon: <Sparkles size={18} />, color: '#00ff88' },
    { id: 'warning' as NotificationType, label: 'Importante', icon: <AlertCircle size={18} />, color: '#ffd166' },
    { id: 'system' as NotificationType, label: 'Evento', icon: <Zap size={18} />, color: '#ff4d4d' },
  ];

  return (
    <div className={styles.container}>
      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
          <div className={styles.loadingPulse}>
            <Bell size={48} color="#00e5ff" />
          </div>
        </div>
      ) : (
        <>
          <header className={styles.header}>
            <h1 className={styles.title}>Portal de Comunicação</h1>
        <p className={styles.subtitle}>Envie mensagens e avisos estelares para todos os seus alunos.</p>
      </header>

      <div className={styles.grid}>
        {/* Formulário de Envio */}
        <section className={styles.glassPanel}>
          <h2 className={styles.sectionTitle}>
            <Send size={22} color="#00e5ff" />
            Nova Transmissão
          </h2>

          <form onSubmit={handleSend} className={styles.form}>
            <div className={styles.inputGroup}>
              <label className={styles.label}>Destinatários</label>
              <div className={styles.targetTypeGrid}>
                <button 
                  type="button" 
                  className={`${styles.targetBtn} ${targetType === 'all' ? styles.targetBtnActive : ''}`}
                  onClick={() => setTargetType('all')}
                >
                  Toda a Rede
                </button>
                <button 
                  type="button" 
                  className={`${styles.targetBtn} ${targetType === 'school' ? styles.targetBtnActive : ''}`}
                  onClick={() => setTargetType('school')}
                >
                  Escola
                </button>
                <button 
                  type="button" 
                  className={`${styles.targetBtn} ${targetType === 'class' ? styles.targetBtnActive : ''}`}
                  onClick={() => setTargetType('class')}
                >
                  Turma
                </button>
                <button 
                  type="button" 
                  className={`${styles.targetBtn} ${targetType === 'individual' ? styles.targetBtnActive : ''}`}
                  onClick={() => setTargetType('individual')}
                >
                  Aluno
                </button>
              </div>
            </div>

            <div className={styles.selectorsRow}>
              {(targetType === 'school' || targetType === 'class') && (
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Selecionar Escola</label>
                  <select 
                    className={styles.glassInput}
                    value={selectedSchool}
                    onChange={(e) => {
                      setSelectedSchool(e.target.value);
                      setSelectedClass('');
                    }}
                  >
                    <option value="">Todas as Escolas</option>
                    {schools.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              )}

              {targetType === 'class' && (
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                  <label className={styles.label}>Selecionar Turma</label>
                  <select 
                    className={styles.glassInput}
                    value={selectedClass}
                    onChange={(e) => {
                      setSelectedClass(e.target.value);
                    }}
                  >
                    <option value="">Todas as Turmas</option>
                    {classes.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              )}
            </div>

            {targetType === 'individual' && (
              <div className={styles.inputGroup}>
                <label className={styles.label}>Buscar Aluno</label>
                <div className={styles.searchWrapper}>
                  <input 
                    type="text"
                    className={styles.glassInput}
                    placeholder="Digite o nome ou @usuário do explorador..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSelectedStudentId('');
                    }}
                  />
                  {searchTerm.length >= 2 && !selectedStudentId && (
                    <div className={styles.searchResults}>
                      {players
                        .filter(p => 
                          (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (p.username || '').toLowerCase().includes(searchTerm.toLowerCase())
                        )
                        .slice(0, 5)
                        .map(p => (
                          <div 
                            key={p.id} 
                            className={styles.searchItem}
                            onClick={() => {
                              setSelectedStudentId(p.id);
                              setSearchTerm(p.full_name || p.username);
                            }}
                          >
                            <div className={styles.searchItemInfo}>
                              <span className={styles.searchItemName}>{p.full_name || p.username}</span>
                              <span className={styles.searchItemMeta}>@{p.username} • {p.school || 'Sem Escola'}</span>
                            </div>
                          </div>
                        ))
                      }
                      {players.filter(p => 
                        (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (p.username || '').toLowerCase().includes(searchTerm.toLowerCase())
                      ).length === 0 && (
                        <div className={styles.noResults}>Nenhum explorador encontrado</div>
                      )}
                    </div>
                  )}
                </div>
                {selectedStudentId && (
                  <div className={styles.selectedBadge}>
                    <span>Enviando para: <strong>{searchTerm}</strong></span>
                    <button type="button" onClick={() => {
                      setSelectedStudentId('');
                      setSearchTerm('');
                    }}>Alterar</button>
                  </div>
                )}
              </div>
            )}

            <div className={styles.inputGroup}>
              <label className={styles.label}>Título da Mensagem</label>
              <input 
                type="text" 
                className={styles.glassInput}
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Novo desafio espacial disponível! 🛸"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Mensagem para os Alunos</label>
              <textarea 
                className={styles.glassInput}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva aqui o conteúdo da sua mensagem..."
                rows={5}
                required
                style={{ resize: 'none' }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Tipo de Transmissão</label>
              <div className={styles.typeSelector}>
                {types.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setType(t.id)}
                    className={`${styles.typeBtn} ${type === t.id ? styles.typeBtnActive : ''}`}
                    style={{ 
                      '--active-color': t.color 
                    } as React.CSSProperties}
                  >
                    <span style={{ color: type === t.id ? t.color : 'rgba(255,255,255,0.4)' }}>
                      {t.icon}
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            <button 
              type="submit" 
              className={`${styles.submitBtn} ${success ? styles.successBtn : ''}`}
              disabled={loading || !title || !content}
            >
              {loading ? (
                <>Transmitindo...</>
              ) : success ? (
                <>
                  <CheckCircle size={20} />
                  Mensagem Enviada!
                </>
              ) : (
                <>
                  <Send size={20} />
                  Enviar para Todos os Alunos
                </>
              )}
            </button>
          </form>
        </section>

        {/* Dicas e Stats */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <section className={styles.glassPanel}>
            <h3 className={styles.sectionTitle} style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>
              <Star size={18} color="#ffd166" />
              Dicas do Professor
            </h3>
            
            <div className={styles.tipList}>
              <div className={styles.tipItem}>
                <div className={styles.tipIcon}><Sparkles size={16} color="#00e5ff" /></div>
                <p>Use o tipo <strong>Recompensa</strong> para parabenizar a turma por alcançar metas ou completar capítulos.</p>
              </div>
              <div className={styles.tipItem}>
                <div className={styles.tipIcon}><Bell size={16} color="#ffd166" /></div>
                <p>O tipo <strong>Importante</strong> gera um destaque maior para avisos sobre prazos ou mudanças.</p>
              </div>
              <div className={styles.tipItem}>
                <div className={styles.tipIcon}><Info size={16} color="rgba(255,255,255,0.5)" /></div>
                <p>Mantenha as mensagens curtas para que os alunos possam ler rapidamente entre uma atividade e outra.</p>
              </div>
            </div>
          </section>

          <section className={`${styles.glassPanel} ${styles.infoCard}`}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1rem' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255, 209, 102, 0.1)' }}>
                <History size={20} color="#ffd166" />
              </div>
              <span style={{ fontWeight: 600, color: '#ffd166' }}>Atenção Professor</span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.5)', lineHeight: '1.5' }}>
              Sua mensagem será transmitida instantaneamente para o painel de notificações de todos os alunos ativos no sistema.
            </p>
          </section>
        </aside>
        </div>
      </>
    )}
  </div>
  );
};

export default Communication;
