import React, { useRef, useEffect, useState } from 'react';
import { FaHeart, FaTrophy, FaRocket, FaRedo, FaHome, FaPause, FaPlay, FaArrowLeft } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { InvasoresEngine } from './engine';
import { INVASORES_QUESTIONS } from './questions';
import styles from './InvasoresGame.module.css';
import { useSound } from '@/context/SoundContext';
import { useAuth } from '@/context/AuthContext';
import { TrophyService } from '@/services/trophyService';

const InvasoresGame: React.FC = () => {
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<InvasoresEngine | null>(null);
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'PAUSED' | 'QUESTION_ACTIVE' | 'GAMEOVER'>('START');
  const [hud, setHud] = useState({ score: 0, lives: 3, combo: 0, question: '', shield: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const { playSFX } = useSound();

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
        console.log('Game Result:', result);
        
        // 1. Caçador de Aliens (Incremental)
        if (result.aliens_destroyed > 0) {
          await TrophyService.updateProgress(user.id, 'game_kills_50', result.aliens_destroyed);
        }

        // 2. Sobrevivente Espacial (Meta: 60s)
        if (result.duration >= 60) {
          await TrophyService.updateProgress(user.id, 'game_survival_60s', result.duration, true);
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
      setGameState('QUESTION_ACTIVE');
      setHud(prev => ({ ...prev, question: q.text }));
      playSFX?.('click');
    };

    engine.onQuestionEnd = (correct) => {
      setGameState('PLAYING');
      setHud(prev => ({ ...prev, question: '' }));
      if (correct) {
        playSFX?.('success');
      } else {
        playSFX?.('wrong');
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
      setHud(prev => ({
        ...prev,
        score: engine.score,
        lives: engine.player.lives,
        combo: engine.combo,
        shield: engine.shieldActive
      }));

      requestAnimationFrame(loop);
    };

    const animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [playSFX]);

  const handleStart = () => {
    engineRef.current?.reset();
    setGameState('PLAYING');
    playSFX?.('click');
  };

  const handleTriggerQuestion = () => {
    if (!engineRef.current) return;
    
    // Sistema de Progressão de Dificuldade
    const score = engineRef.current.score;
    let availableQs = INVASORES_QUESTIONS.filter(q => q.difficulty === 1);
    
    if (score >= 1000 && score < 3000) {
        availableQs = INVASORES_QUESTIONS.filter(q => q.difficulty <= 2);
    } else if (score >= 3000) {
        availableQs = INVASORES_QUESTIONS;
    }

    const randomQ = availableQs[Math.floor(Math.random() * availableQs.length)];
    engineRef.current.startQuestionEvent(randomQ);
  };

  // Temporizador para disparar perguntas se estiver jogando
  useEffect(() => {
    if (gameState === 'PLAYING') {
      const timer = setInterval(() => {
        if (gameState === 'PLAYING') handleTriggerQuestion();
      }, 20000);
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
           <div className={styles.statBox}>
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
           </div>
           
           <button 
             className={styles.pauseBtn} 
             onClick={() => {
               if (gameState === 'PLAYING') {
                setGameState('PAUSED');
                if (engineRef.current) engineRef.current.state = 'PAUSED';
               } else if (gameState === 'PAUSED') {
                setGameState('PLAYING');
                if (engineRef.current) engineRef.current.state = 'PLAYING';
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

      {/* BANNER DE PERGUNTA (FORA DO HUD PARA MELHOR POSICIONAMENTO) */}
      {gameState === 'QUESTION_ACTIVE' && (
        <div className={styles.questionBanner}>
            <FaRocket className={styles.questionIcon} />
            <p>{hud.question}</p>
        </div>
      )}

      {/* OVERLAYS DE ESTADO */}
      {gameState === 'PAUSED' && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.arcadeTitle}>MISSÃO PAUSADA</div>
            <button className={styles.mainBtn} onClick={() => {
              setGameState('PLAYING');
              if (engineRef.current) engineRef.current.state = 'PLAYING';
            }}>
              CONTINUAR 🚀
            </button>
          </div>
        </div>
      )}

      {gameState === 'START' && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.arcadeTitle}>INVASORES DO CONHECIMENTO</div>
            <p className={styles.manual}>Defenda a galáxia destruindo aliens e coletando respostas corretas!</p>
            <div className={styles.controlsHint}>
               <div>⬅️ ➡️ Arraste para mover</div>
               <div>🚀 Auto-fire Ativado</div>
            </div>
            <button className={styles.mainBtn} onClick={handleStart}>
              INICIAR MISSÃO 🚀
            </button>
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
