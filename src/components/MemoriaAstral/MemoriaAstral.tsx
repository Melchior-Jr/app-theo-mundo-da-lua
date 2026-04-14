import { 
  Sun, 
  Moon, 
  Globe2, 
  Rocket, 
  Star, 
  Atom,
  HelpCircle,
  Trophy,
  Clock,
  Target,
  RotateCcw,
  Zap,
  Volume2,
  VolumeX,
  Timer,
  TimerOff,
  Settings as SettingsIcon,
  Eye,
  EyeOff,
  Hash,
  Cloud,
  Orbit,
  Wind,
  RefreshCcw,
  Circle,
  Footprints,
  Stars,
  Plus,
  Sword,
  PawPrint,
  GraduationCap,
  Gamepad2,
  Compass as ExploreIcon
} from 'lucide-react';
import { useMemoriaAstral } from './useMemoriaAstral';
import styles from './MemoriaAstral.module.css';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StarField from '../StarField';
import { Navbar } from '@/components/Navbar';
import { GameMode, GameDifficulty, GameCategory } from './types';

// Mapeamento de ícones para os ativos
const ICON_MAP: Record<string, any> = {
  Sun: Sun,
  MoonIcon: Moon,
  Moon: Moon,
  Globe2: Globe2,
  EarthIcon: Globe2,
  MarsIcon: Target,
  Mars: Target,
  JupiterIcon: Atom,
  Jupiter: Atom,
  Orbit: Orbit,
  SaturnIcon: Orbit,
  Saturn: Orbit,
  VenusIcon: Cloud,
  Venus: Cloud,
  MercuryIcon: Zap,
  Mercury: Zap,
  NeptuneIcon: Wind,
  Neptune: Wind,
  UranusIcon: RefreshCcw,
  Uranus: RefreshCcw,
  Cloud: Cloud,
  Zap: Zap,
  Wind: Wind,
  RefreshCcw: RefreshCcw,
  Circle: Circle,
  Footprints: Footprints,
  Stars: Stars,
  Plus: Plus,
  Sword: Sword,
  BearIcon: PawPrint,
  Target: Target,
  Rocket: Rocket
};

