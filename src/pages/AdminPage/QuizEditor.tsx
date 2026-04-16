import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Plus, Trash2, Copy, Check, Filter, Volume2, Play, Mic, Music, Globe, Clock, AlertCircle, CheckCircle2, Users } from 'lucide-react';
import { ALL_QUIZ_DATA } from '@/data/quizQuestions';
import { QuizQuestion, QuizQuestionType } from '@/types/quiz';
import styles from './JourneyComposer.module.css';
import { AdminService } from '@/services/adminService';
import { Subject } from '@/services/subjectService';

interface QuizEditorProps {
  onBack: () => void;
}

const QUESTION_TYPES: { value: QuizQuestionType; label: string }[] = [
  { value: 'multiple-choice', label: 'Múltipla Escolha' },
  { value: 'true-false', label: 'Verdadeiro ou Falso' },
  { value: 'drag-drop-order', label: 'Ordenar (Arrastar)' },
  { value: 'drag-drop-match', label: 'Associar (Arrastar)' },
  { value: 'image-id', label: 'Identificação por Imagem' },
  { value: 'fast-response', label: 'Resposta Rápida (Tempo)' },
  { value: 'fill-blanks', label: 'Preencher Lacunas' },
  { value: 'scene-selection', label: 'Seleção em Cena' },
  { value: 'audio-guess', label: 'Adivinhe o Áudio' },
  { value: 'logical-sequence', label: 'Sequência Lógica' },
];

