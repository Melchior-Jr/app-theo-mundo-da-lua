import { useState, useCallback } from 'react'
import { QuizQuestion, QuizState } from '@/types/quiz'
import { useSound } from '@/context/SoundContext'
import { useAudioAssets } from '@/context/AudioAssetsContext'


export type EngineMode = 'normal' | 'duel'
export type DuelMode = 'classic' | 'speedrun'

interface EngineOptions {
  mode?: EngineMode
  duelMode?: DuelMode
  maxTargetScore?: number // Pontuação para vitória imediata
  subjectId?: string // Matéria para filtro de áudio
}


export function useQuizEngine(questions: QuizQuestion[], options: EngineMode | EngineOptions = 'normal') {
  const { playSFX, playTrack } = useSound()
  const { getRandomAsset } = useAudioAssets()

  const mode = typeof options === 'string' ? options : (options.mode || 'normal')
  const duelMode = typeof options === 'object' ? options.duelMode : 'classic'
  const maxTargetScore = typeof options === 'object' ? options.maxTargetScore : undefined
  const currentSubjectId = typeof options === 'object' ? options.subjectId : undefined
  const isDuel = mode === 'duel'


  const [state, setState] = useState<QuizState>({
    currentIdx: 0,
    lives: isDuel ? (duelMode === 'speedrun' ? 3 : 1) : 3,
    xp: 0,
    combo: 0,
    status: 'playing',
    lastAnswerCorrect: null,
    correctCount: 0,
    hasMistakes: false,
    maxCombo: 0,
    questionsLog: []
  })

  const [questionStartTime, setQuestionStartTime] = useState<number>(performance.now())
  const [introAudio, setIntroAudio] = useState<HTMLAudioElement | null>(null)

  const currentQuestion = questions[state.currentIdx]

  const handleAnswer = useCallback((isCorrect: boolean) => {
    // Calcular tempo gasto
    const now = performance.now()
    const timeSpent = Math.round((now - questionStartTime) / 1000)

    // Parar introdução se houver
    if (introAudio) {
      introAudio.pause()
      setIntroAudio(null)
    }

    // Calcular novos valores baseados no estado atual
    const nextCombo = isCorrect ? state.combo + 1 : 0

    // --- REAÇÕES DE ÁUDIO ---
    if (isCorrect) {
      if (nextCombo >= 3) {
        const url = getRandomAsset('combo', currentSubjectId);
        if (url) playTrack(url);
      } else {
        const url = getRandomAsset('hit', currentSubjectId);
        if (url) playTrack(url);
      }
    } else {
      const url = getRandomAsset('miss', currentSubjectId);
      if (url) playTrack(url);
    }


    setState(prev => {
      let xpAwarded = 0
      if (isCorrect) {
        if (prev.combo < 2) {
          xpAwarded = 10
        } else {
          xpAwarded = Math.min(1000, 10 * Math.pow(2, prev.combo - 1))
        }
      }

      const newXP = isCorrect ? prev.xp + xpAwarded : prev.xp
      const currentCombo = isCorrect ? prev.combo + 1 : 0
      const newLives = isCorrect ? prev.lives : Math.max(0, prev.lives - 1)
      const newCorrectCount = isCorrect ? prev.correctCount + 1 : prev.correctCount
      const newHasMistakes = prev.hasMistakes || !isCorrect
      const newMaxCombo = Math.max(prev.maxCombo, currentCombo)

      // Registrar no log
      const logEntry = {
        questionId: questions[prev.currentIdx].id,
        isCorrect,
        timeSpent
      }
      const newLog = [...prev.questionsLog, logEntry]

      // Vitória Imediata (Duelo)
      if (maxTargetScore !== undefined && newCorrectCount > maxTargetScore && isCorrect) {
        const url = getRandomAsset('win', currentSubjectId);
        if (url) playTrack(url);

        return { 
          ...prev, 
          xp: newXP, 
          combo: currentCombo, 
          lives: newLives, 
          status: 'finished', 
          lastAnswerCorrect: isCorrect, 
          correctCount: newCorrectCount, 
          hasMistakes: newHasMistakes,
          maxCombo: newMaxCombo,
          questionsLog: newLog
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
        maxCombo: newMaxCombo,
        questionsLog: newLog
      }
    })
  }, [maxTargetScore, playTrack, introAudio, state, questionStartTime, questions, currentSubjectId, getRandomAsset])

  const nextStep = useCallback(() => {
    const isLast = state.currentIdx === questions.length - 1
    const isDead = state.lives <= 0
    const nextIdx = state.currentIdx + 1
    const nextQuestion = questions[nextIdx]

    // Resetar timer para a próxima pergunta
    setQuestionStartTime(performance.now())

    // 1. GAME OVER / VITÓRIA
    const isGameOverClassic = isDuel && duelMode === 'classic' && !state.lastAnswerCorrect
    
    if (isGameOverClassic || isDead) {
      playSFX('fail')
      const url = getRandomAsset('death', currentSubjectId);
      if (url) playTrack(url);
      setState(prev => ({ ...prev, status: 'gameover' }))

      return
    }
    
    if (isLast) {
      playSFX('success')
      const url = getRandomAsset('win', currentSubjectId);
      if (url) playTrack(url);

      
      setState(prev => {
        const bonusXP = !prev.hasMistakes ? 300 : 0
        return { ...prev, status: 'finished', xp: prev.xp + bonusXP }
      })
      return
    }

    // 2. PRÓXIMA PERGUNTA
    let newAudio: HTMLAudioElement | null = null

    if (nextQuestion && nextQuestion.level >= 4) {
      const url = getRandomAsset('hard', currentSubjectId);
      if (url) newAudio = playTrack(url);
    } else if (nextIdx % 3 === 0) {
      const url = getRandomAsset('start', currentSubjectId);
      if (url) newAudio = playTrack(url);
    }


    setIntroAudio(newAudio)
    setState(prev => ({
      ...prev,
      currentIdx: nextIdx,
      status: 'playing',
      lastAnswerCorrect: null
    }))
  }, [questions, playSFX, playTrack, isDuel, state, currentSubjectId, getRandomAsset])

  const reset = useCallback(() => {
    setIntroAudio(null)
    setQuestionStartTime(performance.now())
    setState({
      currentIdx: 0,
      lives: isDuel ? (duelMode === 'speedrun' ? 3 : 1) : 3,
      xp: 0,
      combo: 0,
      status: 'playing',
      lastAnswerCorrect: null,
      correctCount: 0,
      hasMistakes: false,
      maxCombo: 0,
      questionsLog: []
    })
  }, [isDuel, duelMode])

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
