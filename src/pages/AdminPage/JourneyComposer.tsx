import React, { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  Plus, 
  ChevronRight, 
  BookOpen, 
  Type, 
  Info, 
  Link as LinkIcon, 
  Palette, 
  Layout,
  Target,
  Image as ImageIcon,
  Video,
  FileText,
  Trash2,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import styles from './JourneyComposer.module.css';
import { Subject } from '@/services/subjectService';
import { DBChapter, DBMission, ChapterService } from '@/services/chapterService';

interface JourneyComposerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  subject?: Subject | null;
}

interface FullChapter extends DBChapter {
  missions: DBMission[];
}

interface JourneyDraft {
  subject: Partial<Subject>;
  chapters: FullChapter[];
}

type SelectionType = 
  | { type: 'subject' }
  | { type: 'chapter', index: number }
  | { type: 'mission', chapterIndex: number, missionIndex: number };

export const JourneyComposer: React.FC<JourneyComposerProps> = ({
  isOpen,
  onClose,
  onSave,
  subject
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState<JourneyDraft | null>(null);
  const [selection, setSelection] = useState<SelectionType>({ type: 'subject' });

  // Carregar dados completos ao abrir para edição
  useEffect(() => {
    if (!isOpen) return;

    if (subject?.id) {
      loadFullJourney(subject);
    } else {
      // Inicializar nova jornada vazia
      setDraft({
        subject: {
          name: '',
          slug: '',
          description: '',
          icon: 'BookOpen',
          theme_color: '#00e5ff',
          order_index: 0,
          status: 'draft'
        },
        chapters: []
      });
      setSelection({ type: 'subject' });
    }
  }, [subject, isOpen]);

  async function loadFullJourney(s: Subject) {
    setLoading(true);
    try {
      // Admin v\u00ea todos os cap\u00edtulos, incluindo rascunhos (drafts)
      const chapters = await ChapterService.getBySubject(s.id, true);
      const chaptersWithMissions = await Promise.all(
        chapters.map(async (ch) => {
          const missions = await ChapterService.getMissions(ch.id);
          return { ...ch, missions };
        })
      );

      setDraft({
        subject: s,
        chapters: chaptersWithMissions
      });
    } catch (err) {
      console.error('Erro ao carregar jornada completa:', err);
      alert('Falha ao sincronizar dados da jornada.');
    } finally {
      setLoading(false);
    }
  }

  if (!isOpen || !draft) return null;

  // Handlers de UI
  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(draft);
      onClose();
    } catch (err) {
      console.error('Erro ao salvar jornada:', err);
    } finally {
      setSaving(false);
    }
  };

  const addChapter = () => {
    const newChapter: FullChapter = {
      id: `new-ch-${Date.now()}`,
      title: 'Novo Capítulo',
      subtitle: 'Subtítulo do capítulo',
      description: 'Descrição curta para o mapa',
      order: draft.chapters.length + 1,
      icon: 'Orbit',
      color: '#00e5ff',
      color_dim: '#004a52',
      color_bg: '#001a1d',
      path: '',
      intro: '',
      fun_fact: '',
      xp_award: 100,
      status: 'draft',
      is_coming_soon: false,
      missions: []
    };
    setDraft({ ...draft, chapters: [...draft.chapters, newChapter] });
    setSelection({ type: 'chapter', index: draft.chapters.length });
  };

  const addMission = (chIdx: number) => {
    const newMission: DBMission = {
      id: `new-mi-${Date.now()}`,
      chapter_id: draft.chapters[chIdx].id,
      description: 'Nova Missão',
      xp: 50,
      category: 'lesson'
    };
    const updatedChapters = [...draft.chapters];
    updatedChapters[chIdx].missions.push(newMission);
    setDraft({ ...draft, chapters: updatedChapters });
    setSelection({ type: 'mission', chapterIndex: chIdx, missionIndex: updatedChapters[chIdx].missions.length - 1 });
  };

  const removeChapter = (idx: number) => {
    if (!confirm('Excluir este capítulo e todas as suas missões?')) return;
    const updatedChapters = draft.chapters.filter((_, i) => i !== idx);
    setDraft({ ...draft, chapters: updatedChapters });
    setSelection({ type: 'subject' });
  };

  const removeMission = (chIdx: number, mIdx: number) => {
    const updatedChapters = [...draft.chapters];
    updatedChapters[chIdx].missions = updatedChapters[chIdx].missions.filter((_, i) => i !== mIdx);
    setDraft({ ...draft, chapters: updatedChapters });
    setSelection({ type: 'chapter', index: chIdx });
  };

  // Renderizadores de Editor
  const renderSubjectEditor = () => (
    <div className={styles.editorContainer}>
      <header className={styles.editorHeader}>
        <h2 className={styles.sectionTitle}><Layout size={24} color="#00e5ff" /> Configurações da Jornada</h2>
      </header>
      
      <div className={styles.editorSection}>
        <div className={styles.formGrid}>
          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}><Type size={14} /> Nome da Matéria</label>
            <input 
              className={styles.input}
              value={draft.subject.name}
              onChange={e => setDraft({ ...draft, subject: { ...draft.subject, name: e.target.value }})}
              placeholder="Ex: Português"
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}><LinkIcon size={14} /> Slug (URL)</label>
            <input 
              className={styles.input}
              value={draft.subject.slug}
              onChange={e => setDraft({ ...draft, subject: { ...draft.subject, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }})}
              placeholder="ex: portugues"
            />
          </div>
          <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
            <label className={styles.formGroupLabel}><Info size={14} /> Descrição principal</label>
            <textarea 
              className={`${styles.input} ${styles.textarea}`}
              value={draft.subject.description || ''}
              onChange={e => setDraft({ ...draft, subject: { ...draft.subject, description: e.target.value }})}
              placeholder="Descreva o objetivo desta trilha..."
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}><Palette size={14} /> Cor do Tema</label>
            <input 
              type="color"
              className={styles.input}
              value={draft.subject.theme_color || '#00e5ff'}
              onChange={e => setDraft({ ...draft, subject: { ...draft.subject, theme_color: e.target.value }})}
              style={{ height: '45px', padding: '4px' }}
            />
          </div>
          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}>Status</label>
            <select 
              className={styles.input}
              value={draft.subject.status}
              onChange={e => setDraft({ ...draft, subject: { ...draft.subject, status: e.target.value as any }})}
            >
              <option value="draft">Rascunho</option>
              <option value="published">Publicado</option>
              <option value="coming_soon">Em Breve</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderChapterEditor = (idx: number) => {
    const ch = draft.chapters[idx];
    if (!ch) return null;

    const updateCh = (updates: Partial<FullChapter>) => {
      const updatedChapters = [...draft.chapters];
      updatedChapters[idx] = { ...ch, ...updates };
      setDraft({ ...draft, chapters: updatedChapters });
    };

    return (
      <div className={styles.editorContainer}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className={styles.sectionTitle}><BookOpen size={24} color="#00e5ff" /> Editor de Capítulo</h2>
          <button onClick={() => removeChapter(idx)} className={styles.closeBtn} title="Remover Capítulo">
            <Trash2 size={20} />
          </button>
        </header>

        <div className={styles.editorSection}>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Título do Capítulo</label>
              <input 
                className={styles.input}
                value={ch.title}
                onChange={e => updateCh({ title: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Subtítulo</label>
              <input 
                className={styles.input}
                value={ch.subtitle}
                onChange={e => updateCh({ subtitle: e.target.value })}
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formGroupLabel}>Conteúdo da Introdução (Théo narra)</label>
              <textarea 
                className={`${styles.input} ${styles.textarea}`}
                value={ch.intro}
                onChange={e => updateCh({ intro: e.target.value })}
                placeholder="Olá astronauta! Neste capítulo vamos aprender..."
              />
            </div>
            <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
              <label className={styles.formGroupLabel}><Sparkles size={14} /> Curiosidade Espacial (Sabia que?)</label>
              <textarea 
                className={`${styles.input} ${styles.textarea}`}
                style={{ minHeight: '80px' }}
                value={ch.fun_fact}
                onChange={e => updateCh({ fun_fact: e.target.value })}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>Premiação em XP</label>
              <input 
                type="number"
                className={styles.input}
                value={ch.xp_award}
                onChange={e => updateCh({ xp_award: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMissionEditor = (chIdx: number, mIdx: number) => {
    const chapter = draft.chapters[chIdx];
    if (!chapter) return null;
    
    const mission = chapter.missions[mIdx];
    if (!mission) return null;

    const updateMission = (updates: Partial<DBMission>) => {
      const updatedChapters = [...draft.chapters];
      updatedChapters[chIdx].missions[mIdx] = { ...mission, ...updates };
      setDraft({ ...draft, chapters: updatedChapters });
    };

    const updateMetadata = (updates: any) => {
      const currentMetadata = (mission as any).metadata || {};
      updateMission({ 
        metadata: { ...currentMetadata, ...updates } 
      } as any);
    };

    const missionMeta = (mission as any).metadata || {};

    return (
      <div className={styles.editorContainer}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 className={styles.sectionTitle}><Target size={24} color="#00e5ff" /> Editor de Conteúdo (Missão)</h2>
          <button onClick={() => removeMission(chIdx, mIdx)} className={styles.closeBtn} title="Remover Missão">
            <Trash2 size={20} />
          </button>
        </header>

        <div className={styles.editorSection}>
          <div className={styles.formGroup} style={{ marginBottom: '20px' }}>
            <label className={styles.formGroupLabel}>Tipo de Atividade</label>
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { id: 'lesson', icon: <FileText size={16}/>, label: 'Lição' },
                { id: 'quiz', icon: <HelpCircle size={16}/>, label: 'Quiz' },
                { id: 'video', icon: <Video size={16}/>, label: 'Vídeo' },
                { id: 'media', icon: <ImageIcon size={16}/>, label: 'Mídia' },
              ].map(type => (
                <button
                  key={type.id}
                  className={`${styles.secondaryBtn} ${mission.category === type.id ? styles.treeItemActive : ''}`}
                  onClick={() => updateMission({ category: type.id })}
                  style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                >
                  {type.icon} {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.formGroupLabel}>Título / Descrição Curta</label>
            <input 
              className={styles.input}
              value={mission.description}
              onChange={e => updateMission({ description: e.target.value })}
              placeholder="Ex: Identificando a letra A"
            />
          </div>

          {(mission.category === 'media' || mission.category === 'video') && (
            <div className={styles.formGrid} style={{ marginTop: '20px' }}>
              <div className={styles.formGroup} style={{ gridColumn: 'span 2' }}>
                <label className={styles.formGroupLabel}>URL da Mídia (Imagem ou Vídeo YouTube/Vimeo)</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    className={styles.input}
                    style={{ flex: 1 }}
                    value={missionMeta.media_url || ''}
                    onChange={e => updateMetadata({ media_url: e.target.value })}
                    placeholder="https://..."
                  />
                  {missionMeta.media_url && (
                    <div className={styles.input} style={{ width: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0' }}>
                      <ImageIcon size={18} />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className={styles.formGrid} style={{ marginTop: '20px' }}>
            <div className={styles.formGroup}>
              <label className={styles.formGroupLabel}>XP ao Concluir</label>
              <input 
                type="number"
                className={styles.input}
                value={mission.xp}
                onChange={e => updateMission({ xp: parseInt(e.target.value) })}
              />
            </div>
          </div>
        </div>

        {mission.category === 'quiz' && (
          <div className={styles.editorSection}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 className={styles.sectionTitle} style={{ fontSize: '1rem', margin: 0 }}>
                <HelpCircle size={18} /> Perguntas do Quiz
              </h3>
              <button 
                className={styles.secondaryBtn} 
                style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                onClick={() => {
                  const currentQuestions = missionMeta.questions || [];
                  updateMetadata({ 
                    questions: [...currentQuestions, { 
                      id: Date.now().toString(), 
                      question: 'Nova pergunta?', 
                      options: ['', '', '', ''], 
                      correct: 0 
                    }] 
                  });
                }}
              >
                <Plus size={14} /> Add Pergunta
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {(missionMeta.questions || []).map((q: any, qIdx: number) => (
                <div key={q.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <span style={{ opacity: 0.3, fontWeight: 'bold' }}>#{qIdx + 1}</span>
                    <input 
                      className={styles.noneInput}
                      style={{ background: 'none', border: 'none', color: '#fff', outline: 'none', flex: 1, fontSize: '0.95rem' }}
                      value={q.question}
                      onChange={e => {
                        const qs = [...missionMeta.questions];
                        qs[qIdx].question = e.target.value;
                        updateMetadata({ questions: qs });
                      }}
                      placeholder="Qual o nome da nossa galáxia?"
                    />
                    <button 
                      onClick={() => {
                        const qs = missionMeta.questions.filter((_: any, i: number) => i !== qIdx);
                        updateMetadata({ questions: qs });
                      }}
                      style={{ background: 'none', border: 'none', color: 'rgba(255,40,40,0.4)', cursor: 'pointer' }}
                    >
                      <X size={14} />
                    </button>
                  </div>
                  <div className={styles.formGrid} style={{ gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {q.options.map((opt: string, oIdx: number) => (
                      <div key={oIdx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                         <input 
                          type="radio" 
                          checked={q.correct === oIdx}
                          onChange={() => {
                            const qs = [...missionMeta.questions];
                            qs[qIdx].correct = oIdx;
                            updateMetadata({ questions: qs });
                          }}
                        />
                        <input 
                          className={styles.input}
                          style={{ padding: '8px 12px', fontSize: '0.85rem', flex: 1 }}
                          value={opt}
                          onChange={e => {
                            const qs = [...missionMeta.questions];
                            qs[qIdx].options[oIdx] = e.target.value;
                            updateMetadata({ questions: qs });
                          }}
                          placeholder={`Opção ${oIdx + 1}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              {(missionMeta.questions?.length === 0 || !missionMeta.questions) && (
                <div style={{ textAlign: 'center', padding: '20px', opacity: 0.4, fontSize: '0.85rem', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '12px' }}>
                  Nenhuma pergunta adicionada. Clique em "Add Pergunta" para começar.
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.overlay}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <button onClick={onClose} className={styles.closeBtn}><X size={24} /></button>
          <div className={styles.headerTitle}>
            {subject ? 'Editando Journey Composer' : 'Criando Nova Jornada'} / 
            <span style={{ color: '#00e5ff', marginLeft: '8px' }}>{draft.subject.name || 'Sem Título'}</span>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={onClose}>Cancelar</button>
          <button className={styles.primaryBtn} onClick={handleSave} disabled={saving}>
            <Save size={18} />
            {saving ? 'Guardando...' : 'Salvar Alterações'}
          </button>
        </div>
      </header>

      <div className={styles.composerBody}>
        <aside className={styles.sidebar}>
          <div className={styles.treeScroll}>
            {/* Subject Node */}
            <div 
              className={`${styles.treeItem} ${selection.type === 'subject' ? styles.treeItemActive : ''}`}
              onClick={() => setSelection({ type: 'subject' })}
            >
              <Layout size={18} />
              <span className={styles.chapterTitle}>Configs da Jornada</span>
            </div>

            {/* Chapters */}
            <div style={{ marginTop: '12px' }}>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase', padding: '0 12px 8px' }}>
                Capítulos
              </div>
              {draft.chapters.map((ch, chIdx) => (
                <div key={ch.id}>
                  <div 
                    className={`${styles.treeItem} ${selection.type === 'chapter' && selection.index === chIdx ? styles.treeItemActive : ''}`}
                    onClick={() => setSelection({ type: 'chapter', index: chIdx })}
                  >
                    <ChevronRight size={16} style={{ transition: 'transform 0.2s', transform: (selection.type === 'chapter' && selection.index === chIdx) || (selection.type === 'mission' && selection.chapterIndex === chIdx) ? 'rotate(90deg)' : 'none' }} />
                    <BookOpen size={16} />
                    <span className={styles.chapterTitle}>{ch.title}</span>
                  </div>

                  {/* Missions (Inline tree) */}
                  {((selection.type === 'chapter' && selection.index === chIdx) || (selection.type === 'mission' && selection.chapterIndex === chIdx)) && (
                    <div style={{ borderLeft: '1px solid rgba(255,255,255,0.1)', marginLeft: '20px' }}>
                      {ch.missions.map((m, mIdx) => (
                        <div 
                          key={m.id}
                          className={`${styles.treeItem} ${styles.missionItem} ${selection.type === 'mission' && selection.chapterIndex === chIdx && selection.missionIndex === mIdx ? styles.treeItemActive : ''}`}
                          onClick={() => setSelection({ type: 'mission', chapterIndex: chIdx, missionIndex: mIdx })}
                        >
                          {m.category === 'quiz' ? <HelpCircle size={14} /> : <FileText size={14} />}
                          <span className={styles.chapterTitle}>{m.description || 'Sem descrição'}</span>
                        </div>
                      ))}
                      <button className={styles.addBtn} onClick={() => addMission(chIdx)} style={{ border: 'none', background: 'none', justifyContent: 'flex-start', paddingLeft: '32px' }}>
                        <Plus size={14} /> Nova Missão
                      </button>
                    </div>
                  )}
                </div>
              ))}
              <button className={styles.addBtn} onClick={addChapter}>
                <Plus size={18} /> Adicionar Capítulo
              </button>
            </div>
          </div>
        </aside>

        <main className={styles.mainContent}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '100px' }}>
              <div className="loader" />
              <p style={{ opacity: 0.5 }}>Sincronizando portal de edição...</p>
            </div>
          ) : (
            <>
              {selection.type === 'subject' && renderSubjectEditor()}
              {selection.type === 'chapter' && renderChapterEditor(selection.index)}
              {selection.type === 'mission' && renderMissionEditor(selection.chapterIndex, selection.missionIndex)}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
