import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

export default function SceneSelection({ question, onAnswer, disabled }: TypeProps) {
  return (
    <div className={styles.sceneContainer}>
      <div className={styles.sceneGrid}>
        {question.options?.map((option: string, idx: number) => (
          <button
            key={idx}
            className={styles.sceneItem}
            onClick={() => onAnswer(option === question.correctAnswer)}
            disabled={disabled}
          >
            <div className={styles.starsCluster}>
              <div className={styles.star} />
              <div className={styles.star} />
              <div className={styles.star} />
              <div className={styles.star} />
              <div className={styles.starSmall} />
            </div>
            {option}
          </button>
        ))}
      </div>
    </div>
  )
}
