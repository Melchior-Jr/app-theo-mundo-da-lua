import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean, selection?: any) => void
  disabled: boolean
  revealedSelection?: any
}

export default function MultipleChoice({ question, onAnswer, disabled, revealedSelection }: TypeProps) {
  return (
    <div className={styles.optionsGrid}>
      {question.options?.map((option, idx) => {
        const isCorrect = option === question.correctAnswer
        const isSelected = revealedSelection === option
        
        // Determinar classe de status
        let statusClass = ''
        if (revealedSelection) {
          if (isCorrect) statusClass = styles.optionCorrect
          else if (isSelected) statusClass = styles.optionWrong
        }

        return (
          <button
            key={idx}
            className={`${styles.optionBtn} ${statusClass}`}
            onClick={() => onAnswer(isCorrect, option)}
            disabled={disabled}
          >
            {option}
          </button>
        )
      })}
    </div>
  )
}
