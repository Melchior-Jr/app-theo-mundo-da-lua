import { useState, useEffect } from 'react'
import { QuizQuestion } from '@/types/quiz'
import styles from '../QuizSystem.module.css'

interface TypeProps {
  question: QuizQuestion
  onAnswer: (isCorrect: boolean) => void
  disabled: boolean
}

export default function DragDropMatch({ question, onAnswer, disabled }: TypeProps) {
  const [matches, setMatches] = useState<Record<string, string>>({})
  const [shuffledItems, setShuffledItems] = useState(question.items || [])
  const [shuffledDestinations, setShuffledDestinations] = useState<string[]>([])
  
  // Efeito para embaralhar no carregamento
  useEffect(() => {
    const dests = [...new Set(question.items?.map((i: any) => i.matchId).filter(Boolean))] as string[]
    setShuffledDestinations([...dests].sort(() => Math.random() - 0.5))
    setShuffledItems([...(question.items || [])].sort(() => Math.random() - 0.5))
  }, [question.items])

  const destinations = shuffledDestinations

  const handleMatch = (itemId: string, dest: string) => {
    if (disabled) return
    const newMatches = { ...matches, [itemId]: dest }
    setMatches(newMatches)

    // Se todos foram combinados, verifica
    if (Object.keys(newMatches).length === question.items?.length) {
      const isCorrect = Object.entries(newMatches).every(([id, val]) => 
        question.items?.find((i: any) => i.id === id)?.matchId === val
      )
      onAnswer(isCorrect)
    }
  }

  return (
    <div className={styles.matchContainer}>
      <div className={styles.matchItems}>
        {shuffledItems.map((item: any) => (
          <div key={item.id} className={styles.matchRow}>
            <div className={styles.matchLabel}>{item.label}</div>
            <div className={styles.destList}>
              {destinations.map(dest => (
                <button
                  key={dest}
                  className={`${styles.destBtn} ${matches[item.id] === dest ? styles.active : ''}`}
                  onClick={() => handleMatch(item.id, dest)}
                  disabled={disabled}
                >
                  {dest.charAt(0).toUpperCase() + dest.slice(1)}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
