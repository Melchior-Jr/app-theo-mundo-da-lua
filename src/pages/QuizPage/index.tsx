import { useNavigate, useSearchParams } from 'react-router-dom'
import QuizSystem from '@/components/QuizSystem'
import styles from './QuizPage.module.css'

export default function QuizPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  
  // Nível padrão é 1 (Sistema Solar)
  const level = parseInt(searchParams.get('level') || '1')
  // Modo padrão é normal
  const mode = (searchParams.get('mode') || 'normal') as 'normal' | 'quick' | 'challenge'

  return (
    <div className={styles.quizPageWrapper}>
      <QuizSystem 
        level={level} 
        mode={mode} 
        onExit={() => navigate('/jogos')} 
      />
    </div>
  )
}
