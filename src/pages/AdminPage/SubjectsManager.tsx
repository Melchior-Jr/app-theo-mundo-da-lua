import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search,
  CheckCircle2,
  Clock,
  Edit3,
  Trash2,
  AlertCircle,
  Box
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

  useEffect(() => {
    loadSubjects();
  }, []);

  async function loadSubjects() {
    try {
      const data = await AdminService.getSubjects();
      setSubjects(data);
    } catch (err) {
      console.error('Erro ao carregar matérias:', err);
    } finally {
      setLoading(false);
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
                <th>Status</th>
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
                    <div className={`${styles.statusBadge} ${
                      s.status === 'published' ? styles.statusPublished : 
                      s.status === 'coming_soon' ? styles.statusComing : styles.statusDraft
                    }`}>
                      {s.status === 'published' ? <CheckCircle2 size={12} /> : 
                       s.status === 'coming_soon' ? <AlertCircle size={12} /> : <Clock size={12} />}
                      {s.status === 'published' ? 'Publicado' : 
                       s.status === 'coming_soon' ? 'Em Breve' : 'Rascunho'}
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
                        title="Editar" 
                        style={{ color: '#00e5ff' }}
                        onClick={() => openEdit(s)}
                      >
                        <Edit3 size={18} />
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
    </div>
  );
};

export default SubjectsManager;
