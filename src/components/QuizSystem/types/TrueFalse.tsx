import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean, selection?: any) => void
  disabled: boolean
  revealedSelection?: any
}

export default function TrueFalse({ question, onAnswer, disabled, revealedSelection }: TypeProps) {
  const options = question.options || ['Verdadeiro', 'Falso']
  
  const isCorrectChoice = (choiceLabel: string, index: number) => {
    // 1. Caso Moderno (Editor): Resposta correta é o próprio texto do label
    if (question.correctAnswer === choiceLabel) return true
    
    // 2. Caso Legado (Hardcoded): Resposta correta era boolean (true = primeira opção, false = segunda)
    if (typeof question.correctAnswer === 'boolean') {
      return (index === 0 && question.correctAnswer === true) || (index === 1 && question.correctAnswer === false)
    }
    
    return false
  }

  const handleChoice = (choiceLabel: string, index: number) => {
    onAnswer(isCorrectChoice(choiceLabel, index), choiceLabel)
  }

  const getStatusClass = (choiceLabel: string, index: number) => {
    if (revealedSelection === null || revealedSelection === undefined) return ''
    const isCorrect = isCorrectChoice(choiceLabel, index)
    const isSelected = revealedSelection === choiceLabel
    if (isCorrect) return styles.optionCorrect
    if (isSelected) return styles.optionWrong
    return ''
  }

  return (
    <div className={styles.optionsGrid} style={{ flexDirection: 'row', gap: '20px' }}>
      {options.map((opt, idx) => (
        <button
          key={idx}
          className={`${styles.optionBtn} ${idx === 0 ? styles.trueBtn : styles.falseBtn} ${getStatusClass(opt, idx)}`}
          onClick={() => handleChoice(opt, idx)}
          disabled={disabled}
          style={{ 
            flex: 1, 
            textAlign: 'center', 
            borderColor: idx === 0 ? '#00ffa3' : '#ff3d71' 
          }}
        >
          {opt.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
