import { useState, useRef } from 'react'
import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'
import { IoPlay, IoVolumeHigh } from 'react-icons/io5'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

export default function AudioGuess({ question, onAnswer, disabled }: TypeProps) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  const handlePlay = () => {
    if (audioRef.current) {
      audioRef.current.play()
      setPlaying(true)
      audioRef.current.onended = () => setPlaying(false)
    }
  }

  const planetIllustrations: Record<string, string> = {
    'Terra': '🌍',
    'Marte': '🔴',
    'Netuno': '🔵',
    'Vênus': '🟠',
    'Mercúrio': '🌑',
    'Júpiter': '🟠',
    'Saturno': '🪐',
    'Urano': '🧊'
  }

  return (
    <div className={styles.audioContainer}>
      <audio ref={audioRef} src={question.audio} />
      
      <button 
        className={`${styles.playBtn} ${playing ? styles.playing : ''}`} 
        onClick={handlePlay} 
        disabled={disabled}
      >
        <div className={styles.playIconWrapper}>
          {playing ? <IoVolumeHigh /> : <IoPlay />}
        </div>
        <span>{playing ? 'Ouvindo...' : 'Ouvir o Théo'}</span>
      </button>

      <div className={styles.optionsGridRow}>
        {question.options?.map((option: string, idx: number) => (
          <button
            key={idx}
            className={styles.optionIllustrationBtn}
            onClick={() => onAnswer(option === question.correctAnswer)}
            disabled={disabled}
          >
            <span className={styles.optionEmoji}>{planetIllustrations[option] || '🪐'}</span>
            <span className={styles.optionLabel}>{option}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