const QuizEditor: React.FC<QuizEditorProps> = ({ onBack }) => {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<'astronomy' | 'geosciences'>('astronomy');
  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [selectedChallenge, setSelectedChallenge] = useState<number>(1);
  const [copied, setCopied] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState<string | null>(null); // "ID_field"
  const [recordingId, setRecordingId] = useState<string | null>(null); // "ID_field"
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [testers, setTesters] = useState<any[]>([]);
  const [isSavingVisibility, setIsSavingVisibility] = useState(false);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const [dbQuestions, subjectsData, testersData] = await Promise.all([
        AdminService.getQuizQuestions(),
        AdminService.getSubjects(),
        AdminService.getTestersList()
      ]);
      
      setSubjects(subjectsData);
      setTesters(testersData);

      // Sempre começamos com os dados locais
      const localData = JSON.parse(JSON.stringify(ALL_QUIZ_DATA));
      
      if (dbQuestions && dbQuestions.length > 0) {
        // Mescla: O que está no banco sobrescreve o local
        const merged = [...localData];
        dbQuestions.forEach(dbQ => {
          const idx = merged.findIndex(q => q.id === dbQ.id);
          if (idx !== -1) {
            merged[idx] = dbQ;
          } else {
            merged.push(dbQ);
          }
        });
        setQuestions(merged);
      } else {
        setQuestions(localData);
      }
    };
    loadData();
  }, []);

  const currentSubjectObj = subjects.find(s => s.slug === (selectedSubject === 'astronomy' ? 'astronomia' : 'geociencias'));

  const handleUpdateVisibility = async (status: string, testerIds: string[]) => {
    if (!currentSubjectObj) return;
    setIsSavingVisibility(true);
    try {
      await AdminService.updateSubjectStatus(currentSubjectObj.id, {
        quiz_status: status as any,
        quiz_tester_ids: testerIds
      });
      // Recarrega apenas subjects
      const updated = await AdminService.getSubjects();
      setSubjects(updated);
    } catch (err) {
      alert('Erro ao atualizar visibilidade.');
    } finally {
      setIsSavingVisibility(false);
    }
  };

  const filteredQuestions = questions.filter(
    (q) => (q.subject || 'astronomy') === selectedSubject && q.level === selectedLevel && q.challenge === selectedChallenge
  );

  const updateQuestion = (id: string, updates: Partial<QuizQuestion>) => {
    setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, ...updates } : q)));
  };

  const handleFileUpload = async (id: string, field: 'audio' | 'explanationAudio', file: File) => {
    setIsUploading(`${id}_${field}`);
    try {
      const ext = file.name.split('.').pop();
      const fileName = `${id}_${field}_${Date.now()}.${ext}`;
      
      const result = await AdminService.uploadFile('quiz-assets', `narration/${fileName}`, file);
      
      if (typeof result === 'string') {
        updateQuestion(id, { [field]: result });
      } else {
        // Agora result contém a mensagem de erro se falhar
        alert(`Erro no Upload: ${result || 'Falha desconhecida'}\n\nCertifique-se que:\n1. O bucket "quiz-assets" é PÚBLICO.\n2. Existem políticas (RLS) que permitem INSERT para o seu usuário.`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
    } finally {
      setIsUploading(null);
    }
  };

  const startRecording = async (id: string, field: 'audio' | 'explanationAudio') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/mp3' });
        const file = new File([audioBlob], `recording.mp3`, { type: 'audio/mp3' });
        await handleFileUpload(id, field, file);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecordingId(`${id}_${field}`);
    } catch (err) {
      console.error('Falha ao acessar microfone:', err);
      alert('Não foi possível acessar seu microfone.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setRecordingId(null);
    }
  };

  const addQuestion = () => {
    const newQuestion: QuizQuestion = {
      id: `q_new_${Date.now()}`,
      subject: selectedSubject,
      level: selectedLevel,
      challenge: selectedChallenge,
      type: 'multiple-choice',
      question: 'Nova pergunta...',
      options: ['Opção 1', 'Opção 2', 'Opção 3', 'Opção 4'],
      correctAnswer: 'Opção 1',
      explanation: 'Explicação detalhada...',
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    if (window.confirm("Deseja realmente excluir esta pergunta?")) {
      setQuestions((prev) => prev.filter((q) => q.id !== id));
    }
  };

  const handleExportJSON = () => {
    const jsonString = JSON.stringify(questions, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveToCloud = async () => {
    try {
      setIsSaving(true);
      // Salva apenas as perguntas do filtro em questão, ou todas as perguntas gerenciadas
      // Normalmente o professor quer salvar o trabalho de todas as alterações feitas na memória
      const success = await AdminService.saveQuizQuestions(questions);
      if (success) {
        alert("✅ Que massa! Suas perguntas foram salvas no servidor da base (Supabase) com sucesso!");
      } else {
        alert("❌ Poxa... Houve um erro ao salvar as perguntas. Tente de novo.");
      }
    } catch (e) {
      console.error(e);
      alert("❌ Ocorreu um erro inesperado de conexão.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className={styles.overlay} style={{ position: 'relative', zIndex: 1, minHeight: '100%', height: 'calc(100vh - 120px)' }}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <button className={styles.closeBtn} onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className={styles.headerTitle} style={{ fontSize: '1.25rem' }}>Editor do Quiz Intergaláctico</h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', margin: 0 }}>Gerencie as perguntas, respostas e explicações de todas as fases.</p>
          </div>
        </div>
        <div className={styles.headerActions}>
          <button className={styles.secondaryBtn} onClick={handleExportJSON} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {copied ? <Check size={18} color="#10b981" /> : <Copy size={18} />}
            {copied ? 'Copiado!' : 'Exportar JSON'}
          </button>
          <button 
            className={styles.primaryBtn} 
            onClick={handleSaveToCloud}
            disabled={isSaving}
            style={{ opacity: isSaving ? 0.7 : 1, cursor: isSaving ? 'wait' : 'pointer' }}
          >
            <Save size={18} />
            {isSaving ? 'Salvando Nuvem...' : 'Salvar no Servidor'}
          </button>
        </div>
      </div>

      <div className={styles.composerBody}>
        {/* Sidebar Filters */}
        <div className={styles.sidebar}>
          <div className={styles.treeScroll}>
            <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
              <Filter size={16} color="#00e5ff" />
              Filtros
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', fontWeight: 500 }}>Corpo Celeste / Matéria</label>
              <select
                className={styles.input}
                style={{ width: '100%' }}
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value as 'astronomy' | 'geosciences')}
              >
                <option value="astronomy">Astronomia</option>
                <option value="geosciences">Geociências</option>
              </select>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', fontWeight: 500 }}>Nível</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[1, 2, 3, 4, 5, 8, 9].map((lvl) => {
                  // Ocultar níveis 8 e 9 na Astronomia, ou 1 a 5 nas Geociências se quisermos ser restritos, mas vamos exibir em grid p/ todos
                  return (
                    <button
                      key={lvl}
                      className={`${styles.treeItem} ${lvl === selectedLevel ? styles.treeItemActive : ''}`}
                      style={{ flex: '1 1 calc(33% - 0.5rem)', justifyContent: 'center', marginBottom: 0, padding: '0.5rem' }}
                      onClick={() => setSelectedLevel(lvl)}
                    >
                      {lvl}
                    </button>
                  );
                })}
              </div>
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'rgba(255,255,255,0.6)', marginBottom: '0.75rem', fontWeight: 500 }}>Desafio</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {[1, 2, 3, 4].map((chal) => (
                  <button
                    key={chal}
                    className={`${styles.treeItem} ${chal === selectedChallenge ? styles.treeItemActive : ''}`}
                    style={{ flex: '1 1 calc(50% - 0.5rem)', justifyContent: 'center', marginBottom: 0, padding: '0.5rem' }}
                    onClick={() => setSelectedChallenge(chal)}
                  >
                    {chal}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '3rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '2rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '1.5rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                <Globe size={16} color="#ffd166" />
                Visibilidade
              </h3>

              {!currentSubjectObj ? (
                <div style={{ fontSize: '0.8rem', opacity: 0.5 }}>Carregando dados de visibilidade...</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {(['draft', 'coming_soon', 'published'] as const).map((status) => (
                    <button
                      key={status}
                      className={styles.treeItem}
                      onClick={() => handleUpdateVisibility(status, currentSubjectObj.quiz_tester_ids || [])}
                      disabled={isSavingVisibility}
                      style={{
                        padding: '0.75rem',
                        borderColor: currentSubjectObj.quiz_status === status ? '#ffd166' : 'transparent',
                        background: currentSubjectObj.quiz_status === status ? 'rgba(255, 209, 102, 0.1)' : 'transparent',
                        color: currentSubjectObj.quiz_status === status ? '#ffd166' : 'rgba(255,255,255,0.6)',
                        height: 'auto',
                        flexDirection: 'row',
                        marginBottom: '4px'
                      }}
                    >
                      {status === 'draft' && <Clock size={16} />}
                      {status === 'coming_soon' && <AlertCircle size={16} />}
                      {status === 'published' && <CheckCircle2 size={16} />}
                      <span style={{ fontWeight: 600 }}>
                        {status === 'draft' ? 'Rascunho' : status === 'coming_soon' ? 'Em Breve' : 'Publicado'}
                      </span>
                    </button>
                  ))}

                  {currentSubjectObj.quiz_status === 'draft' && (
                    <div style={{ marginTop: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '0.75rem' }}>
                        <Users size={14} color="rgba(255,255,255,0.4)" />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', fontWeight: 600 }}>TESTADORES</span>
                      </div>
                      <div style={{ 
                        maxHeight: '150px', 
                        overflowY: 'auto', 
                        background: 'rgba(0,0,0,0.2)', 
                        borderRadius: '8px',
                        padding: '4px'
                      }}>
                        {testers.map(tester => {
                          const isSelected = (currentSubjectObj.quiz_tester_ids || []).includes(tester.id);
                          return (
                            <label key={tester.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', cursor: 'pointer', borderRadius: '4px' }}>
                              <input 
                                type="checkbox" 
                                checked={isSelected}
                                onChange={() => {
                                  const currentIds = currentSubjectObj.quiz_tester_ids || [];
                                  const newIds = isSelected 
                                    ? currentIds.filter(id => id !== tester.id)
                                    : [...currentIds, tester.id];
                                  handleUpdateVisibility(currentSubjectObj.quiz_status || 'draft', newIds);
                                }}
                                style={{ accentColor: '#ffd166' }}
                              />
                              <span style={{ fontSize: '0.8rem', opacity: isSelected ? 1 : 0.5 }}>{tester.full_name || tester.username}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className={styles.mainContent}>
          <div className={styles.editorContainer}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 className={styles.sectionTitle} style={{ margin: 0 }}>
                Perguntas da Etapa
                <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'rgba(255,255,255,0.4)' }}>
                  (Nível {selectedLevel} - Desafio {selectedChallenge})
                </span>
              </h3>
              <button className={styles.secondaryBtn} onClick={addQuestion} style={{ display: 'flex', gap: '8px', alignItems: 'center', borderColor: '#00e5ff', color: '#00e5ff' }}>
                <Plus size={16} />
                Nova Pergunta
              </button>
            </div>

            {filteredQuestions.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'rgba(0, 229, 255, 0.02)', borderRadius: '16px', border: '1px dashed rgba(0, 229, 255, 0.2)' }}>
                <div style={{ color: 'rgba(255,255,255,0.5)', marginBottom: '1rem' }}>Nenhuma pergunta encontrada para este filtro.</div>
                <button className={styles.primaryBtn} onClick={addQuestion} style={{ margin: '0 auto' }}>
                  <Plus size={18} /> Adicionar a Primeira
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {filteredQuestions.map((q, index) => (
                  <div key={q.id} className={styles.editorSection} style={{ padding: 0, overflow: 'hidden' }}>
                    {/* Card Header */}
                    <div style={{ padding: '16px 24px', background: 'rgba(0,0,0,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{ background: '#00e5ff', color: '#000', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.85rem' }}>
                          {index + 1}
                        </span>
                        <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', fontFamily: 'monospace' }}>{q.id}</span>
                      </div>
                      <button className={styles.closeBtn} onClick={() => removeQuestion(q.id)} title="Excluir Pergunta">
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Card Body */}
                    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
                      {/* Linha 1: Tipo de Pergunta e Tempo */}
                      <div className={styles.formGrid}>
                        <div className={styles.formGroup}>
                          <label className={styles.formGroupLabel}>Tipo da Pergunta</label>
                          <select
                            className={styles.input}
                            value={q.type}
                            onChange={(e) => updateQuestion(q.id, { type: e.target.value as QuizQuestionType })}
                          >
                            {QUESTION_TYPES.map((type) => (
                              <option key={type.value} value={type.value}>{type.label}</option>
                            ))}
                          </select>
                        </div>
                        <div className={styles.formGroup}>
                          <label className={styles.formGroupLabel}>Limite de Tempo <span style={{opacity: 0.5}}>(segundos)</span></label>
                          <input
                            type="number"
                            className={styles.input}
                            value={q.timeLimit || ''}
                            placeholder="Deixe em branco p/ padrão"
                            onChange={(e) => updateQuestion(q.id, { timeLimit: e.target.value ? parseInt(e.target.value) : undefined })}
                          />
                        </div>
                      </div>

                      {/* Linha 2: Texto da Pergunta */}
                      <div className={styles.formGroup}>
                        <label className={styles.formGroupLabel} style={{ color: '#fff', fontSize: '0.95rem', marginBottom: '4px' }}>Enunciado da Pergunta</label>
                        <textarea
                          className={styles.textarea}
                          style={{ 
                            minHeight: '100px', 
                            fontSize: '1.1rem', 
                            fontWeight: 500, 
                            lineHeight: '1.5',
                            padding: '16px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.2)',
                            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)',
                            color: '#ffffff'
                          }}
                          value={q.question}
                          onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                          placeholder="Ex: Como é chamada a rocha derretida quando ela atinge a superfície da Terra?"
                        />
                      </div>

                      {/* Linha 3: Opções ou Itens */}
                      {q.type === 'multiple-choice' && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <label className={styles.formGroupLabel} style={{ color: '#f7c762', marginBottom: '16px' }}>
                            Opções de Resposta
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>(Marque a bolinha da opção correta)</span>
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(q.options || []).map((opt, optIndex) => (
                              <div key={optIndex} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <input
                                  type="radio"
                                  name={`correct_${q.id}`}
                                  checked={q.correctAnswer === opt}
                                  onChange={() => updateQuestion(q.id, { correctAnswer: opt })}
                                  style={{ accentColor: '#00e5ff', width: '20px', height: '20px', cursor: 'pointer' }}
                                />
                                <input
                                  type="text"
                                  className={styles.input}
                                  value={opt}
                                  onChange={(e) => {
                                    let newOpts = [...(q.options || [])];
                                    newOpts[optIndex] = e.target.value;
                                    let newCorrect = q.correctAnswer;
                                    if (q.correctAnswer === opt) newCorrect = e.target.value;
                                    updateQuestion(q.id, { options: newOpts, correctAnswer: newCorrect });
                                  }}
                                  style={{ flex: 1, borderColor: q.correctAnswer === opt ? 'rgba(0, 229, 255, 0.5)' : 'rgba(255,255,255,0.1)' }}
                                />
                                <button
                                  className={styles.closeBtn}
                                  style={{ background: 'rgba(255,255,255,0.05)' }}
                                  onClick={() => {
                                    let newOpts = [...(q.options || [])];
                                    newOpts.splice(optIndex, 1);
                                    let newCorrect = q.correctAnswer;
                                    if (q.correctAnswer === opt) newCorrect = '';
                                    updateQuestion(q.id, { options: newOpts, correctAnswer: newCorrect });
                                  }}
                                  disabled={(q.options || []).length <= 2}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              className={styles.addBtn}
                              onClick={() => {
                                let newOpts = [...(q.options || []), `Nova Opção ${(q.options?.length || 0) + 1}`];
                                updateQuestion(q.id, { options: newOpts });
                              }}
                            >
                              <Plus size={16} /> Adicionar Opção
                            </button>
                          </div>
                        </div>
                      )}

                      {q.type === 'true-false' && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <label className={styles.formGroupLabel} style={{ color: '#f7c762', marginBottom: '16px' }}>
                            Verdadeiro ou Falso
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>(Edite os rótulos e selecione o correto)</span>
                          </label>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                            {[0, 1].map((idx) => {
                              // Garantir que existam ao menos 2 opções
                              const currentOptions = q.options || ['Verdadeiro', 'Falso'];
                              const opt = currentOptions[idx] || (idx === 0 ? 'Verdadeiro' : 'Falso');
                              
                              return (
                                <div 
                                  key={idx} 
                                  className={styles.input} 
                                  style={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    gap: '12px',
                                    padding: '12px',
                                    cursor: 'pointer',
                                    background: q.correctAnswer === opt ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
                                    borderColor: q.correctAnswer === opt ? '#00e5ff' : 'rgba(255,255,255,0.1)'
                                  }}
                                  onClick={() => updateQuestion(q.id, { correctAnswer: opt, options: currentOptions })}
                                >
                                  <input
                                    type="radio"
                                    name={`tf_correct_${q.id}`}
                                    checked={q.correctAnswer === opt}
                                    onChange={() => {}} // dummy to avoid warning, controlled by div onClick
                                    style={{ accentColor: '#00e5ff', width: '20px', height: '20px' }}
                                  />
                                  <input
                                    type="text"
                                    className={styles.input}
                                    style={{ 
                                      background: 'none', 
                                      border: 'none', 
                                      padding: 0, 
                                      margin: 0, 
                                      color: q.correctAnswer === opt ? '#fff' : 'rgba(255,255,255,0.6)',
                                      fontWeight: q.correctAnswer === opt ? 'bold' : 'normal',
                                      flex: 1
                                    }}
                                    value={opt}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      let newOpts = [...currentOptions];
                                      const oldOpt = newOpts[idx];
                                      newOpts[idx] = e.target.value;
                                      
                                      let updates: Partial<QuizQuestion> = { options: newOpts };
                                      if (q.correctAnswer === oldOpt) {
                                        updates.correctAnswer = e.target.value;
                                      }
                                      updateQuestion(q.id, updates);
                                    }}
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {q.type === 'drag-drop-order' && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <label className={styles.formGroupLabel} style={{ color: '#f7c762', marginBottom: '16px' }}>
                            Itens para Ordenar
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>(Adicione os itens na ORDEM CORRETA, o jogo irá embaralhá-los depois)</span>
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(q.items || []).map((item, itemIdx) => (
                              <div key={itemIdx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                <span style={{ color: 'rgba(255,255,255,0.3)' }}>{itemIdx + 1}º</span>
                                <input
                                  type="text"
                                  className={styles.input}
                                  value={item.label}
                                  onChange={(e) => {
                                    let newItems = [...(q.items || [])];
                                    newItems[itemIdx] = { ...newItems[itemIdx], label: e.target.value };
                                    const newCorrect = newItems.map(i => i.id);
                                    updateQuestion(q.id, { items: newItems, correctAnswer: newCorrect });
                                  }}
                                  style={{ flex: 1 }}
                                />
                                <button
                                  className={styles.closeBtn}
                                  style={{ background: 'rgba(255,255,255,0.05)' }}
                                  onClick={() => {
                                    let newItems = [...(q.items || [])];
                                    newItems.splice(itemIdx, 1);
                                    const newCorrect = newItems.map(i => i.id);
                                    updateQuestion(q.id, { items: newItems, correctAnswer: newCorrect });
                                  }}
                                  disabled={(q.items || []).length <= 2}
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            ))}
                            <button
                              className={styles.addBtn}
                              onClick={() => {
                                const newId = `item_${Date.now()}`;
                                let newItems = [...(q.items || []), { id: newId, label: `Novo Item ${(q.items?.length || 0) + 1}` }];
                                const newCorrect = newItems.map(i => i.id);
                                updateQuestion(q.id, { items: newItems, correctAnswer: newCorrect });
                              }}
                            >
                              <Plus size={16} /> Adicionar Item de Ordenação
                            </button>
                          </div>
                        </div>
                      )}

                      {q.type === 'drag-drop-match' && (
                        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                          <label className={styles.formGroupLabel} style={{ color: '#f7c762', marginBottom: '16px' }}>
                            Pares para Associação
                            <span style={{ fontSize: '0.75rem', fontWeight: 400, opacity: 0.7 }}>(Escreva os itens que correspondem lado a lado)</span>
                          </label>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            {(q.items || []).filter(i => i.matchId).map((item, itemIdx) => {
                              const matchItem = q.items?.find(i => i.id === item.matchId);
                              
                              return (
                                <div key={itemIdx} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                                  <input
                                    type="text"
                                    className={styles.input}
                                    value={item.label}
                                    placeholder="Item A (Lado Esquerdo)"
                                    onChange={(e) => {
                                      let newItems = [...(q.items || [])];
                                      const idx = newItems.findIndex(i => i.id === item.id);
                                      if (idx !== -1) newItems[idx].label = e.target.value;
                                      updateQuestion(q.id, { items: newItems });
                                    }}
                                    style={{ flex: 1 }}
                                  />
                                  <span style={{ color: 'rgba(255,255,255,0.5)' }}>⇄</span>
                                  <input
                                    type="text"
                                    className={styles.input}
                                    value={matchItem ? matchItem.label : ''}
                                    placeholder="Item B (Lado Direito)"
                                    onChange={(e) => {
                                      let newItems = [...(q.items || [])];
                                      const idx = newItems.findIndex(i => i.id === item.matchId);
                                      if (idx !== -1) newItems[idx].label = e.target.value;
                                      updateQuestion(q.id, { items: newItems });
                                    }}
                                    style={{ flex: 1 }}
                                  />
                                  <button
                                    className={styles.closeBtn}
                                    style={{ background: 'rgba(255,255,255,0.05)' }}
                                    onClick={() => {
                                      let newItems = (q.items || []).filter(i => i.id !== item.id && i.id !== item.matchId);
                                      updateQuestion(q.id, { items: newItems });
                                    }}
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              );
                            })}
                            
                            <button
                              className={styles.addBtn}
                              onClick={() => {
                                const idA = `itemA_${Date.now()}`;
                                const idB = `itemB_${Date.now()}`;
                                let newItems = [
                                  ...(q.items || []), 
                                  { id: idA, label: 'Item A', matchId: idB },
                                  { id: idB, label: 'Item correspondente', matchId: idA }
                                ];
                                updateQuestion(q.id, { items: newItems });
                              }}
                            >
                              <Plus size={16} /> Adicionar Par de Associação
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Linha 4: Explicação */}
                      <div className={styles.formGroup} style={{ marginTop: '8px' }}>
                        <label className={styles.formGroupLabel} style={{ color: '#00e5ff', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem' }}>
                          <span style={{ fontSize: '1.2rem' }}>🧑‍🚀</span> Explicação do Théo (Exibida pós-resposta)
                        </label>
                        <div style={{ position: 'relative' }}>
                          <textarea
                            className={styles.textarea}
                            style={{ 
                              minHeight: '90px', 
                              width: '100%',
                              padding: '16px 16px 16px 48px',
                              background: 'linear-gradient(145deg, rgba(0, 229, 255, 0.05), rgba(0,0,0,0.3))',
                              border: '1px solid rgba(0, 229, 255, 0.2)',
                              borderLeft: '4px solid #00e5ff',
                              borderRadius: '12px',
                              fontSize: '0.95rem',
                              lineHeight: '1.6',
                              color: 'rgba(255, 255, 255, 0.9)'
                            }}
                            value={q.explanation}
                            onChange={(e) => updateQuestion(q.id, { explanation: e.target.value })}
                            placeholder="Théo diz: Uau, isso mesmo! Porque..."
                          />
                          <div style={{ position: 'absolute', top: '16px', left: '16px', opacity: 0.5, pointerEvents: 'none' }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00e5ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Linha 5: Narração e Áudio */}
                      <div className={styles.formGroup} style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                        <label className={styles.formGroupLabel} style={{ color: '#ffac2d', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.9rem', marginBottom: '16px' }}>
                          <Volume2 size={18} /> Narração Intergaláctica
                        </label>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                          {/* Áudio da Pergunta */}
                          <div style={{ background: 'rgba(255,172,45,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,172,45,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: '#ffac2d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Mic size={14} /> Áudio do Enunciado
                              </span>
                              {q.audio && (
                                <button 
                                  onClick={() => new Audio(q.audio).play()}
                                  style={{ background: '#ffac2d', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(255,172,45,0.3)' }}
                                  title="Ouvir Narração Atual"
                                >
                                  <Play size={14} color="#000" />
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                className={styles.input}
                                style={{ flex: 1, fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)' }}
                                value={q.audio || ''}
                                onChange={(e) => updateQuestion(q.id, { audio: e.target.value })}
                                placeholder="/audio/quiz/pergunta-01.mp3"
                              />
                              
                              <label style={{ 
                                background: 'rgba(255,172,45,0.1)', 
                                border: '1px solid rgba(255,172,45,0.2)', 
                                padding: '8px', 
                                borderRadius: '8px', 
                                cursor: isUploading === `${q.id}_audio` ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="audio/*" 
                                  onChange={(e) => e.target.files?.[0] && handleFileUpload(q.id, 'audio', e.target.files[0])} 
                                  disabled={!!isUploading}
                                />
                                <Music size={16} color="#ffac2d" />
                              </label>

                              <button
                                onClick={() => recordingId === `${q.id}_audio` ? stopRecording() : startRecording(q.id, 'audio')}
                                style={{ 
                                  background: recordingId === `${q.id}_audio` ? '#ff4d4d' : 'rgba(255,255,255,0.05)',
                                  border: '1px solid' + (recordingId === `${q.id}_audio` ? '#ff4d4d' : 'rgba(255,172,45,0.3)'),
                                  padding: '8px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title={recordingId === `${q.id}_audio` ? "Parar Gravação" : "Gravar Narração"}
                              >
                                {isUploading === `${q.id}_audio` ? (
                                  <div className={styles.btnLoader} style={{ width: '16px', height: '16px' }} />
                                ) : (
                                  <Mic size={16} color={recordingId === `${q.id}_audio` ? "#fff" : "#ffac2d"} />
                                )}
                              </button>
                            </div>
                            
                            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                              Cole a URL ou use os botões para fazer upload/gravar.
                            </p>
                          </div>

                          {/* Áudio da Explicação */}
                          <div style={{ background: 'rgba(0,229,255,0.05)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(0,229,255,0.1)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '0.85rem', color: '#00e5ff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Music size={14} /> Áudio da Explicação (Pós-resposta)
                              </span>
                              {q.explanationAudio && (
                                <button 
                                  onClick={() => new Audio(q.explanationAudio).play()}
                                  style={{ background: '#00e5ff', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,229,255,0.3)' }}
                                  title="Ouvir Áudio Atual"
                                >
                                  <Play size={14} color="#000" />
                                </button>
                              )}
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              <input
                                type="text"
                                className={styles.input}
                                style={{ flex: 1, fontSize: '0.85rem', background: 'rgba(0,0,0,0.3)' }}
                                value={q.explanationAudio || ''}
                                onChange={(e) => updateQuestion(q.id, { explanationAudio: e.target.value })}
                                placeholder="/audio/quiz/explica-01.mp3"
                              />

                              <label style={{ 
                                background: 'rgba(0,229,255,0.1)', 
                                border: '1px solid rgba(0,229,255,0.2)', 
                                padding: '8px', 
                                borderRadius: '8px', 
                                cursor: isUploading === `${q.id}_explanationAudio` ? 'wait' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                <input 
                                  type="file" 
                                  hidden 
                                  accept="audio/*" 
                                  onChange={(e) => e.target.files?.[0] && handleFileUpload(q.id, 'explanationAudio', e.target.files[0])} 
                                  disabled={!!isUploading}
                                />
                                <Music size={16} color="#00e5ff" />
                              </label>

                              <button
                                onClick={() => recordingId === `${q.id}_explanationAudio` ? stopRecording() : startRecording(q.id, 'explanationAudio')}
                                style={{ 
                                  background: recordingId === `${q.id}_explanationAudio` ? '#ff4d4d' : 'rgba(255,255,255,0.05)',
                                  border: '1px solid' + (recordingId === `${q.id}_explanationAudio` ? '#ff4d4d' : 'rgba(0,229,255,0.3)'),
                                  padding: '8px',
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                                title={recordingId === `${q.id}_explanationAudio` ? "Parar Gravação" : "Gravar Explicação"}
                              >
                                {isUploading === `${q.id}_explanationAudio` ? (
                                  <div className={styles.btnLoader} style={{ width: '16px', height: '16px' }} />
                                ) : (
                                  <Mic size={16} color={recordingId === `${q.id}_explanationAudio` ? "#fff" : "#00e5ff"} />
                                )}
                              </button>
                            </div>

                            <p style={{ margin: '8px 0 0 0', fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>
                              Caminho da explicação. Experimente gravar diretamente!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizEditor;
