import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { ALL_QUIZ_DATA } from '@/data/quizQuestions'
import { useQuizEngine } from '@/hooks/useQuizEngine'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { usePlayer } from '@/context/PlayerContext'
import { TrophyService } from '@/services/trophyService'
import { ProgressionService } from '@/services/progressionService'
import { AdminService } from '@/services/adminService'
import styles from './QuizSystem.module.css'
import QuestionRenderer from './QuestionRenderer.tsx'
import QuizHeader from './QuizHeader.tsx'
import FeedbackLayer from './FeedbackLayer.tsx'
import QuizResult from './QuizResult.tsx'
import StarField from '@/components/StarField'
import QuizStartScreen from './QuizStartScreen.tsx'

interface QuizSystemProps {
  level?: number
  challenge?: number
  mode?: 'normal' | 'quick' | 'challenge'
  defaultDuelMode?: 'classic' | 'speedrun' | 'training'
  onExit: () => void
}

interface DuelConfig {
  targetUserId: string
  targetUserName: string
  levelId: number
  stake: number
  mode: 'classic' | 'speedrun' | 'training'
  challengeId?: string 
  challengerScore?: number // Pontuação do desafiante para bater
  challengerTime?: number  // Tempo do desafiante em segundos
  questionIds?: string[]   // IDs das perguntas na ordem original (IDs são strings agora)
}

