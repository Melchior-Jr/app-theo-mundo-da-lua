import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean, selection?: any) => void
  disabled: boolean
  revealedSelection?: any
}

export default function TrueFalse({ question, onAnswer, disabled, revealedSelection }: TypeProps) {
  const handleChoice = (choice: boolean) => {
    onAnswer(question.correctAnswer === choice, choice)
  }

  const getStatusClass = (choice: boolean) => {
    if (revealedSelection === null || revealedSelection === undefined) return ''
    const isCorrect = question.correctAnswer === choice
    const isSelected = revealedSelection === choice
    if (isCorrect) return styles.optionCorrect
    if (isSelected) return styles.optionWrong
    return ''
  }

  return (
    <div className={styles.optionsGrid} style={{ flexDirection: 'row', gap: '20px' }}>
      <button
        className={`${styles.optionBtn} ${styles.trueBtn} ${getStatusClass(true)}`}
        onClick={() => handleChoice(true)}
        disabled={disabled}
        style={{ flex: 1, textAlign: 'center', borderColor: '#00ffa3' }}
      >
        VERDADEIRO
      </button>
      <button
        className={`${styles.optionBtn} ${styles.falseBtn} ${getStatusClass(false)}`}
        onClick={() => handleChoice(false)}
        disabled={disabled}
        style={{ flex: 1, textAlign: 'center', borderColor: '#ff3d71' }}
      >
        FALSO
      </button>
    </div>
  )
}