const MemoriaAstral: React.FC = () => {
  const navigate = useNavigate();
  const [showSettings, setShowSettings] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [difficulty, setDifficulty] = useState<GameDifficulty>('MEDIUM');
  const [mode, setMode] = useState<GameMode>('EDUCATIONAL');
  const [category, setCategory] = useState<GameCategory>('PLANETS');
  


  const pairsCount = difficulty === 'EASY' ? 4 : difficulty === 'HARD' ? 8 : 6;

  const { 
    cards, 
    handleCardClick, 
    matchesCount, 
    score, 
    attempts, 
    combo, 
    message, 
    isGameFinished, 
    isGameOver,
    timeLeft,
    settings,
    initGame,
    toggleSetting,
    theoState,
    lastMatchIndices,
    isProcessing,
    flippedIndices,
    currentExplanation,
    timeSeconds
  } = useMemoriaAstral(pairsCount, mode, category);

  // Cálculo de desempenho (precisão)
  const accuracy = attempts > 0 ? Math.round((matchesCount / attempts) * 100) : 0;

  // Formatação de tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };


  // Segurança: Se o jogo começou e não há cartas, inicializa
  useEffect(() => {
    if (gameStarted && cards.length === 0) {
      initGame(pairsCount, mode, category);
    }
  }, [gameStarted, cards.length, initGame, pairsCount, mode, category]);

  // Fixar scroll no mobile
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);


  const handleStartGame = () => {
    const categories: GameCategory[] = ['PLANETS', 'CURIOSITIES', 'MOON', 'CONCEPTS', 'CONSTELLATIONS'];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    setCategory(randomCategory);
    setGameStarted(true);
    initGame(pairsCount, mode, randomCategory);
  };

  const handleBackToLobby = () => {
    setGameStarted(false);
  };

  // TELA DE LOBBY (HOME DO JOGO)
  if (!gameStarted) {
    return (
      <div className={styles.gameContainer}>
        <div className={styles.decorContainer}>
          <StarField />
          <div className={styles.nebula1} />
          <div className={styles.nebula2} />
        </div>
        
        <Navbar hideLinks={true}>
          <div className={styles.gameInfo}>
            <span className={styles.gameTitle}>Memória Astral</span>
          </div>
        </Navbar>

        <main className={styles.lobbyContent}>
          <div className={styles.lobbyCard}>
            <div className={styles.lobbyHeader}>
              <div className={styles.theoAstro}>
                <Rocket size={40} color="#00f2fe" />
              </div>
              <h1>Memória Astral</h1>
              <p className={styles.lobbyDesc}>
                Olá, explorador! Teste sua memória encontrando os pares de astros no espaço. 
                Cada par revelado nos ajuda a mapear uma nova parte da galáxia!
              </p>
            </div>



              <div className={styles.selectionSectionSplit}>
                <div className={styles.selectionSection}>
                  <h3>Dificuldade</h3>
                  <div className={styles.optionButtons}>
                    <button 
                      className={`${styles.optionBtn} ${difficulty === 'EASY' ? styles.active : ''}`}
                      onClick={() => setDifficulty('EASY')}
                      data-difficulty="EASY"
                    >
                      Fácil (4 Pares)
                    </button>
                    <button 
                      className={`${styles.optionBtn} ${difficulty === 'MEDIUM' ? styles.active : ''}`}
                      onClick={() => setDifficulty('MEDIUM')}
                      data-difficulty="MEDIUM"
                    >
                      Médio (6 Pares)
                    </button>
                    <button 
                      className={`${styles.optionBtn} ${difficulty === 'HARD' ? styles.active : ''}`}
                      onClick={() => setDifficulty('HARD')}
                      data-difficulty="HARD"
                    >
                      Difícil (8 Pares)
                    </button>
                  </div>
                </div>

                <div className={styles.selectionSection}>
                  <h3>Modo de Jogo</h3>
                  <div className={styles.optionButtons}>
                    <button 
                      className={`${styles.optionBtn} ${mode === 'EDUCATIONAL' ? styles.active : ''}`}
                      onClick={() => setMode('EDUCATIONAL')}
                    >
                      <GraduationCap size={16} /> Educativo
                    </button>
                    <button 
                      className={`${styles.optionBtn} ${mode === 'CLASSIC' ? styles.active : ''}`}
                      onClick={() => setMode('CLASSIC')}
                    >
                      <Gamepad2 size={16} /> Clássico
                    </button>
                    <button 
                      className={`${styles.optionBtn} ${mode === 'RAPID' ? styles.active : ''}`}
                      onClick={() => setMode('RAPID')}
                    >
                      <Clock size={16} /> Rápido
                    </button>
                    <button 
                      className={`${styles.optionBtn} ${mode === 'EXPLORATION' ? styles.active : ''}`}
                      onClick={() => setMode('EXPLORATION')}
                    >
                      <ExploreIcon size={16} /> Exploração
                    </button>
                  </div>
                </div>
              </div>


            <div className={styles.lobbyActions}>
              <button className={styles.playBtn} onClick={handleStartGame}>
                INICIAR MISSÃO <Rocket size={20} />
              </button>
              <button className={styles.backBtn} onClick={() => navigate('/jogos')}>
                VOLTAR
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // TELA DE VITÓRIA (MISSÃO CONCLUÍDA)
  if (isGameFinished) {
    return (
      <div className={styles.resultOverlay} role="dialog" aria-labelledby="result-title">
        <div className={styles.resultCard}>
          <div className={styles.lightRays} />

          <div className={styles.resultHeader}>
            <div className={styles.victoryBadge}>
              <Trophy size={80} color="#FFD166" className={styles.trophyIcon} />
            </div>
            <h2 id="result-title">Missão Concluída!</h2>
          </div>

          <div className={styles.finalTheoContext}>
            <div className={styles.theoVictoryAvatar}>
              <Rocket size={40} />
            </div>
            <p className={styles.finalTheoText}>
              "Fantástico, explorador! Sua memória é afiada como um cometa. 
              Mapeamos novos astros para nossa coleção!"
            </p>
          </div>

          <div className={styles.resultsGridContainer}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>PONTOS</div>
              <div className={styles.resultValue}>{score}</div>
              <Zap size={20} color="#FFD166" style={{ marginTop: '10px' }} />
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>PRECISÃO</div>
              <div className={styles.resultValue}>{accuracy}%</div>
              <Target size={20} color="#00f2fe" style={{ marginTop: '10px' }} />
            </div>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>TEMPO</div>
              <div className={styles.resultValue}>{formatTime(timeSeconds)}</div>
              <Clock size={20} color="#06d6a0" style={{ marginTop: '10px' }} />
            </div>
          </div>



          <div className={styles.actionButtons}>
            <button className={styles.primaryBtn} onClick={handleStartGame} aria-label="Jogar novamente">
              <RotateCcw size={22} /> JOGAR NOVAMENTE
            </button>
            <button className={styles.secondaryBtn} onClick={handleBackToLobby} aria-label="Voltar ao início">
              LOBBY
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TELA DE DERROTA (MISSÃO INTERROMPIDA)
  if (isGameOver) {
    return (
      <div className={styles.resultOverlay}>
        <div className={styles.resultCard}>
          <div className={styles.resultHeader}>
            <div className={styles.errorIcon}>!</div>
            <h2>Combustível Esgotado</h2>
            <p className={styles.finalTheoText}>"Ops! Não conseguimos completar esta missão desta vez."</p>
          </div>

          <div className={styles.resultsGridContainer}>
            <div className={styles.resultItem}>
              <div className={styles.resultLabel}>PONTOS</div>
              <div className={styles.resultValue}>{score}</div>
            </div>
            <div className={styles.resultItem}>
               <div className={styles.resultLabel}>PARES</div>
               <div className={styles.resultValue}>{matchesCount}/{pairsCount}</div>
            </div>
          </div>

          <div className={styles.actionButtons}>
            <button className={styles.primaryBtn} onClick={handleStartGame}>
              <RotateCcw size={20} /> TENTAR NOVAMENTE
            </button>
            <button className={styles.secondaryBtn} onClick={handleBackToLobby}>
              VOLTAR
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.gameContainer} ${settings.reducedMotion ? styles.reducedMotion : ''}`}>
      <div className={styles.decorContainer}>
        <StarField />
        <div className={styles.nebula1} />
        <div className={styles.nebula2} />
      </div>
      
      <Navbar hideLinks={true}>
        <div className={styles.gameInfo}>
          <span className={styles.gameTitle}>Memória Astral</span>
          {combo > 1 && <span className={styles.navbarCombo}>x{combo} Combo!</span>}
        </div>

        <div className={styles.navGameData}>
          <div className={styles.navStat} title="Pontuação">
            <Zap size={14} color="#f7c762" />
            <span>{score}</span>
          </div>
          
          <div className={styles.navStat} title="Tentativas">
            <Hash size={14} color="#a782ff" />
            <span>{attempts}</span>
          </div>

          <div className={styles.navStat} title={settings.mode === 'RAPID' ? 'Tempo Restante' : 'Tempo'}>
            <Clock size={14} color="#00f2fe" />
            <span>{settings.mode === 'RAPID' ? formatTime(timeLeft) : formatTime(timeSeconds)}</span>
          </div>
          
          <div className={styles.navActions}>
            <button 
              className={styles.settingsToggle}
              onClick={() => setShowSettings(!showSettings)}
              aria-label="Configurações de Acessibilidade"
            >
              <SettingsIcon size={20} />
            </button>
          </div>
        </div>
      </Navbar>

      {showSettings && (
        <div className={styles.settingsPanel} role="group" aria-label="Menu de Acessibilidade">
           <button 
             className={`${styles.settingItem} ${!settings.timeEnabled ? styles.active : ''}`}
             onClick={() => toggleSetting('timeEnabled')}
             title="Desativar Cronômetro (Ideal para Reduzir Ansiedade)"
           >
             {!settings.timeEnabled ? <TimerOff size={20} /> : <Timer size={20} />}
             <span>{settings.timeEnabled ? 'Cronômetro Ativo' : 'Modo Relaxado'}</span>
           </button>

           <button 
             className={`${styles.settingItem} ${!settings.soundEnabled ? styles.active : ''}`}
             onClick={() => toggleSetting('soundEnabled')}
           >
             {!settings.soundEnabled ? <VolumeX size={20} /> : <Volume2 size={20} />}
             <span>{settings.soundEnabled ? 'Sons Ativos' : 'Sons Mudos'}</span>
           </button>

           <button 
             className={`${styles.settingItem} ${settings.reducedMotion ? styles.active : ''}`}
             onClick={() => toggleSetting('reducedMotion')}
             title="Reduzir Movimentos e Animações (Foco TEA/TDAH)"
           >
             {settings.reducedMotion ? <EyeOff size={20} /> : <Eye size={20} />}
             <span>{settings.reducedMotion ? 'Movimento Reduzido' : 'Animações Ativas'}</span>
           </button>
        </div>
      )}

      <section className={styles.theoArea}>
        <div className={`${styles.theoAvatar} ${styles[theoState.toLowerCase()]}`}>
          {theoState === 'HAPPY' && '⭐'}
          {theoState === 'THINKING' && '🤔'}
          {theoState === 'SAD' && '😟'}
          {theoState === 'NEUTRAL' && '🚀'}
        </div>
        <div className={styles.theoBalloon}>
          <p className={styles.theoText} key={message}>{message}</p>
          {currentExplanation && (
            <div className={styles.explanationBox}>
              <p>{currentExplanation}</p>
            </div>
          )}
        </div>
      </section>

      <main className={`${styles.gameBoard} ${styles[(settings.difficulty || difficulty).toLowerCase()]}`}>
        {cards.length === 0 ? (
          <div className={styles.loadingState}>
            <RotateCcw className={styles.spin} />
            <p>Preparando setor para exploração...</p>
          </div>
        ) : cards.map((card, index) => {
          const isFlipped = card.status !== 'HIDDEN';
          const isMatched = card.status === 'MATCHED';
          const isLastMatch = lastMatchIndices.includes(index);
          const isWrong = flippedIndices.length === 2 && flippedIndices.includes(index) && !isMatched && isProcessing;

          return (
            <div 
              key={card.id} 
              className={`
                ${styles.card} 
                ${isFlipped ? styles.flipped : ''} 
                ${isMatched ? styles.matched : ''}
                ${isWrong ? styles.shake : ''}
              `}
              onClick={() => handleCardClick(index)}
            >
              <div className={styles.cardInner}>
                <div className={styles.cardBack}>
                  <Star className={styles.cardIcon} />
                </div>

                <div className={styles.cardFront} data-type={card.type}>
                  <div className={styles.cardContent}>
                    {card.type === 'ICON' ? (
                      (() => {
                        const IconComponent = ICON_MAP[card.content as string] || HelpCircle;
                        return <IconComponent size={40} className={styles.cardIconActive} />;
                      })()
                    ) : (
                      <span className={styles.cardTextContent}>{card.content}</span>
                    )}
                    <span className={styles.astroName}>{card.name}</span>
                  </div>
                  {isLastMatch && <div className={styles.starBurst} />}
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
};

export default MemoriaAstral;
