import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Box,
  Cofee,
  Users,
  Eye,
  Settings2
} from 'lucide-react';
import { AdminService } from '@/services/adminService';
import { Subject } from '@/services/subjectService';
import styles from './AdminPage.module.css';

import { JourneyComposer } from './JourneyComposer';

const SubjectsManager: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isVisibilityModalOpen, setIsVisibilityModalOpen] = useState(false);
  const [subjectToManage, setSubjectToManage] = useState<Subject | null>(null);
  const [testers, setTesters] = useState<any[]>([]);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      const [subjectsData, testersData] = await Promise.all([
        AdminService.getSubjects(),
        AdminService.getTestersList()
      ]);
      setSubjects(subjectsData);
      setTesters(testersData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(subject: Subject, newStatus: 'draft' | 'published' | 'coming_soon') {
    try {
      await AdminService.updateSubjectStatus(subject.id, newStatus);
      setSubjects(prev => prev.map(s => s.id === subject.id ? { ...s, status: newStatus } : s));
    } catch (err) {
      alert('Erro ao atualizar status.');
    }
  }

  async function handleManageVisibility(subject: Subject) {
    setSubjectToManage(subject);
    setIsVisibilityModalOpen(true);
  }

  async function handleSaveVisibility(updates: any) {
    if (!subjectToManage) return;
    setIsSavingVisibility(true);
    try {
      await AdminService.updateSubjectStatus(subjectToManage.id, updates);
      await loadSubjects();
      setIsVisibilityModalOpen(false);
    } catch (err) {
      alert('Erro ao salvar configurações de visibilidade.');
    } finally {
      setIsSavingVisibility(false);
    }
  }

  async function handleSave(draft: any) {
    try {
      await AdminService.saveFullJourney(draft);
      await loadSubjects(); 
    } catch (err) {
      console.error('Erro ao salvar jornada completa:', err);
      throw err;
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir esta jornada? Todos os capítulos vinculados perderão a referência.')) return;
    
    try {
      await AdminService.deleteSubject(id);
      setSubjects(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Erro ao deletar matéria:', err);
      alert('Erro ao excluir jornada.');
    }
  }

  function openEdit(subject: Subject) {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  }

  function openCreate() {
    setSelectedSubject(null);
    setIsModalOpen(true);
  }

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className={styles.title}>Gestão de Jornadas</h1>
            <p className={styles.subtitle}>Gerencie as matérias e trilhas de conhecimento do motor Théo.</p>
          </div>
          <button 
            className={styles.primaryBtn} 
            onClick={openCreate}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Plus size={20} />
            Nova Jornada
          </button>
        </div>
      </header>

      {/* Grid de busca, lista e etc igual ao anterior */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div className={styles.glassPanel} style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="rgba(255,255,255,0.4)" />
          <input 
            type="text" 
            placeholder="Buscar jornada (Matemática, Astronomia...)" 
            className={styles.noneInput}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#fff', 
              outline: 'none', 
              width: '100%',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      <section className={styles.glassPanel}>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}>Sincronizando com o satélite...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Ícone</th>
                <th>Nome</th>
                <th>Slug</th>
                <th>Status Aula</th>
                <th>Status Quiz</th>
                <th>Cor Tema</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontSize: '1.2rem', color: s.theme_color }}>
                    {/* Aqui poderíamos renderizar o ícone do Lucide via string, 
                        mas por simplicidade visual usamos a cor */}
                    <Box size={24} />
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{s.name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {s.description}
                    </div>
                  </td>
                  <td>
                    <code style={{ background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
                      {s.slug}
                    </code>
                  </td>
                  <td>
                    <div 
                      className={`${styles.statusBadge} ${
                        s.status === 'published' ? styles.statusPublished : 
                        s.status === 'coming_soon' ? styles.statusComing : styles.statusDraft
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleManageVisibility(s)}
                    >
                      {s.status === 'published' ? <CheckCircle2 size={12} /> : 
                       s.status === 'coming_soon' ? <AlertCircle size={12} /> : <Clock size={12} />}
                      {s.status === 'published' ? 'Publicado' : 
                       s.status === 'coming_soon' ? 'Em Breve' : 'Rascunho'}
                    </div>
                  </td>
                  <td>
                    <div 
                      className={`${styles.statusBadge} ${
                        s.quiz_status === 'published' ? styles.statusPublished : 
                        s.quiz_status === 'coming_soon' ? styles.statusComing : styles.statusDraft
                      }`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleManageVisibility(s)}
                    >
                      {s.quiz_status === 'published' ? <CheckCircle2 size={12} /> : 
                       s.quiz_status === 'coming_soon' ? <AlertCircle size={12} /> : <Clock size={12} />}
                      {s.quiz_status === 'published' ? 'Publicado' : 
                       s.quiz_status === 'coming_soon' ? 'Em Breve' : 'Rascunho'}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: s.theme_color }} />
                      <span style={{ fontSize: '0.8rem', opacity: 0.6 }}>{s.theme_color}</span>
                    </div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button 
                        className={styles.actionBtn} 
                        title="Visibilidade" 
                        style={{ color: '#ffd700' }}
                        onClick={() => handleManageVisibility(s)}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        title="Estrutura" 
                        style={{ color: '#00e5ff' }}
                        onClick={() => openEdit(s)}
                      >
                        <Settings2 size={18} />
                      </button>
                      <button 
                        className={styles.actionBtn} 
                        title="Excluir" 
                        style={{ color: '#ff4b4b' }}
                        onClick={() => handleDelete(s.id)}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <JourneyComposer 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        subject={selectedSubject}
      />

      {/* Modal de Visibilidade */}
      {isVisibilityModalOpen && subjectToManage && (
        <VisibilityModal
          subject={subjectToManage}
          testers={testers}
          isSaving={isSavingVisibility}
          onClose={() => setIsVisibilityModalOpen(false)}
          onSave={handleSaveVisibility}
        />
      )}
    </div>
  );
};

interface VisibilityModalProps {
  subject: Subject;
  testers: any[];
  isSaving: boolean;
  onClose: () => void;
  onSave: (status: string, testerIds: string[]) => void;
}

const VisibilityModal: React.FC<VisibilityModalProps> = ({ subject, testers, isSaving, onClose, onSave }) => {
  const [status, setStatus] = useState(subject.status);
  const [selectedTesters, setSelectedTesters] = useState<string[]>(subject.tester_ids || []);
  
  const [quizStatus, setQuizStatus] = useState(subject.quiz_status || 'draft');
  const [selectedQuizTesters, setSelectedQuizTesters] = useState<string[]>(subject.quiz_tester_ids || []);

  const [activeTab, setActiveTab] = useState<'aula' | 'quiz'>('aula');

  const toggleTester = (id: string, type: 'aula' | 'quiz') => {
    if (type === 'aula') {
      setSelectedTesters(prev => 
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    } else {
      setSelectedQuizTesters(prev => 
        prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
      );
    }
  };

  const currentStatus = activeTab === 'aula' ? status : quizStatus;
  const currentTesters = activeTab === 'aula' ? selectedTesters : selectedQuizTesters;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 style={{ fontSize: '1.2rem' }}>Configurações de Visibilidade</h2>
            <p style={{ fontSize: '0.9rem', opacity: 0.6 }}>{subject.name}</p>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>×</button>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <button 
            onClick={() => setActiveTab('aula')}
            style={{ 
              flex: 1, padding: '1rem', background: 'none', border: 'none', color: activeTab === 'aula' ? '#00e5ff' : '#aaa',
              borderBottom: activeTab === 'aula' ? '2px solid #00e5ff' : 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Aulas / Jornada
          </button>
          <button 
            onClick={() => setActiveTab('quiz')}
            style={{ 
              flex: 1, padding: '1rem', background: 'none', border: 'none', color: activeTab === 'quiz' ? '#00e5ff' : '#aaa',
              borderBottom: activeTab === 'quiz' ? '2px solid #00e5ff' : 'none', cursor: 'pointer', fontWeight: 600
            }}
          >
            Quiz Intergaláctico
          </button>
        </div>
        
        <div className={styles.modalBody} style={{ padding: '1.5rem' }}>
          <section style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.6)' }}>
              Status d{activeTab === 'aula' ? 'a Aula' : 'o Quiz'}
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
              {(['draft', 'coming_soon', 'published'] as const).map(s => (
                <button
                  key={s}
                  className={`${styles.statusOption} ${currentStatus === s ? styles.statusActive : ''}`}
                  onClick={() => activeTab === 'aula' ? setStatus(s) : setQuizStatus(s)}
                  style={{
                    padding: '1rem 0.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)',
                    background: currentStatus === s ? 'rgba(0,229,255,0.2)' : 'rgba(255,255,255,0.05)',
                    color: currentStatus === s ? '#00e5ff' : '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem'
                  }}
                >
                  {s === 'draft' && <Clock size={20} />}
                  {s === 'coming_soon' && <AlertCircle size={20} />}
                  {s === 'published' && <CheckCircle2 size={20} />}
                  <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                    {s === 'draft' ? 'Rascunho' : s === 'coming_soon' ? 'Em Breve' : 'Publicado'}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {currentStatus === 'draft' && (
            <section>
              <h4 style={{ marginBottom: '1rem', color: 'rgba(255,255,255,0.6)', display: 'flex', justifyContent: 'space-between' }}>
                Testadores d{activeTab === 'aula' ? 'a Aula' : 'o Quiz'}
                <span style={{ fontSize: '0.7rem' }}>{currentTesters.length} selecionados</span>
              </h4>
              <div style={{ maxHeight: '180px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)', borderRadius: '8px', padding: '0.5rem' }}>
                {testers.map(tester => (
                  <label key={tester.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={currentTesters.includes(tester.id)}
                      onChange={() => toggleTester(tester.id, activeTab)}
                    />
                    <span style={{ fontSize: '0.9rem' }}>{tester.full_name || tester.username}</span>
                  </label>
                ))}
              </div>
            </section>
          )}
        </div>

        <div className={styles.modalFooter} style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button className={styles.secondaryBtn} onClick={onClose} disabled={isSaving}>Cancelar</button>
          <button 
            className={styles.primaryBtn} 
            onClick={() => onSave({
              status,
              tester_ids: selectedTesters,
              quiz_status: quizStatus,
              quiz_tester_ids: selectedQuizTesters
            })}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Tudo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubjectsManager;
