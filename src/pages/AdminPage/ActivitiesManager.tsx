import React, { useState, useEffect, useRef } from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Lock, 
  Users,
  X,
  Rocket,
  Sparkles,
  ChevronDown,
  Settings,
  Clock,
  AlertCircle,
  CheckCircle2,
  Mountain
} from 'lucide-react';
import styles from './AdminPage.module.css';
import QuizEditor from './QuizEditor';
import { AdminService } from '@/services/adminService';
import { Subject } from '@/services/subjectService';

interface Tester {
  id: string;
  full_name: string;
  username: string;
}

const ActivitiesManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [testers, setTesters] = useState<Tester[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingSubject, setEditingSubject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activePopover, setActivePopover] = useState<string | null>(null);
  
  // Refs para fechar popover ao clicar fora
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [subjData, testerData] = await Promise.all([
          AdminService.getSubjects(),
          AdminService.getTestersList()
        ]);
        setSubjects(subjData || []);
        setTesters(testerData || []);
      } catch (err) {
        console.error('Erro ao carregar dados:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleUpdateStatus = async (id: string, updates: any) => {
    try {
      await AdminService.updateSubjectStatus(id, updates);
      setSubjects(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
  };

  const filteredSubjects = subjects.filter(subj => 
    subj.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Rascunho';
      case 'coming_soon': return 'Em Breve';
      case 'published': return 'Publicado';
      default: return 'Inativo';
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'draft': return styles.statusDraft;
      case 'coming_soon': return styles.statusComingSoon;
      case 'published': return styles.statusPublished;
      default: return styles.statusInactive;
    }
  };

  if (editingSubject) {
    // Para simplificar, passamos apenas o ID e o QuizEditor se vira com o Supabase
    return <QuizEditor onBack={() => {
      setEditingSubject(null);
      // Recarregar dados ao voltar (pode ter mudado visibilidade lá)
      AdminService.getSubjects().then(setSubjects);
    }} defaultSubjectId={editingSubject} />;
  }

  return (
    <div className={styles.adminOverview}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>Gestão de Atividades</h1>
          <p className={styles.subtitle}>Gerencie a visibilidade, testadores e configurações de todas as jornadas e jogos.</p>
        </div>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsBar}>
        <div className={styles.statMiniCard}>
          <div className={`${styles.statIcon} ${styles.blue}`}>
            <Rocket size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{subjects.length}</span>
            <span className={styles.statLab}>Total de Jornadas</span>
          </div>
        </div>
        
        <div className={styles.statMiniCard}>
          <div className={`${styles.statIcon} ${styles.green}`}>
            <Sparkles size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{subjects.filter(s => s.status === 'published').length}</span>
            <span className={styles.statLab}>Publicadas</span>
          </div>
        </div>

        <div className={styles.statMiniCard}>
          <div className={`${styles.statIcon} ${styles.amber}`}>
            <Lock size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{subjects.filter(s => s.status === 'draft').length}</span>
            <span className={styles.statLab}>Em Rascunho</span>
          </div>
        </div>

        <div className={styles.statMiniCard}>
          <div className={`${styles.statIcon} ${styles.cyan}`}>
            <Users size={20} />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statVal}>{testers.length}</span>
            <span className={styles.statLab}>Testadores Ativos</span>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className={styles.actionBar}>
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="Pesquisar jornada ou aula..."
            className={styles.searchInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filterGroup}>
          <button className={styles.filterBtn}>
            <Filter size={16} />
            <span>Filtros</span>
          </button>
          
          <button className={styles.primaryBtn}>
            <Plus size={18} />
            <span>Nova Jornada</span>
          </button>
        </div>
      </div>

      {/* Tabela de Dados */}
      <section className={styles.glassPanel}>
        <div className={styles.tableContainer}>
          {loading ? (
            <div style={{ padding: '4rem', textAlign: 'center', opacity: 0.5 }}>Carregando jornadas...</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Nome da Atividade</th>
                  <th>Tipo Principal</th>
                  <th>Ordem</th>
                  <th>Status do Quiz</th>
                  <th style={{ textAlign: 'right' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubjects.length > 0 ? (
                  filteredSubjects.map((subj) => (
                    <tr key={subj.id}>
                      <td>
                        <div className={styles.activityNameCell}>
                          <div className={`${styles.activityIcon} ${subj.slug === 'geociencias' ? styles.geoIcon : styles.astroIcon}`}>
                            {subj.slug === 'geociencias' ? <Mountain size={16} /> : <Rocket size={16} />}
                          </div>
                          <div className={styles.activityDetails}>
                            <span className={styles.activityMainName}>
                              {subj.name.includes('|') ? subj.name.split('|')[0].trim() : subj.name}
                            </span>
                            <span className={styles.activitySubtype}>
                              {subj.name.includes('|') ? subj.name.split('|')[1].trim() : 'JORNADA EDUCATIVA'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>Quiz & Simulação</td>
                      <td>{subj.order_index}º</td>
                      <td>
                        <button
                          className={`${styles.statusBadge} ${getStatusClass(subj.quiz_status)}`}
                          onClick={() => setActivePopover(subj.id)}
                        >
                          <div className={styles.statusDot} />
                          {getStatusLabel(subj.quiz_status)}
                          <ChevronDown size={14} style={{ marginLeft: 4, opacity: 0.5 }} />
                        </button>
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button 
                            className={styles.iconBtn} 
                            title="Editar Quiz"
                            onClick={() => setEditingSubject(subj.id)}
                          >
                            <Settings size={18} />
                          </button>
                          <button className={styles.iconBtn} title="Visualizar Jogo"><Eye size={18} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '4rem', opacity: 0.5 }}>
                      Nenhuma atividade encontrada para os filtros aplicados.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Modal de Visibilidade (Popover customizado) */}
      {activePopover && (
        <>
          <div className={styles.popoverBackdrop} onClick={() => setActivePopover(null)} />
          <div className={styles.popover}>
            {(() => {
              const subj = subjects.find(s => s.id === activePopover);
              if (!subj) return null;
              
              return (
                <>
                  <div className={styles.popoverHeader} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className={styles.popoverTitle}>Visibilidade do Jogo</span>
                    <button onClick={() => setActivePopover(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>
                      <X size={16} />
                    </button>
                  </div>
                  <div className={styles.visibilityOptions}>
                    {(['draft', 'coming_soon', 'published'] as const).map((status) => (
                      <button
                        key={status}
                        className={`${styles.visibilityOption} ${subj.quiz_status === status ? styles.visibilityOptionActive : ''}`}
                        onClick={() => handleUpdateStatus(subj.id, { quiz_status: status })}
                      >
                        {status === 'draft' && <Clock size={16} />}
                        {status === 'coming_soon' && <AlertCircle size={16} />}
                        {status === 'published' && <CheckCircle2 size={16} />}
                        <span>{getStatusLabel(status)}</span>
                      </button>
                    ))}
                  </div>

                  {subj.quiz_status === 'draft' && (
                    <div className={styles.testerSection}>
                      <div className={styles.testerHeader}>
                        <Users size={14} />
                        <span>Acesso para Testadores</span>
                      </div>
                      <div className={styles.testerList}>
                        {testers.map(tester => {
                          const isSelected = (subj.quiz_tester_ids || []).includes(tester.id);
                          return (
                            <label key={tester.id} className={styles.testerItem}>
                              <input 
                                type="checkbox" 
                                className={styles.testerCheckbox}
                                checked={isSelected}
                                onChange={() => {
                                  const currentIds = subj.quiz_tester_ids || [];
                                  const newIds = isSelected 
                                    ? currentIds.filter(id => id !== tester.id)
                                    : [...currentIds, tester.id];
                                  handleUpdateStatus(subj.id, { quiz_tester_ids: newIds });
                                }}
                              />
                              <span>{tester.full_name || tester.username}</span>
                            </label>
                          );
                        })}
                        {testers.length === 0 && (
                          <div style={{ fontSize: '0.7rem', opacity: 0.3, textAlign: 'center', padding: '10px' }}>
                            Nenhum testador cadastrado.
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </>
      )}
    </div>
  );
};

export default ActivitiesManager;