export default function QuizSystem({ 
  level: initialLevel = 1, 
  challenge: initialChallenge = 1, 
  mode: initialMode = 'normal', 
  defaultDuelMode = 'classic',
  onExit 
}: QuizSystemProps) {
  const { user } = useAuth()
  const { playSFX, playBGMusic, stopBGMusic, playTrack } = useSound()
  const { refreshData } = usePlayer()

  // Gerenciar música de fundo específica do Quiz
  useEffect(() => {
    playBGMusic()
    return () => {
      stopBGMusic()
    }
  }, [playBGMusic, stopBGMusic])

  // --- SISTEMA DE BOAS-VINDAS (Mount Only, respeitando sessão) ---
  const hasGreetedEffect = useRef(false)
  useEffect(() => {
    // Se estiver em modo desafio, não saudamos aqui (saudamos ao entrar no jogo de fato)
    if (!user || hasGreetedEffect.current || initialMode === 'challenge') return
    
    // Check session safety guard
    const hasGreetedInSession = sessionStorage.getItem('theo-quiz-session-greeted')
    if (hasGreetedInSession) return
    
    const isFirstAccess = !localStorage.getItem('theo-quiz-first-access')
    
    if (isFirstAccess) {
      playTrack('/audio/Quiz Intergaláctico/Intro_01.MP3')
      localStorage.setItem('theo-quiz-first-access', 'true')
    } else {
      // Temos Lvl_Select_01 até 04
      const greetNum = Math.floor(Math.random() * 4) + 1
      playTrack(`/audio/Quiz Intergaláctico/Lvl_Select_0${greetNum}.MP3`)
    }

    // Marca que a saudação já ocorreu para evitar repetições
    sessionStorage.setItem('theo-quiz-session-greeted', 'true')
    hasGreetedEffect.current = true
  }, [user, playTrack, initialMode])

  // Handler de saída centralizado para limpar a sessão de saudação
  const handleExit = useCallback(() => {
    sessionStorage.removeItem('theo-quiz-session-greeted')
    onExit?.()
  }, [onExit])

  const [currentLevel, setCurrentLevel] = useState(initialLevel)
  const [currentChallenge, setCurrentChallenge] = useState(initialChallenge)
  const [totalXp, setTotalXp] = useState(0)
  const [isStarted, setIsStarted] = useState(false)
  const [hasSaved, setHasSaved] = useState(false)
  
  // Duelo State
  const [isDuel, setIsDuel] = useState(false)
  const [duelConfig, setDuelConfig] = useState<DuelConfig | null>(null)
  const [selectedSubject, setSelectedSubject] = useState<'astronomy' | 'geosciences'>('astronomy')
  
  // Efeito de XP animado (Roleta)
  const [animatedXp, setAnimatedXp] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // 0. Carregar as questões nativas do banco de dados 
  const [allQuizData, setAllQuizData] = useState<typeof ALL_QUIZ_DATA>(ALL_QUIZ_DATA)

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const dbQuestions = await AdminService.getQuizQuestions()
        if (dbQuestions && dbQuestions.length > 0) {
          // MESCLAGEM INTELIGENTE: Prioriza o que vem do banco (editado) 
          // mas mantém o que está no código local caso ainda não tenha sido migrado
          setAllQuizData(prev => {
            const merged = [...prev];
            dbQuestions.forEach(dbQ => {
              const idx = merged.findIndex(q => q.id === dbQ.id);
              if (idx !== -1) {
                merged[idx] = dbQ; // Sobrescreve local pelo do banco
              } else {
                merged.push(dbQ); // Nova pergunta do banco
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.error('Erro carregando questões do cloud:', err)
      }
    }
    fetchQuestions()
  }, [])

  // 1. Filtra as questões do nível e desafio atual
  const questions = useMemo(() => {
    if (isDuel && duelConfig) {
      const allLevelQuestions = allQuizData.filter(q => q.subject === selectedSubject && q.level === duelConfig.levelId);
      
      // Se for resposta a um desafio, usamos os IDs salvos
      if (duelConfig.questionIds && duelConfig.questionIds.length > 0) {
        return duelConfig.questionIds
          .map(id => allLevelQuestions.find(q => q.id === id))
          .filter(Boolean) as typeof ALL_QUIZ_DATA;
      }

      // Se for Novo Duelo, embaralhamos
      return [...allLevelQuestions].sort(() => 0.5 - Math.random());
    }
    return allQuizData.filter(q => q.subject === selectedSubject && q.level === currentLevel && q.challenge === currentChallenge)
      .sort(() => 0.5 - Math.random())
  }, [currentLevel, currentChallenge, isDuel, duelConfig, selectedSubject, allQuizData])

  // 2. Engine do Quiz
  const engine = useQuizEngine(questions, {
    mode: isDuel ? 'duel' : 'normal',
    duelMode: isDuel ? (duelConfig?.mode === 'training' ? 'classic' : (duelConfig?.mode || 'classic')) : 'classic',
    maxTargetScore: isDuel && (duelConfig?.mode === 'classic' || duelConfig?.mode === 'training') ? duelConfig?.challengerScore : undefined,
    subjectId: selectedSubject
  })

  // 3. Handler para começar
  const handleStart = (selectedLevel: number, selectedChallenge: number = 1, subject: 'astronomy' | 'geosciences' = 'astronomy') => {
    playSFX('click')
    setIsDuel(false)
    setDuelConfig(null)
    setSelectedSubject(subject)
    setCurrentLevel(selectedLevel)
    setCurrentChallenge(selectedChallenge)
    setIsStarted(true)
    setHasSaved(false)
    engine.reset()

    // Narração de início da primeira pergunta (Sempre QStart na primeira)
    const qStartNum = Math.floor(Math.random() * 5) + 1
    const audio = playTrack(`/audio/Quiz Intergaláctico/QStart_0${qStartNum}.MP3`)
    if (audio) {
      engine.setIntroAudio(audio)
    }
  }

  const handleStartDuel = (config: DuelConfig) => {
    console.log('%c [DEBUG] INICIANDO DUELO COM CONFIG: ', 'background: #ff3d71; color: #fff; padding: 5px;', config)
    playSFX('click')
    setIsDuel(true)
    
    // Se a config já trouxer um mode (ex: convite aceito), usamos ele.
    // Se não trouxer (ex: novo desafio que estamos lançando), usamos o defaultDuelMode.
    const finalConfig = {
      ...config,
      mode: config.mode || defaultDuelMode
    }
    
    setDuelConfig(finalConfig)
    setIsStarted(true)
    setHasSaved(false)
    engine.reset()

    // No duelo também lançamos o QStart inicial
    const qStartNum = Math.floor(Math.random() * 5) + 1
    const audio = playTrack(`/audio/Quiz Intergaláctico/QStart_0${qStartNum}.MP3`)
    if (audio) {
      engine.setIntroAudio(audio)
    }
  }

  // 4a. Timer de Pressão lúdica (10s sem resposta)
  const timerAudioRef = useRef<HTMLAudioElement | null>(null)
  
  useEffect(() => {
    if (engine.status !== 'playing' || !isStarted) {
      if (timerAudioRef.current) {
        timerAudioRef.current.pause()
        timerAudioRef.current = null
      }
      return
    }

    const timer = setTimeout(() => {
      if (engine.status === 'playing' && isStarted) {
        const timerNum = Math.floor(Math.random() * 4) + 1
        timerAudioRef.current = playTrack(`/audio/Quiz Intergaláctico/Timer_0${timerNum}.MP3`)
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [engine.status, engine.currentIdx, isStarted, playTrack])

  // 4. Handler para concluir missão e voltar ao início
  const handleFinishMission = () => {
    // Permitimos sair mesmo se estiver salvando (background)
    playSFX('click')
    setTotalXp(prev => prev + engine.xp)
    setIsStarted(false)
    setHasSaved(false)
    engine.reset()
  }

  const saveResults = async () => {
    if (!user) {
      console.warn('[QuizSystem] Nenhum usuário logado. Abortando gravação.');
      return;
    }

    if (hasSaved) {
      console.log('[QuizSystem] Resultados já foram gravados nesta sessão.');
      return;
    }
    
    console.log('[DEBUG] Iniciando saveResults em Background. isDuel:', isDuel, 'status:', engine.status)
    setHasSaved(true)

    // SNAPSHOT: Capturamos os dados do engine agora para garantir consistência em background
    const engineSnapshot = {
      xp: engine.xp,
      correctCount: engine.correctCount,
      maxCombo: engine.maxCombo,
      questionsLog: [...engine.questionsLog],
      hasMistakes: engine.hasMistakes,
      status: engine.status,
      totalQuestions: engine.totalQuestions
    };

    const performBackgroundSave = async () => {
      try {
        if (isDuel && duelConfig) {
          const challengeId = (duelConfig as any).challengeId;
          const isResponse = !!challengeId;
          const stake = duelConfig.stake || 0;
          const totalTimeSpent = engineSnapshot.questionsLog.reduce((acc, entry) => acc + entry.timeSpent, 0);

          if (isResponse) {
            const challengerScore = (duelConfig as any).challengerScore || 0;
            const challengerTime = (duelConfig as any).challengerTime || 999999;
            const mode = duelConfig.mode;

            let winStatus = 'draw';
            if (mode === 'classic' || mode === 'training') {
              winStatus = engineSnapshot.correctCount > challengerScore ? 'win' : engineSnapshot.correctCount < challengerScore ? 'loss' : 'draw';
            } else {
              if (engineSnapshot.correctCount > challengerScore) winStatus = 'win';
              else if (challengerScore > engineSnapshot.correctCount) winStatus = 'loss';
              else {
                winStatus = totalTimeSpent < challengerTime ? 'win' : challengerTime < totalTimeSpent ? 'loss' : 'draw';
              }
            }

            const winnerId = winStatus === 'win' ? user.id : winStatus === 'loss' ? duelConfig.targetUserId : null;
            const loserId = winStatus === 'win' ? duelConfig.targetUserId : winStatus === 'loss' ? user.id : null;

            const duelPromises: any[] = [
              supabase.from('quiz_challenges').update({
                challenged_score: engineSnapshot.correctCount,
                challenged_time: totalTimeSpent,
                status: 'completed'
              }).eq('id', challengeId)
            ];

            if (winnerId && loserId && winStatus !== 'draw') {
              // Paraleliza transferência de XP
              duelPromises.push(supabase.rpc('increment_player_xp', { p_id: loserId, p_amount: -stake }));
              duelPromises.push(supabase.rpc('increment_player_xp', { p_id: winnerId, p_amount: stake }));
            }
            await Promise.all(duelPromises);
            console.log(`[QuizSystem] Duelo processado em background. Status: ${winStatus}`);
          } else {
            // Novo desafio
            await supabase.from('quiz_challenges').insert({
              challenger_id: user.id,
              challenged_id: duelConfig.targetUserId,
              level_id: duelConfig.levelId,
              stake: duelConfig.mode === 'training' ? 0 : duelConfig.stake,
              mode: duelConfig.mode,
              challenger_score: engineSnapshot.correctCount,
              challenger_time: totalTimeSpent,
              question_ids: questions.map(q => q.id),
              status: 'pending'
            });
          }
          return;
        }

        // Fluxo de Progressão Normal
        let finalXp = engineSnapshot.xp;
        if (currentChallenge === 4 && engineSnapshot.status === 'finished') finalXp += 150;
        const score = finalXp * 10;
        const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253';

        // 1. Snapshot de Stats (Paralelizado)
        const statsPromises = [
          supabase.from('player_global_stats').select('*').eq('player_id', user.id).maybeSingle(),
          supabase.from('player_game_stats').select('*').match({ player_id: user.id, game_id: QUIZ_GAME_ID }).maybeSingle()
        ];
        const [{ data: currentGlobal }, { data: currentPerGame }] = await Promise.all(statsPromises);

        const subjectMetadata = currentPerGame?.metadata?.[selectedSubject] || {};
        const challengeKey = `L${currentLevel}C${currentChallenge}`;
        const prevChallengeData = subjectMetadata.challenge_data?.[challengeKey] || { best_xp: 0 };
        const prevBestXp = Number(prevChallengeData.best_xp) || 0;
        const xpGain = Math.max(0, finalXp - prevBestXp);
        const scoreGain = xpGain * 10;

        const isChallengeFinished = engineSnapshot.status === 'finished';
        const isPerfect = isChallengeFinished && !engineSnapshot.hasMistakes;
        const challengeStatus = isChallengeFinished ? (isPerfect ? 'success' : 'partial') : 'failed';

        let nextUnlockedLevel = subjectMetadata.unlocked_level || 1;
        let nextUnlockedChallenge = subjectMetadata.unlocked_challenge || 1;

        if (isChallengeFinished && currentChallenge < 4) {
          if (currentLevel === nextUnlockedLevel && currentChallenge === nextUnlockedChallenge) {
            if (currentChallenge < 3) nextUnlockedChallenge = currentChallenge + 1;
            else { nextUnlockedLevel = currentLevel + 1; nextUnlockedChallenge = 1; }
          }
        }

        const updatedChallengeData = {
          ...(subjectMetadata.challenge_data || {}),
          [challengeKey]: {
            best_xp: Math.max(prevBestXp, finalXp),
            last_played: new Date().toISOString(),
            status: challengeStatus,
            correct_count: engineSnapshot.correctCount,
            completed: isChallengeFinished
          }
        };

        // 2. Persistência Final (TUDO PARALELO)
        const finalUpdatePromises: any[] = [
          supabase.from('game_sessions').insert({
            player_id: user.id,
            game_id: QUIZ_GAME_ID,
            score: score,
            completed: isChallengeFinished,
            metadata: {
              level: currentLevel,
              challenge: currentChallenge,
              xp_earned: finalXp,
              correct_count: engineSnapshot.correctCount,
              total_questions: engineSnapshot.totalQuestions,
              questions_log: engineSnapshot.questionsLog
            }
          }),
          supabase.from('player_global_stats').upsert({
            player_id: user.id,
            total_score: (Number(currentGlobal?.total_score) || 0) + scoreGain,
            galactic_xp: (Number(currentGlobal?.galactic_xp) || 0) + xpGain,
            total_sessions: (currentGlobal?.total_sessions || 0) + 1,
            updated_at: new Date().toISOString()
          }),
          supabase.from('player_game_stats').upsert({
            player_id: user.id,
            game_id: QUIZ_GAME_ID,
            total_score: (Number(currentPerGame?.total_score) || 0) + scoreGain,
            best_score: Math.max(Number(currentPerGame?.best_score) || 0, score),
            sessions_count: (currentPerGame?.sessions_count || 0) + 1,
            last_played_at: new Date().toISOString(),
            metadata: { 
              ...(currentPerGame?.metadata || {}), 
              [selectedSubject]: {
                unlocked_level: nextUnlockedLevel,
                unlocked_challenge: nextUnlockedChallenge,
                challenge_data: updatedChallengeData
              }
            }
          })
        ];

        // Troféus (Paralelo)
        if (engineSnapshot.correctCount > 0) finalUpdatePromises.push(TrophyService.updateProgress(user.id, 'quiz_first_correct', 1, false));
        if (engineSnapshot.maxCombo >= 5) finalUpdatePromises.push(TrophyService.updateProgress(user.id, 'quiz_streak_5', 1, true));
        if (engineSnapshot.correctCount > 0) finalUpdatePromises.push(TrophyService.updateProgress(user.id, 'quiz_total_20', engineSnapshot.correctCount, false));
        if (isPerfect) finalUpdatePromises.push(TrophyService.updateProgress(user.id, 'quiz_perfect_score', 1, true));
        if (currentLevel >= 5) finalUpdatePromises.push(TrophyService.updateProgress(user.id, 'prog_level_5', 1, true));
        finalUpdatePromises.push(ProgressionService.updateDailyStreak(user.id));

        await Promise.all(finalUpdatePromises);
        await refreshData();
        console.log('[QuizSystem] Salvo com sucesso em background! 🚀');
      } catch (err) {
        console.error('[QuizSystem] Erro no salvamento assíncrono:', err);
      } finally {
      }
    };

    performBackgroundSave();
  }

  useEffect(() => {
    if (engine.status === 'finished' || engine.status === 'gameover') {
      saveResults()
    }
  }, [engine.status])

  // Hook da Roleta de XP e Confetes
  useEffect(() => {
    const isResponse = isDuel && !!(duelConfig as any)?.challengeId
    const challengerScore = (duelConfig as any)?.challengerScore || 0
    const myScore = engine.correctCount
    const winStatus = isDuel ? (isResponse ? (myScore > challengerScore ? 'win' : myScore < challengerScore ? 'loss' : 'draw') : 'launched') : null

    if (winStatus === 'win' || winStatus === 'launched') {
      setShowConfetti(true)
      const duration = 1500; 
      const stake = duelConfig?.stake || 0
      let startTime: number | null = null;

      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        setAnimatedXp(Math.floor(progress * stake));
        if (progress < 1) requestAnimationFrame(animate);
      };
      requestAnimationFrame(animate);
    }
  }, [engine.status, isDuel, duelConfig])

  // 5. Tela de Início
  if (!isStarted) {
    return <QuizStartScreen mode={initialMode} defaultDuelMode={defaultDuelMode} onStart={handleStart} onExit={handleExit} onStartDuel={handleStartDuel} />
  }

  // 6. Resultado do Duelo (Lúdico e Animado)
  if (isDuel && (engine.status === 'gameover' || engine.status === 'finished')) {
    const isResponse = !!(duelConfig as any).challengeId
    const challengerScore = (duelConfig as any).challengerScore || 0
    const challengerTime = (duelConfig as any).challengerTime || 999999
    const myScore = engine.correctCount
    const totalTimeSpent = engine.questionsLog.reduce((acc, entry) => acc + entry.timeSpent, 0)
    const mode = duelConfig?.mode || 'classic'

    let winStatus = 'launched'
    if (isResponse) {
      if (mode === 'classic' || mode === 'training') {
        winStatus = myScore > challengerScore ? 'win' : myScore < challengerScore ? 'loss' : 'draw'
      } else {
        if (myScore > challengerScore) winStatus = 'win'
        else if (challengerScore > myScore) winStatus = 'loss'
        else {
          winStatus = totalTimeSpent < challengerTime ? 'win' : challengerTime < totalTimeSpent ? 'loss' : 'draw'
        }
      }
    }

    let title = "DUELO LANÇADO! ⚔️"
    let message = (
      <>
        Você acertou <strong>{engine.correctCount}</strong> perguntas {mode === 'speedrun' ? 'usando 3 vidas' : 'seguidas'}!<br/>
        {mode === 'speedrun' && <span>Tempo total: <strong>{totalTimeSpent}s</strong><br/></span>}
        Agora vamos ver se <strong>{duelConfig?.targetUserName}</strong> consegue te superar.
      </>
    )
    let accentColor = '#ff3d71'
    let emoji = "⚔️"
    
    if (winStatus === 'win') {
      title = "VITÓRIA ESTELAR! 🏆"
      const timeMsg = mode === 'speedrun' ? ` com ${totalTimeSpent}s (contra ${challengerTime}s)` : ''
      message = (
        <>
          Incrível! Você superou os <strong>{challengerScore}</strong> pontos <br/>
          de <strong>{duelConfig?.targetUserName}</strong>{timeMsg} e conquistou o prêmio!
        </>
      )
      accentColor = '#00e096'
      emoji = "🚀"
    } else if (winStatus === 'loss') {
      title = "DUELO PERDIDO... 🌑"
      const timeMsg = mode === 'speedrun' && myScore === challengerScore ? ` por tempo (${totalTimeSpent}s vs ${challengerTime}s)` : ''
      message = (
        <>
          Não foi dessa vez! <strong>{duelConfig?.targetUserName}</strong> <br/>
          defendeu a marca de <strong>{challengerScore}</strong> pontos{timeMsg}.
        </>
      )
      accentColor = '#ff3d71'
      emoji = "🛸"
    } else if (winStatus === 'draw') {
      title = "EMPATE TÉCNICO! ⚖️"
      message = (
        <>
          Ambos fizeram <strong>{myScore}</strong> pontos {mode === 'speedrun' && `em ${totalTimeSpent}s`}. <br/>
          Ninguém ganha ou perde XP neste duelo!
        </>
      )
      accentColor = '#ffb100'
      emoji = "⚖️"
    }

    return (
      <div className={styles.levelCompleteOverlay}>
        {showConfetti && <ConfettiCannon />}
        
        <div className={`${styles.levelCard} ${winStatus === 'win' ? styles.victoryGlow : ''}`} style={{ borderColor: accentColor }}>
          <div className={styles.victoryEmoji}>{emoji}</div>
          <h2 className={styles.levelTitle} style={{ color: accentColor }}>{title}</h2>
          <p className={styles.levelMsg}>{message}</p>
          
          <div className={styles.potPreview} style={{ margin: '20px 0', transform: 'scale(1.1)' }}>
            <div className={styles.potLabel}>PRÊMIO DO CONDOMÍNIO:</div>
            <div className={styles.potValue} style={{ color: accentColor, fontVariantNumeric: 'tabular-nums' }}>
              {winStatus === 'loss' || winStatus === 'draw' ? duelConfig?.stake : animatedXp} XP
            </div>
          </div>

          <button 
            className={styles.startDuelBtn} 
            onClick={() => {
              setShowConfetti(false)
              setAnimatedXp(0)
              handleFinishMission()
            }}
            style={{ backgroundColor: accentColor, transform: 'scale(1.05)' }}
          >
            VOLTAR PARA A BASE ➔
          </button>
        </div>
      </div>
    )
  }

  // 6. Resultado final (Game Over ou Desafio Final Concluído)
  if (engine.status === 'gameover' || (engine.status === 'finished' && currentLevel === 5)) {
    return (
      <QuizResult 
        status={engine.status} 
        xp={totalXp + engine.xp} 
        totalQuestions={questions.length} 
        correctAnswers={(totalXp + engine.xp) / 10}
        onRetry={() => setIsStarted(false)}
        onExit={handleExit}
        onShare={() => user && ProgressionService.recordShare(user.id, 'quiz')}
      />
    )
  }

  // 5. Tela de transição entre desafios
  if (engine.status === 'finished' && (currentLevel < 5 || currentChallenge < 3)) {
    return (
      <div className={styles.levelCompleteOverlay}>
        <div className={styles.levelCard}>
          <h2 className={styles.levelTitle}>Desafio {currentChallenge} do Nível {currentLevel} Concluído! 🚀</h2>
          <p className={styles.levelMsg}>Você está indo muito bem, astronauta!</p>
          <div className={styles.xpGained}>+{engine.xp} XP</div>
          <button 
            className={styles.nextLevelBtn} 
            onClick={handleFinishMission}
            style={{ opacity: 1 }}
          >
            CONTINUAR ➔
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.quizContainer}>
      <StarField />
      
      {/* 4. Interface (Step 5): Header c/ ProgressBar, Vidas e XP */}
      <QuizHeader 
        lives={engine.lives} 
        xp={engine.xp} 
        combo={engine.combo} 
        progress={(engine.currentIdx / questions.length) * 100}
        onExit={handleExit}
      />

      <main className={styles.quizMain}>
        <div key={engine.currentQuestion?.id} className={styles.questionWrapper}>
          {/* Renderer (Step 5) */}
          {engine.currentQuestion && (
            <QuestionRenderer 
              question={engine.currentQuestion} 
              onAnswer={engine.handleAnswer}
              disabled={engine.status === 'feedback'}
              timeMultiplier={1}
              introAudio={engine.introAudio} // Passa para sincronizar narração
            />
          )}
        </div>
      </main>

      {/* 5. Feedback (Step 4 & 6): Camada de Resposta c/ Mensagem do Théo */}
      {engine.status === 'feedback' && (
        <FeedbackLayer 
          isCorrect={!!engine.lastAnswerCorrect} 
          combo={engine.combo}
          explanation={engine.currentQuestion?.explanation}
          explanationAudio={engine.currentQuestion?.explanationAudio}
          onNext={engine.nextStep}
          lives={engine.lives}
        />
      )}
    </div>
  )
}

// Componente Lúdico de Confetes (Canvas)
function ConfettiCannon() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: any[] = [];
    const colors = ['#00e096', '#ff3d71', '#ffb100', '#4e64ff', '#ffffff', '#ff7e5f'];

    for (let i = 0; i < 150; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * (canvas.height / 2) + canvas.height, // Começa de baixo ou espalhado
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        speedX: Math.random() * 6 - 3,
        speedY: -(Math.random() * 15 + 10), // Atira pra cima
        rotation: Math.random() * 360,
        rotationSpeed: Math.random() * 10 - 5
      });
    }

    let animationId: number;
    function animate() {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((p) => {
        p.speedY += 0.2; // Gravidade
        p.y += p.speedY;
        p.x += p.speedX;
        p.rotation += p.rotationSpeed;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();
    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    />
  );
}
