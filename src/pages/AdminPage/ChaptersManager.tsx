import React, { useState, useEffect } from 'react';
import { 
  Eye, 
  Edit3, 
  Plus, 
  GripVertical,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { ChapterService, DBChapter } from '@/services/chapterService';
import styles from './AdminPage.module.css';

const ChaptersManager: React.FC = () => {
  const [chapters, setChapters] = useState<DBChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadChapters();
  }, []);

  async function loadChapters() {
    try {
      const data = await ChapterService.getAll();
      setChapters(data);
    } catch (err) {
      console.error('Erro ao carregar capítulos:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(chapter: DBChapter) {
    const newStatus = chapter.status === 'published' ? 'draft' : 'published';
    try {
      // Otimismo na UI
      setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: newStatus } : c));
      await ChapterService.setStatus(chapter.id, newStatus);
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
      // Reverter se der erro
      setChapters(prev => prev.map(c => c.id === chapter.id ? { ...c, status: chapter.status } : c));
    }
  }

  const filteredChapters = chapters.filter(c => 
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <header className={styles.header}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h1 className={styles.title}>Gestão de Capítulos</h1>
            <p className={styles.subtitle}>Gerencie o conteúdo educativo e a jornada do Théo.</p>
          </div>
          <button className={styles.primaryBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Plus size={20} />
            Novo Capítulo
          </button>
        </div>
      </header>

      {/* Toolbar */}
      <div style={{ marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
        <div className={styles.glassPanel} style={{ flex: 1, padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Search size={20} color="rgba(255,255,255,0.4)" />
          <input 
            type="text" 
            placeholder="Buscar capítulo..." 
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
          <div style={{ padding: '3rem', textAlign: 'center' }}>Carregando dados galácticos...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Capítulo</th>
                <th>Status</th>
                <th>XP Award</th>
                <th>Última Edição</th>
                <th style={{ textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredChapters.map((chapter) => (
                <tr key={chapter.id}>
                  <td><GripVertical size={18} color="rgba(255,255,255,0.2)" /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <span style={{ fontSize: '1.5rem' }}>{chapter.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600 }}>{chapter.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>{chapter.subtitle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleStatus(chapter)}
                      className={`${styles.statusBadge} ${chapter.status === 'published' ? styles.statusPublished : styles.statusDraft}`}
                      style={{ border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      {chapter.status === 'published' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                      {chapter.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#FFD166' }}>
                      <span style={{ fontWeight: 700 }}>{chapter.xp_award}</span>
                      <span style={{ fontSize: '0.7rem' }}>XP</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)' }}>
                    Hoje, 10:45
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                      <button className={styles.actionBtn} title="Ver no App">
                        <Eye size={18} />
                      </button>
                      <button className={styles.actionBtn} title="Editar Conteúdo" style={{ color: '#00e5ff' }}>
                        <Edit3 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ChaptersManager;
