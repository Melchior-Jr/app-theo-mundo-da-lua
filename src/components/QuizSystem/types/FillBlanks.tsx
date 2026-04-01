import { useState } from 'react'
import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

export default function FillBlanks({ question, onAnswer, disabled }: TypeProps) {
  const [value, setValue] = useState('')

  const handleCheck = () => {
    const isCorrect = value.trim().toLowerCase() === (question.correctAnswer as string).toLowerCase()
    onAnswer(isCorrect)
  }

  return (
    <div className={styles.fillContainer}>
      <input 
        type="text" 
        className={styles.fillInput} 
        value={value} 
        onChange={e => setValue(e.target.value)} 
        disabled={disabled} 
        placeholder="Escreva aqui..." 
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleCheck()}
      />
      <button className={styles.checkBtn} onClick={handleCheck} disabled={disabled || !value.trim()}>
        ESCREVER E VER SE ESTÁ CERTO!
      </button>
    </div>
  )
}
