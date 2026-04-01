import { useState, useEffect } from 'react'
import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
  timeLimit: number
}

export default function FastResponse({ question, onAnswer, disabled, timeLimit }: TypeProps) {
  const [timeLeft, setTimeLeft] = useState(timeLimit)

  useEffect(() => {
    if (disabled || timeLeft <= 0) return
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          onAnswer(false) // Tempo esgotado = Erro
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [disabled, timeLeft, onAnswer])

  return (
    <div className={styles.fastResponseContainer}>
      <div className={`${styles.timerCircle} ${timeLeft < 3 ? styles.timerWarning : ''}`}>
        <div 
          className={styles.timerFill} 
          style={{ 
            height: `${(timeLeft / timeLimit) * 100}%`,
            background: timeLeft < 3 ? 'var(--quiz-wrong)' : 'var(--quiz-accent)'
          }} 
        />
        <span className={styles.timerNum}>{Math.ceil(timeLeft)}s</span>
      </div>

      <div className={styles.optionsGrid}>
        {question.options?.map((option: string, idx: number) => (
          <button
            key={idx}
            className={styles.optionBtn}
            onClick={() => onAnswer(option === question.correctAnswer)}
            disabled={disabled}
          >
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
