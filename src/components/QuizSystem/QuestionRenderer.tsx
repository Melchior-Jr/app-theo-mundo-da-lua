import { useState, useEffect, useRef } from 'react'
import { QuizQuestion } from '@/types/quiz'
import styles from './QuizSystem.module.css'
import { useSound } from '@/context/SoundContext'
import MultipleChoice from './types/MultipleChoice'
import TrueFalse from './types/TrueFalse'
import DragDropOrder from './types/DragDropOrder'
import FillBlanks from './types/FillBlanks'
import FastResponse from './types/FastResponse'
import SceneSelection from './types/SceneSelection'
import AudioGuess from './types/AudioGuess'
import DragDropMatch from './types/DragDropMatch'
import LogicalSequence from './types/LogicalSequence'
import ImageId from './types/ImageId'
import PlanetViewer3D from '@/components/PlanetViewer3D'

interface QuestionRendererProps {
  question: QuizQuestion
  mode: string
  timeMultiplier: number
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
  introAudio?: HTMLAudioElement | null
}

export default function QuestionRenderer({ 
  question, 
  timeMultiplier, 
  onAnswer, 
  disabled,
  introAudio
}: Omit<QuestionRendererProps, 'mode'>) {
  const { playSFX, playTrack } = useSound()
  const [revealedSelection, setRevealedSelection] = useState<any>(null)
  const hasStartedAudio = useRef<string | null>(null)

  // 2. Resetar estados ao mudar de questão
  useEffect(() => {
    setRevealedSelection(null)
    hasStartedAudio.current = null // Permite narração na nova questão
  }, [question.id])

  // 1. Narração automática da questão
  useEffect(() => {
    let questionPlayer: HTMLAudioElement | null = null
    let playTimeout: NodeJS.Timeout | null = null
    
    if (question.audio) {
      const audioToPlay = question.audio
      
      const startQuestionAudio = () => {
        // Trava para não tocar 2x a mesma questão
        if (hasStartedAudio.current === question.id) return
        hasStartedAudio.current = question.id
        
        playTimeout = setTimeout(() => {
          questionPlayer = playTrack(audioToPlay!, 0.9)
        }, 300)
      }

      // Se houver áudio de introdução (QStart ou Hard), esperamos ele acabar
      if (introAudio) {
        introAudio.onended = () => {
          startQuestionAudio()
        }
        // Fallback caso já tenha acabado ou esteja no fim
        if (introAudio.ended) {
          startQuestionAudio()
        }
      } else {
        // Se não tem intro (ou se ela foi limpa após o fim natural), 
        // disparamos após o delay padrão
        startQuestionAudio()
      }
      
      return () => {
        if (introAudio) introAudio.onended = null
        if (playTimeout) clearTimeout(playTimeout)
        questionPlayer?.pause()
      }
    }
  }, [question.id, question.audio, playTrack, introAudio])

  const handleInterceptAnswer = (isCorrect: boolean, selection?: any) => {
    if (disabled || revealedSelection !== null) return
    
    // Revelar na UI local
    setRevealedSelection(selection ?? (isCorrect ? 'correct' : 'wrong'))

    // Som imediato
    playSFX(isCorrect ? 'correct' : 'wrong')

    // Atraso antes de chamar o pai (mudar status para feedback)
    setTimeout(() => {
      onAnswer(isCorrect)
    }, 800)
  }

  const commonProps = {
    question,
    onAnswer: handleInterceptAnswer,
    disabled: disabled || revealedSelection !== null,
    revealedSelection // Passa a seleção para os componentes filhos
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice': return <MultipleChoice {...commonProps} />
      case 'true-false': return <TrueFalse {...commonProps} />
      case 'drag-drop-order': return <DragDropOrder {...commonProps} />
      case 'drag-drop-match': return <DragDropMatch {...commonProps} />
      case 'image-id': return <ImageId {...commonProps} />
      case 'fast-response': return (
        <FastResponse 
          {...commonProps} 
          timeLimit={(question.timeLimit || 10) * timeMultiplier} 
        />
      )
      case 'fill-blanks': return <FillBlanks {...commonProps} />
      case 'scene-selection': return <SceneSelection {...commonProps} />
      case 'audio-guess': return <AudioGuess {...commonProps} />
      case 'logical-sequence': return <LogicalSequence {...commonProps} />
      default: return (
        <div className={styles.typeError}>
          Ops! Théo esqueceu como fazer esse tipo de pergunta: {question.type}
        </div>
      )
    }
  }

  return (
    <div className={styles.rendererContainer} data-type={question.type}>
      {question.modelUrl && (
        <div className={styles.questionModel}>
          <PlanetViewer3D 
            modelSrc={question.modelUrl} 
            alt={question.question}
            color="#4facfe"
            autoRotate
            rotationSpeed="15deg"
          />
        </div>
      )}
      <h2 className={styles.questionText}>{question.question}</h2>
      {renderQuestion()}
    </div>
  )
}
