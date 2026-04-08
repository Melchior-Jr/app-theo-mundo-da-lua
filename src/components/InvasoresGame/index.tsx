import React, { useRef, useEffect, useState } from 'react';
import { FaHeart, FaTrophy, FaRocket, FaRedo, FaHome, FaPause, FaPlay, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { InvasoresEngine } from './engine';
import { QUESTIONS_DATABASE } from './questions';
import { supabase } from '@/lib/supabase';
import styles from './InvasoresGame.module.css';
import { useSound } from '@/context/SoundContext';
import { useAuth } from '@/context/AuthContext';
import { TrophyService } from '@/services/trophyService';
import { AnalyticsService } from '@/services/analyticsService';
import { Chapter, UserProgressData, GameState, Question } from './types';
import TheoAvatar from '../TheoAvatar';

const CHAPTERS: Chapter[] = [
  {
    id: 1,
    slug: 'sistema-solar',
    title: 'Capítulo 1: Sistema Solar',
    category: 'Sistema Solar',
    minScoreToUnlock: 0,
    palette: { primary: '#00e5ff', secondary: '#00838f', background: '#05070a', accent: '#00ffa3' }
  },
  {
    id: 2,
    slug: 'terra',
    title: 'Capítulo 2: Terra em Movimento',
    category: 'Terra',
    minScoreToUnlock: 2000,
    palette: { primary: '#00ffa3', secondary: '#00695c', background: '#010a05', accent: '#4db6ac' }
  },
  {
    id: 3,
    slug: 'constelacoes',
    title: 'Capítulo 3: Constelações',
    category: 'Constelações',
    minScoreToUnlock: 2000,
    palette: { primary: '#aa00ff', secondary: '#4a148c', background: '#08050a', accent: '#ea80fc' }
  },
  {
    id: 4,
    slug: 'lua',
    title: 'Capítulo 4: Fases da Lua',
    category: 'Lua',
    minScoreToUnlock: 2000,
    palette: { primary: '#cfd8dc', secondary: '#455a64', background: '#0a0a0c', accent: '#ffffff' }
  }
];

const InvasoresGame: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<InvasoresEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>('START');
  const [selectedChapter, setSelectedChapter] = useState<Chapter>(CHAPTERS[0]);
  const [progress, setProgress] = useState<UserProgressData>(() => {
    const saved = localStorage.getItem('invasores_progress');
    return saved ? JSON.parse(saved) : { unlockedChapters: [1], highScores: {} };
  });
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0, question: '', shield: false });
  const [dialogue, setDialogue] = useState<{ text: string, timeout: number, type: string } | null>(null);
  
  const THEO_PHRASES = {
    SUCCESS: ["Boa! Mandou bem!", "Essa você acertou fácil!", "Uau! Direto no alvo!", "Você é demais! 🚀"],
    WRONG: ["Quase! Vamos de novo!", "Essa foi difícil hein!", "Ops! Presta atenção no Théo!", "Ih, essa era pegadinha! 😅"],
    COMBO: ["Tá voando!!", "Combo monstro!", "Ninguém te segura!", "Uau! Que velocidade! ⚡"],
    CHALLENGE: ["Agora presta atenção!", "Lá vem desafio!", "Escolha com cuidado! 🔭", "Théo está de olho! 🧐"]
  };

  const showDialogue = (category: keyof typeof THEO_PHRASES | 'EXPLANATION', customText?: string) => {
    // Se já existe uma explicação na tela, não deixa as frases genéricas atropelarem
    if (dialogue?.type === 'EXPLANATION' && category !== 'EXPLANATION') return;

    let text = "";
    let duration = 3000;

    if (category === 'EXPLANATION') {
        text = customText || "";
        duration = 12000; // Aumentado para 12s para dar mais tempo de leitura
    } else {
        const list = THEO_PHRASES[category as keyof typeof THEO_PHRASES];
        text = list[Math.floor(Math.random() * list.length)];
    }
    
    if (dialogue?.timeout) clearTimeout(dialogue.timeout);
    
    const timeout = window.setTimeout(() => setDialogue(null), duration);
    setDialogue({ text, timeout, type: category });
  };
  const questionHistory = useRef<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSFX, playTrack, stopBGMusic, playBGMusic, isMuted } = useSound();
  const gameMusicRef = useRef<HTMLAudioElement | null>(null);

  // Controle da Música de Fundo (Global e do Jogo)
  useEffect(() => {
    // Para a música ambiente global ao entrar no componente
    stopBGMusic();
    return () => {
      // Retoma a música ambiente global ao sair (unmount)
      playBGMusic();
      if (gameMusicRef.current) {
        gameMusicRef.current.pause();
        gameMusicRef.current = null;
      }
    };
  }, [stopBGMusic, playBGMusic]);

  // Sincronização da música com o estado do jogo e capítulo
  useEffect(() => {
    const shouldPlay = gameState === 'MODO_COMBATE' || gameState === 'MODO_DESAFIO';
    
    if (shouldPlay && !isMuted) {
      // Define a trilha baseado no capítulo (MVP usa trilhas diferentes se existirem)
      const trackPath = selectedChapter?.id === 4 
        ? '/audio/sfx/bg-Sound-invasores-lua.mp3' 
        : '/audio/sfx/bg-Sound-invasores.mp3';

      if (!gameMusicRef.current) {
        const audio = playTrack(trackPath, 0.05);
        if (audio) {
          audio.loop = true;
          gameMusicRef.current = audio;
        }
      } else if (gameMusicRef.current.paused) {
        gameMusicRef.current.play().catch(() => {});
      }
    } else {
      if (gameMusicRef.current && !gameMusicRef.current.paused) {
        gameMusicRef.current.pause();
      }
    }
  }, [gameState, playTrack, isMuted, selectedChapter]);

  // Inicializar Engine
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const engine = new InvasoresEngine(canvasRef.current);
    engineRef.current = engine;

    // Configurar Callbacks
    engine.onGameOver = () => {
      setGameState('GAMEOVER');
      playSFX?.('fail');
    };

    engine.onResult = async (result) => {
        if (!user) return;
        
        // --- PERSISTÊNCIA DE RECORDES POR CAPÍTULO ---
        const chapterId = selectedChapter?.id || 1;
        const currentHighScore = progress.highScores[chapterId] || 0;
        const newHighScore = Math.max(currentHighScore, result.score);
        
        const newHighScores = { ...progress.highScores, [chapterId]: newHighScore };
        const newUnlocked = [...progress.unlockedChapters];
        
        // Regra de desbloqueio: se atingiu 80% da pontuação do próximo alvo, ou recorde alto
        CHAPTERS.forEach(c => {
            if (!newUnlocked.includes(c.id) && result.score >= c.minScoreToUnlock) {
                newUnlocked.push(c.id);
            }
        });

        setProgress({ unlockedChapters: newUnlocked, highScores: newHighScores });

        // Salvar no Supabase
        await supabase
          .from('player_global_stats')
          .upsert({
            user_id: user.id,
            game_slug: 'invasores-conhecimento',
            invasores_progress: { unlockedChapters: newUnlocked, highScores: newHighScores },
            updated_at: new Date().toISOString()
          });
        
        const nextChapter = CHAPTERS.find(c => c.id === selectedChapter.id + 1);
        if (nextChapter && result.score >= nextChapter.minScoreToUnlock && !newUnlocked.includes(nextChapter.id)) {
            newUnlocked.push(nextChapter.id);
        }

        const newProgress = { unlockedChapters: newUnlocked, highScores: newHighScores };
        setProgress(newProgress);
        localStorage.setItem('invasores_progress', JSON.stringify(newProgress));

        // --- PERSISTÊNCIA NO SUPABASE (Global) ---
        const INVASORES_GAME_ID = 'invasores-do-conhecimento';
        const score = result.score;
        const xpGain = Math.floor(score / 10);

        try {
            await supabase.from('game_sessions').insert({
                player_id: user.id,
                game_id: INVASORES_GAME_ID,
                score: score,
                completed: true,
                metadata: { ...result, chapter_id: selectedChapter.id }
            });

            const { data: global } = await supabase.from('player_global_stats').select('*').eq('player_id', user.id).maybeSingle();
            await supabase.from('player_global_stats').upsert({
                player_id: user.id,
                total_score: (global?.total_score || 0) + score,
                galactic_xp: (global?.galactic_xp || 0) + xpGain,
                total_sessions: (global?.total_sessions || 0) + 1,
                updated_at: new Date().toISOString()
            });
        } catch (e) {
            console.error('[Invasores] Erro ao salvar progresso:', e);
        }

        // Trophies - Sistema de Conquistas
        if (result.aliens_destroyed > 0) {
          await TrophyService.updateProgress(user.id, 'game_kills_50', result.aliens_destroyed);
          await TrophyService.updateProgress(user.id, 'inv_kills_100', result.aliens_destroyed);
        }

        if (result.max_streak >= 10) {
          await TrophyService.updateProgress(user.id, 'inv_streak_10', 1, true);
        }

        if (result.max_combo >= 20) {
          await TrophyService.updateProgress(user.id, 'inv_combo_20', 1, true);
        }

        const moonAnswers = result.correct_answers_by_category['Lua'] || 0;
        if (moonAnswers > 0) {
          await TrophyService.updateProgress(user.id, 'inv_moon_master', moonAnswers);
        }

        if (result.is_perfect_run && result.score > 1000) {
          await TrophyService.updateProgress(user.id, 'inv_nodamage', 1, true);
        }

        if (result.wrong_answers_destroyed > 0) {
          await TrophyService.updateProgress(user.id, 'inv_wrong_50', result.wrong_answers_destroyed);
        }
    };

    // Responsive Canvas
    const handleResize = () => {
        if (!containerRef.current || !canvasRef.current) return;
        
        // No desktop mantém o tamanho projetivo 800x600, no mobile preenche
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        } else {
            canvasRef.current.width = 800;
            canvasRef.current.height = 600;
        }
        
        engine.resize();
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    engine.onQuestionStart = (q) => {
      setGameState('MODO_DESAFIO');
      setHud(prev => ({ ...prev, question: q.text }));
      showDialogue('CHALLENGE');
      playSFX?.('bonus');
    };

    engine.onQuestionEnd = (correct, details) => {
      const currentQ = engineRef.current?.currentQuestion as Question;
      const explanation = currentQ?.explanation || '';
      
      setHud(prev => ({ ...prev, question: '' }));
      
      if (correct) {
        playSFX?.('success');
        showDialogue('EXPLANATION', `✨ BOA! ${explanation}`);
      } else {
        playSFX?.('wrong');
        showDialogue('EXPLANATION', `🚀 QUASE! ${explanation}`);
      }

      setGameState('MODO_COMBATE');
      if (engineRef.current) engineRef.current.state = 'MODO_COMBATE';

      // Analytics Log
      if (user && details) {
        AnalyticsService.logQuestionEvent({
          user_id: user.id,
          game_slug: 'invasores-conhecimento',
          chapter_id: selectedChapter?.id || 1,
          question_id: details.question_id,
          choice_text: details.choice,
          is_correct: correct,
          response_time_ms: details.responseTime,
          difficulty: details.difficulty
        });
      }
    };

    // Game Loop
    let lastTime = 0;
    const loop = (time: number) => {
      const dt = time - lastTime;
      lastTime = time;

      engine.update(dt || 0);
      engine.draw();
      
      // Sincronizar HUD pro React
      setHud(prev => {
        // Monitorar Combo para Falas do Théo
        if (engine.combo > prev.combo && [5, 10, 15, 20].includes(engine.combo)) {
          showDialogue('COMBO');
        }
        
        return {
          ...prev,
          score: engine.score,
          lives: engine.player.lives,
          combo: engine.combo,
          shield: engine.shieldActive
        };
      });

      requestAnimationFrame(loop);
    };

    const animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [playSFX]);

  const handleStart = () => {
    setGameState('CHAPTER_SELECT');
    playSFX?.('click');
  };

  const selectChapter = (chapter: Chapter) => {
    setSelectedChapter(chapter);
    engineRef.current?.reset();
    engineRef.current?.setChapter(chapter);
    setGameState('MODO_COMBATE');
    playSFX?.('click');
  };

  const handleTriggerQuestion = () => {
    if (!engineRef.current) return;
    
    // 1. Definir nível de dificuldade baseado no score
    const score = engineRef.current.score;
    let targetLevel: 'Fácil' | 'Médio' | 'Difícil' = 'Fácil';
    if (score >= 1500 && score < 4000) targetLevel = 'Médio';
    else if (score >= 4000) targetLevel = 'Difícil';

    // 2. Filtrar perguntas pela CATEGORIA do capítulo e dificuldade
    let pool = QUESTIONS_DATABASE.filter(q => 
        q.category === selectedChapter.category &&
        q.level === targetLevel && 
        !questionHistory.current.includes(q.id)
    );

    // Complementar com Sistema Solar se estiver vazio
    if (pool.length === 0) {
        pool = QUESTIONS_DATABASE.filter(q => q.category === 'Sistema Solar' && q.level === targetLevel);
    }

    // 3. Se o pool estiver vazio, limpa metade do histórico e tenta novamente
    if (pool.length === 0) {
        questionHistory.current = questionHistory.current.slice(Math.floor(QUESTIONS_DATABASE.length / 2));
        pool = QUESTIONS_DATABASE.filter(q => q.level === targetLevel);
    }

    // 4. Seleção Aleatória
    const randomQ = pool[Math.floor(Math.random() * pool.length)];
    if (randomQ) {
        questionHistory.current.push(randomQ.id);
        engineRef.current.startQuestionEvent(randomQ);
    }
  };

  // Temporizador para disparar perguntas se estiver jogando
  useEffect(() => {
    if (gameState === 'MODO_COMBATE') {
      const timer = setInterval(() => {
        if (gameState === 'MODO_COMBATE') handleTriggerQuestion();
      }, 15000); // Frequência um pouco maior
      return () => clearInterval(timer);
    }
  }, [gameState]);

  return (
    <div className={styles.gameWrapper}>
      {/* HUD SUPERIOR */}
      <div className={styles.hudTop}>
        <div className={styles.hudLeft}>
           <Link to="/jogos" className={styles.mobileBackBtn}>
              <FaArrowLeft />
           </Link>
           <div className={styles.statBox}>
              <span className={styles.statLabel}>PONTOS</span>
              <span className={styles.statValue}>{hud.score.toLocaleString()}</span>
           </div>
           <div className={`${styles.statBox} ${hud.combo > 0 ? styles.comboActive : ''}`}>
              <span className={styles.statLabel}>COMBO</span>
              <span className={styles.statValue}>x{hud.combo}</span>
           </div>
        </div>

        <div className={styles.hudCenter}>
        </div>

        <div className={styles.hudRight}>
           <div className={styles.lives}>
               {[...Array(3)].map((_, i) => (
                <FaHeart 
                  key={i} 
                  className={i < hud.lives ? styles.heartActive : styles.heartDead} 
                />
              ))}
              <span className={styles.livesText}>{hud.lives}/3</span>
           </div>
           
           <button 
             className={styles.pauseBtn} 
             onClick={() => {
               if (gameState === 'MODO_COMBATE' || gameState === 'MODO_DESAFIO') {
                setGameState('PAUSED');
                if (engineRef.current) engineRef.current.state = 'PAUSED';
               } else if (gameState === 'PAUSED') {
                setGameState('MODO_COMBATE');
                if (engineRef.current) engineRef.current.state = 'MODO_COMBATE';
               }
             }}
           >
             {gameState === 'PAUSED' ? <FaPlay /> : <FaPause />}
           </button>

           {hud.shield && (
             <div className={styles.shieldIndicator}>
               <span className={styles.shieldZap}>🛡️</span>
               <span className={styles.shieldLabel}>ESCUDO</span>
             </div>
           )}
        </div>
      </div>

      <div ref={containerRef} className={styles.gameContainer}>
        <canvas 
          ref={canvasRef} 
          className={styles.canvas}
        />
      </div>

      {/* BANNER DE PERGUNTA E INSTRUÇÃO */}
      {gameState === 'MODO_DESAFIO' && (
        <>
          <div className={styles.questionBanner}>
              <FaRocket className={styles.questionIcon} />
              <p>{hud.question}</p>
          </div>
          <div className={styles.instructionBanner}>
            <span className={styles.instructionText}>🚀 DESTRUA OS ERROS!</span>
            <span className={styles.instructionSubtext}>Deixe apenas a resposta correta passar</span>
          </div>
        </>
      )}

      {/* OVERLAYS DE ESTADO */}
      {/* DIÁLOGO DO THÉO */}
      {dialogue && (
        <div className={styles.theoDialogue}>
           <div className={styles.dialogueBubble}>
              <p>{dialogue.text}</p>
              <div className={styles.bubbleTail} />
           </div>
           <TheoAvatar className={styles.theoMiniAvatar} width={80} height={80} />
        </div>
      )}

      {gameState === 'PAUSED' && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.arcadeTitle}>MISSÃO PAUSADA</div>
            <button className={styles.mainBtn} onClick={() => {
              setGameState('MODO_COMBATE');
              if (engineRef.current) engineRef.current.state = 'MODO_COMBATE';
            }}>
              CONTINUAR 🚀
            </button>
          </div>
        </div>
      )}


      {/* TELA HOME / LOBBY INTERNO */}
      {gameState === 'START' && (
        <div className={styles.lobbyOverlay}>
          <div className={styles.lobbyContent}>
             <div className={styles.lobbyHeader}>
                <span className={styles.lobbySubtitle}>MISSÃO ESPACIAL</span>
                <h1 className={styles.lobbyTitle}>INVASORES</h1>
                <h1 className={styles.lobbyTitle}>DO CONHECIMENTO</h1>
             </div>

             <div className={styles.theoHero}>
                <TheoAvatar width={220} height={220} />
             </div>

             <div className={styles.lobbyStats}>
                <div className={styles.lobbyStatItem}>
                   <span className={styles.lobbyStatLabel}>CAPÍTULOS</span>
                   <span className={styles.lobbyStatValue}>{progress.unlockedChapters.length}/4</span>
                </div>
                <div className={styles.lobbyStatItem}>
                   <span className={styles.lobbyStatLabel}>SCORE TOTAL</span>
                   <span className={styles.lobbyStatValue}>
                      {Object.values(progress.highScores).reduce((a: number, b: number) => a + b, 0).toLocaleString()}
                   </span>
                </div>
             </div>

             <div className={styles.lobbyActions}>
                <button className={styles.playBtn} onClick={() => setGameState('CHAPTER_SELECT')}>
                   INICIAR JORNADA 🚀
                </button>
                <Link to="/jogos" className={styles.backToHub}>
                   <FaHome /> SAIR PARA O HUB
                </Link>
             </div>
          </div>
        </div>
      )}

      {/* SELEÇÃO DE CAPÍTULO */}
      {gameState === 'CHAPTER_SELECT' && (
        <div className={styles.overlay}>
          <div className={`${styles.modal} ${styles.chapterGridModal}`}>
            <div className={styles.arcadeTitle}>ESCOLHA SEU DESTINO</div>
            <div className={styles.chapterGrid}>
                {CHAPTERS.map(chapter => {
                    const isUnlocked = progress.unlockedChapters.includes(chapter.id);
                    const highScore = progress.highScores[chapter.id] || 0;
                    return (
                        <div 
                            key={chapter.id} 
                            className={`${styles.chapterCard} ${!isUnlocked ? styles.locked : ''}`}
                            style={{ '--chapter-color': chapter.palette.primary } as any}
                            onClick={() => isUnlocked && selectChapter(chapter)}
                        >
                            <div className={styles.chapterIcon}>
                                {isUnlocked ? (chapter.id === 4 ? '🌙' : '🚀') : '🔒'}
                            </div>
                            <h3 className={styles.chapterTitle}>{chapter.title}</h3>
                            {isUnlocked && <p className={styles.chapterScore}>Recorde: {highScore}</p>}
                            {!isUnlocked && <p className={styles.chapterRequirement}>Score {chapter.minScoreToUnlock} no Cap {chapter.id - 1}</p>}
                        </div>
                    );
                })}
            </div>
            <button className={styles.backButton} onClick={() => setGameState('START')}>VOLTAR</button>
          </div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.gameOverTitle}>MISSÃO ENCERRADA</div>
            <div className={styles.finalScore}>
               <span>PONTUAÇÃO FINAL</span>
               <h2>{hud.score.toLocaleString()}</h2>
            </div>
            <div className={styles.resultsGrid}>
               <div className={styles.resItem}>
                  <FaTrophy className={styles.resIcon} /> 
                  <div className={styles.resData}>
                     <span className={styles.resLabel}>Combo Máx</span>
                     <span className={styles.resValue}>{engineRef.current?.maxCombo}</span>
                  </div>
               </div>
               <div className={styles.resItem}>
                  <span className={styles.resEmoji}>🛸</span>
                  <div className={styles.resData}>
                     <span className={styles.resLabel}>Aliens</span>
                     <span className={styles.resValue}>{engineRef.current?.aliensDestroyed}</span>
                  </div>
               </div>
               <div className={styles.resItem}>
                  <span className={styles.resEmoji}>✅</span>
                  <div className={styles.resData}>
                     <span className={styles.resLabel}>Acertos</span>
                     <span className={styles.resValue}>{engineRef.current?.correctAnswers}</span>
                  </div>
               </div>
            </div>
            <div className={styles.actions}>
               <button className={styles.retryBtn} onClick={handleStart}>
                  <FaRedo /> Tentar Novamente
               </button>
               <Link to="/jogos" className={styles.homeBtn}>
                  <FaHome /> Voltar para o Hub
               </Link>
            </div>
          </div>
        </div>
      )}
        <div className={styles.touchArea} />
      </div>
    );
  };

export default InvasoresGame;
