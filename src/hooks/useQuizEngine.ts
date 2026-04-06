import { useState, useCallback } from 'react'
import { QuizQuestion, QuizState } from '@/types/quiz'
import { useSound } from '@/context/SoundContext'

export type EngineMode = 'normal' | 'duel'

interface EngineOptions {
  mode?: EngineMode
  maxTargetScore?: number // Pontuação para vitória imediata
}

export function useQuizEngine(questions: QuizQuestion[], options: EngineMode | EngineOptions = 'normal') {
  const { playSFX, playTrack } = useSound()
  const mode = typeof options === 'string' ? options : (options.mode || 'normal')
  const maxTargetScore = typeof options === 'object' ? options.maxTargetScore : undefined
  const isDuel = mode === 'duel'

  const [state, setState] = useState<QuizState>({
    currentIdx: 0,
    lives: isDuel ? 1 : 3,
    xp: 0,
    combo: 0,
    status: 'playing',
    lastAnswerCorrect: null,
    correctCount: 0,
    hasMistakes: false,
    maxCombo: 0
  })

  const [introAudio, setIntroAudio] = useState<HTMLAudioElement | null>(null)

  const currentQuestion = questions[state.currentIdx]

  const handleAnswer = useCallback((isCorrect: boolean) => {
    // Parar introdução se houver
    if (introAudio) {
      introAudio.pause()
      setIntroAudio(null)
    }

    // Calcular novos valores baseados no estado atual
    const nextCombo = isCorrect ? state.combo + 1 : 0

    // --- REAÇÕES DE ÁUDIO (Fora do setState para evitar execução dupla) ---
    if (isCorrect) {
      if (nextCombo >= 3) {
        const comboNum = Math.floor(Math.random() * 4) + 1
        playTrack(`/audio/Quiz Intergaláctico/Combo_0${comboNum}.MP3`)
      } else {
        const hitNum = Math.floor(Math.random() * 5) + 1
        playTrack(`/audio/Quiz Intergaláctico/Hit_0${hitNum}.MP3`)
      }
    } else {
      const missNum = Math.floor(Math.random() * 5) + 1
      playTrack(`/audio/Quiz Intergaláctico/Miss_0${missNum}.MP3`)
    }

    setState(prev => {
      // Regra de XP: 10 base. A partir do combo 3, dobra o XP anterior do acerto.
      // Ex: Combo 1: 10, Combo 2: 10, Combo 3: 20, Combo 4: 40, Combo 5: 80...
      let xpAwarded = 0
      if (isCorrect) {
        if (prev.combo < 2) {
          xpAwarded = 10
        } else {
          // Se combo já era 2, esse acerto é o 3º -> 20 XP
          // Se combo já era 3, esse acerto é o 4º -> 40 XP
          // Fórmula: 10 * 2^(combo - 1)
          // Mas vamos limitar para não explodir em listas gigantes (ex: 1000 XP max por questão)
          xpAwarded = Math.min(1000, 10 * Math.pow(2, prev.combo - 1))
        }
      }

      const newXP = isCorrect ? prev.xp + xpAwarded : prev.xp
      const currentCombo = isCorrect ? prev.combo + 1 : 0
      const newLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1)
      const newCorrectCount = isCorrect ? prev.correctCount + 1 : prev.correctCount
      const newHasMistakes = prev.hasMistakes || !isCorrect
      const newMaxCombo = Math.max(prev.maxCombo, currentCombo)

      // Vitória Imediata (Duelo)
      if (maxTargetScore !== undefined && newCorrectCount > maxTargetScore && isCorrect) {
        const winNum = Math.floor(Math.random() * 3) + 1
        playTrack(`/audio/Quiz Intergaláctico/Win_0${winNum}.MP3`)
        return { 
          ...prev, 
          xp: newXP, 
          combo: currentCombo, 
          lives: newLives, 
          status: 'finished', 
          lastAnswerCorrect: isCorrect, 
          correctCount: newCorrectCount, 
          hasMistakes: newHasMistakes,
          maxCombo: newMaxCombo
        }
      }

      return {
        ...prev,
        xp: newXP,
        combo: currentCombo,
        lives: newLives,
        status: 'feedback',
        lastAnswerCorrect: isCorrect,
        correctCount: newCorrectCount,
        hasMistakes: newHasMistakes,
        maxCombo: newMaxCombo
      }
    })
  }, [maxTargetScore, playTrack, introAudio, state])

  const nextStep = useCallback(() => {
    const isLast = state.currentIdx === questions.length - 1
    const isDead = state.lives <= 0
    const nextIdx = state.currentIdx + 1
    const nextQuestion = questions[nextIdx]

    // 1. GAME OVER / VITÓRIA
    if (isDuel && !state.lastAnswerCorrect) {
      playSFX('fail')
      const deathNum = Math.floor(Math.random() * 5) + 1
      playTrack(`/audio/Quiz Intergaláctico/Death_0${deathNum}.MP3`)
      setState(prev => ({ ...prev, status: 'gameover' }))
      return
    }

    if (isDead) {
      playSFX('fail')
      const deathNum = Math.floor(Math.random() * 5) + 1
      playTrack(`/audio/Quiz Intergaláctico/Death_0${deathNum}.MP3`)
      setState(prev => ({ ...prev, status: 'gameover' }))
      return
    }
    
    if (isLast) {
      playSFX('success')
      const winNum = Math.floor(Math.random() * 3) + 1
      playTrack(`/audio/Quiz Intergaláctico/Win_0${winNum}.MP3`)
      
      setState(prev => {
        const bonusXP = !prev.hasMistakes ? 300 : 0
        return { ...prev, status: 'finished', xp: prev.xp + bonusXP }
      })
      return
    }

    // 2. PRÓXIMA PERGUNTA (Sincronização de Intro)
    let newAudio: HTMLAudioElement | null = null

    // Se pergunta for dita como difícil (ex: level 4+), usamos Hard_XX
    if (nextQuestion && nextQuestion.level >= 4) {
      const hardNum = Math.floor(Math.random() * 2) + 1
      newAudio = playTrack(`/audio/Quiz Intergaláctico/Hard_0${hardNum}.MP3`)
    } else if (nextIdx % 3 === 0) {
      // QStart a cada 3 perguntas
      const qStartNum = Math.floor(Math.random() * 5) + 1
      newAudio = playTrack(`/audio/Quiz Intergaláctico/QStart_0${qStartNum}.MP3`)
    }

    setIntroAudio(newAudio)
    setState(prev => ({
      ...prev,
      currentIdx: nextIdx,
      status: 'playing',
      lastAnswerCorrect: null
    }))
  }, [questions, playSFX, playTrack, isDuel, state])

  const reset = useCallback(() => {
    setIntroAudio(null)
    setState({
      currentIdx: 0,
      lives: isDuel ? 1 : 3,
      xp: 0,
      combo: 0,
      status: 'playing',
      lastAnswerCorrect: null,
      correctCount: 0,
      hasMistakes: false,
      maxCombo: 0
    })
  }, [isDuel])

  return {
    ...state,
    currentQuestion,
    totalQuestions: questions.length,
    handleAnswer,
    nextStep,
    reset,
    introAudio,
    setIntroAudio
  }
}
