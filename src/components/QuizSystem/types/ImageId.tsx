import { QuizQuestion } from '@/data/quizQuestions'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

export default function ImageId({ question, onAnswer, disabled }: TypeProps) {
  return (
    <div className={styles.imageTypeContainer}>
      {question.image && (
        <div className={styles.imageFrame}>
          <img src={question.image} alt="Questão do Théo" className={styles.qImage} />
        </div>
      )}
      
      <div className={styles.optionsGrid}>
        {question.options?.map((option, idx) => (
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
