import { useState, useMemo, useEffect, useRef, useCallback } from 'react'
import { THEO_QUIZ_DATA } from '@/data/quizQuestions'
import { useQuizEngine } from '@/hooks/useQuizEngine'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import styles from './QuizSystem.module.css'
import QuestionRenderer from './QuestionRenderer.tsx'
import QuizHeader from './QuizHeader.tsx'
import FeedbackLayer from './FeedbackLayer.tsx'
import QuizResult from './QuizResult.tsx'
import StarField from '@/components/StarField'
import QuizStartScreen from './QuizStartScreen.tsx'
import { TrophyService } from '@/services/trophyService'
import { ProgressionService } from '@/services/progressionService'

interface QuizSystemProps {
  level?: number
  challenge?: number
  mode?: 'normal' | 'quick' | 'challenge'
  onExit: () => void
}

interface DuelConfig {
  targetUserId: string
  targetUserName: string
  levelId: number
  stake: number
  challengeId?: string 
  challengerScore?: number // Pontuação do desafiante para bater
  questionIds?: string[]   // IDs das perguntas na ordem original (IDs são strings agora)
}

export default function QuizSystem({ level: initialLevel = 1, challenge: initialChallenge = 1, mode: initialMode = 'normal', onExit }: QuizSystemProps) {
  const { user } = useAuth()
  const { playSFX, playBGMusic, stopBGMusic, playTrack } = useSound()

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
    if (!user || hasGreetedEffect.current) return
    
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
  }, [user, playTrack])

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
  
  // Efeito de XP animado (Roleta)
  const [animatedXp, setAnimatedXp] = useState(0)
  const [showConfetti, setShowConfetti] = useState(false)

  // 1. Filtra as questões do nível e desafio atual
  const questions = useMemo(() => {
    if (isDuel && duelConfig) {
      const allLevelQuestions = THEO_QUIZ_DATA.filter(q => q.level === duelConfig.levelId);
      
      // Se for resposta a um desafio, usamos os IDs salvos
      if (duelConfig.questionIds && duelConfig.questionIds.length > 0) {
        return duelConfig.questionIds
          .map(id => allLevelQuestions.find(q => q.id === id))
          .filter(Boolean) as typeof THEO_QUIZ_DATA;
      }

      // Se for Novo Duelo, embaralhamos
      return [...allLevelQuestions].sort(() => 0.5 - Math.random());
    }
    return THEO_QUIZ_DATA.filter(q => q.level === currentLevel && q.challenge === currentChallenge)
      .sort(() => 0.5 - Math.random())
  }, [currentLevel, currentChallenge, isDuel, duelConfig])

  // 2. Engine do Quiz
  const engine = useQuizEngine(questions, {
    mode: isDuel ? 'duel' : 'normal',
    maxTargetScore: isDuel ? duelConfig?.challengerScore : undefined
  })

  // 3. Handler para começar
  const handleStart = (selectedLevel: number, selectedChallenge: number = 1) => {
    playSFX('click')
    setIsDuel(false)
    setDuelConfig(null)
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
    setDuelConfig(config)
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
    
    console.log('[DEBUG] Iniciando saveResults. isDuel:', isDuel, 'status:', engine.status)
    setHasSaved(true)

    // Lógica especial para Duelo
    if (isDuel && duelConfig) {
      const challengeId = (duelConfig as any).challengeId; // Tentando pegar de qualquer forma
      const isResponse = !!challengeId;
      
      console.log(`%c [DEBUG] saveResults DUELO - ID: ${challengeId} | IsResponse: ${isResponse} `, 'background: #ff3d71; color: #fff; padding: 5px;')
      
      try {
        if (isResponse) {
          // Oponente ACEITOU o desafio e agora terminou de jogar
          const challengerScore = (duelConfig as any).challengerScore || 0
          const challengedScore = engine.correctCount
          const stake = duelConfig.stake
          
          console.log(`[DEBUG] Scores do Duelo: Desafiante=${challengerScore} | Você=${challengedScore}`)

          let winStatus = 'draw';
          let winnerId = null;
          let loserId = null;

          if (challengedScore > challengerScore) {
            winStatus = 'win';
            winnerId = user.id; // Você venceu
            loserId = duelConfig.targetUserId; // Desafiante perdeu
          } else if (challengerScore > challengedScore) {
            winStatus = 'loss';
            winnerId = duelConfig.targetUserId; // Desafiante venceu
            loserId = user.id; // Você perdeu
          }

          // 1. Atualizar o registro do desafio
          const { error: updateErr } = await supabase
            .from('quiz_challenges')
            .update({
              challenged_score: challengedScore,
              status: 'completed'
            })
            .eq('id', challengeId)
          
          if (updateErr) throw updateErr

          // 2. Transferir XP (Se houver vencedor claro)
          if (winnerId && loserId && winStatus !== 'draw') {
             console.log(`[DEBUG] Transferindo ${stake} XP de ${loserId} para ${winnerId}`)
             
             // A. Tirar do Perdedor
             const { error: err1 } = await supabase.rpc('increment_player_xp', { p_id: loserId, p_amount: -stake });
             if (err1) {
                console.error('[ERROR] Falha ao tirar XP do perdedor:', err1.message)
                // Tentativa B: Update direto caso o RPC falhe
                const { data: pStats } = await supabase.from('player_global_stats').select('galactic_xp').eq('player_id', loserId).single()
                if (pStats) {
                  await supabase.from('player_global_stats').update({ galactic_xp: (pStats.galactic_xp || 0) - stake }).eq('player_id', loserId)
                }
             }

             // B. Dar ao Vencedor
             const { error: err2 } = await supabase.rpc('increment_player_xp', { p_id: winnerId, p_amount: stake });
             if (err2) {
                console.error('[ERROR] Falha ao dar XP ao vencedor:', err2.message)
                // Tentativa B: Update direto caso o RPC falhe
                const { data: wStats } = await supabase.from('player_global_stats').select('galactic_xp').eq('player_id', winnerId).single()
                if (wStats) {
                  await supabase.from('player_global_stats').update({ galactic_xp: (wStats.galactic_xp || 0) + stake }).eq('player_id', winnerId)
                }
             }

             console.log(`[QuizSystem] Fim da transação. Status: ${winStatus}`)
          }
          
          return;
        } else {
          // Início de um NOVO desafio
          const { error: insertErr } = await supabase.from('quiz_challenges').insert({
            challenger_id: user.id,
            challenged_id: duelConfig.targetUserId,
            level_id: duelConfig.levelId,
            stake: duelConfig.stake,
            challenger_score: engine.correctCount,
            question_ids: questions.map(q => q.id), // Salva a ordem das perguntas!
            status: 'pending'
          })
          
          if (insertErr) {
            console.error('[DEBUG] ERRO AO INSERIR NOVO DUELO:', insertErr)
            throw insertErr
          }
          console.log('[QuizSystem] Novo duelo lançado com sucesso!')
        }
        return
      } catch (err) {
        console.error('[QuizSystem] Erro fatal no salvamento do duelo:', err)
        return
      }
    }

    let finalXp = engine.xp
    // Bonus de Revisão
    if (currentChallenge === 4 && engine.status === 'finished') {
       finalXp += 150
    }
    const score = finalXp * 10
    const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253'

    console.log(`[QuizSystem] Iniciando gravação: Missão ${currentLevel}, Desafio ${currentChallenge}, XP: ${finalXp}, Status: ${engine.status}`);

    try {
      // 1. Save Session
      const { error: sessionErr } = await supabase.from('game_sessions').insert({
        player_id: user.id,
        game_id: QUIZ_GAME_ID,
        score: score,
        completed: engine.status === 'finished',
        metadata: {
           level: currentLevel,
           challenge: currentChallenge,
           xp_earned: finalXp
        }
      })
      if (sessionErr) throw sessionErr;

      // 2. Fetch current stats to calculate progress
      const { data: currentGlobal } = await supabase
        .from('player_global_stats')
        .select('*')
        .eq('player_id', user.id)
        .maybeSingle()
      
      const { data: currentPerGame } = await supabase
        .from('player_game_stats')
        .select('*')
        .match({ player_id: user.id, game_id: QUIZ_GAME_ID })
        .maybeSingle()

      // 3. Update Global Stats (Incremental XP)
      const challengeKey = `L${currentLevel}C${currentChallenge}`
      const prevChallengeData = currentPerGame?.metadata?.challenge_data?.[challengeKey] || { best_xp: 0 }
      const prevBestXp = Number(prevChallengeData.best_xp) || 0
      
      // Só somamos o que for NOVO (diferença entre o atual e o melhor anterior)
      const xpGain = Math.max(0, finalXp - prevBestXp)
      const scoreGain = xpGain * 10

      console.log(`[QuizSystem] Diferença de XP (${challengeKey}): Atual ${finalXp} vs Melhor Antigo ${prevBestXp}. Ganho Real: ${xpGain}`);

      const updatedTotalScore = (Number(currentGlobal?.total_score) || 0) + scoreGain
      const updatedGalacticXp = (Number(currentGlobal?.galactic_xp) || 0) + xpGain
      const updatedSessions = (currentGlobal?.total_sessions || 0) + 1

      const { error: globalErr } = await supabase.from('player_global_stats').upsert({
        player_id: user.id,
        total_score: updatedTotalScore,
        galactic_xp: updatedGalacticXp,
        total_sessions: updatedSessions,
        updated_at: new Date().toISOString()
      })
      if (globalErr) throw globalErr;

      // 4. Update Game Stats & Unlock Levels/Challenges
      const currentUnlockedLevel = currentPerGame?.metadata?.unlocked_level || 1
      const currentUnlockedChallenge = currentPerGame?.metadata?.unlocked_challenge || 1
      
      const isChallengeFinished = engine.status === 'finished'
      const isPerfect = isChallengeFinished && !engine.hasMistakes
      const challengeStatus = isChallengeFinished ? (isPerfect ? 'success' : 'partial') : 'failed'
      
      let nextUnlockedLevel = currentUnlockedLevel
      let nextUnlockedChallenge = currentUnlockedChallenge

      // Só liberamos a próxima missão se NÃO for um desafio de revisão
      if (isChallengeFinished && currentChallenge < 4) {
        if (currentLevel === currentUnlockedLevel && currentChallenge === currentUnlockedChallenge) {
          if (currentChallenge < 3) {
            nextUnlockedChallenge = currentChallenge + 1
          } else {
            nextUnlockedLevel = currentLevel + 1
            nextUnlockedChallenge = 1
          }
        }
      }

      // Update challenge data in metadata
      const updatedChallengeData = {
        ...(currentPerGame?.metadata?.challenge_data || {}),
        [challengeKey]: {
          best_xp: Math.max(prevBestXp, finalXp),
          last_played: new Date().toISOString(),
          status: challengeStatus,
          correct_count: engine.correctCount,
          completed: isChallengeFinished
        }
      }

      const { error: gameErr } = await supabase.from('player_game_stats').upsert({
        player_id: user.id,
        game_id: QUIZ_GAME_ID,
        total_score: (Number(currentPerGame?.total_score) || 0) + scoreGain,
        best_score: Math.max(Number(currentPerGame?.best_score) || 0, score),
        sessions_count: (currentPerGame?.sessions_count || 0) + 1,
        last_played_at: new Date().toISOString(),
        metadata: { 
          ...(currentPerGame?.metadata || {}), 
          unlocked_level: nextUnlockedLevel,
          unlocked_challenge: nextUnlockedChallenge,
          challenge_data: updatedChallengeData
        }
      })
      if (gameErr) throw gameErr;

      // 5. Trophy Progress & Unlocks
      // Utilize existing isChallengeFinished and isPerfect from above scope (lines 356-357)
      
      // Update: First Correct (if correctCount > 0)
      if (engine.correctCount > 0) {
        await TrophyService.updateProgress(user.id, 'quiz_first_correct', 1, false)
      }

      // Update: Streak (if combo >= 5)
      if (engine.maxCombo >= 5) {
        await TrophyService.updateProgress(user.id, 'quiz_streak_5', 1, true)
      }

      // Update: Total Correct (Incremental)
      if (engine.correctCount > 0) {
        await TrophyService.updateProgress(user.id, 'quiz_total_20', engine.correctCount, false)
      }

      // Update: Perfect Score (meta: 1)
      if (isPerfect) {
        await TrophyService.updateProgress(user.id, 'quiz_perfect_score', 1, true)
      }

      // Check Progression: Level 5 Reached (Astrônomo Júnior)
      if (currentLevel >= 5) {
        await TrophyService.updateProgress(user.id, 'prog_level_5', 1, true)
      }

      // 6. Update Daily Streak & Awards
      await ProgressionService.updateDailyStreak(user.id);

      console.log('[QuizSystem] Tudo gravado com sucesso! 🚀');

    } catch (err) {
      console.error('[QuizSystem] Erro fatal ao salvar progresso:', err)
      setHasSaved(false) // Permite tentar novamente se falhou
    }
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
    return <QuizStartScreen mode={initialMode} onStart={handleStart} onExit={handleExit} onStartDuel={handleStartDuel} />
  }

  // 6. Resultado do Duelo (Lúdico e Animado)
  if (isDuel && (engine.status === 'gameover' || engine.status === 'finished')) {
    const isResponse = !!(duelConfig as any).challengeId
    const challengerScore = (duelConfig as any).challengerScore || 0
    const myScore = engine.correctCount
    const winStatus = isResponse ? (myScore > challengerScore ? 'win' : myScore < challengerScore ? 'loss' : 'draw') : 'launched'

    let title = "DUELO LANÇADO! ⚔️"
    let message = (
      <>
        Você acertou <strong>{engine.correctCount}</strong> perguntas seguídas!<br/>
        Agora vamos ver se <strong>{duelConfig?.targetUserName}</strong> consegue te superar.
      </>
    )
    let accentColor = '#ff3d71'
    let emoji = "⚔️"
    
    if (winStatus === 'win') {
      title = "VITÓRIA ESTELAR! 🏆"
      message = (
        <>
          Incrível! Você superou os <strong>{challengerScore}</strong> pontos <br/>
          de <strong>{duelConfig?.targetUserName}</strong> e conquistou o prêmio!
        </>
      )
      accentColor = '#00e096'
      emoji = "🚀"
    } else if (winStatus === 'loss') {
      title = "DUELO PERDIDO... 🌑"
      message = (
        <>
          Não foi dessa vez! <strong>{duelConfig?.targetUserName}</strong> <br/>
          defendeu a marca de <strong>{challengerScore}</strong> pontos.
        </>
      )
      accentColor = '#ff3d71'
      emoji = "🛸"
    } else if (winStatus === 'draw') {
      title = "EMPATE TÉCNICO! ⚖️"
      message = (
        <>
          Ambos fizeram <strong>{myScore}</strong> pontos. <br/>
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
          <button className={styles.nextLevelBtn} onClick={handleFinishMission}>
            PROSSEGUIR JORNADA ➔
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
