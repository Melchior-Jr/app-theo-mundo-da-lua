import { useMemo, useEffect } from 'react'
import { useSound } from '@/context/SoundContext'
import { IoCheckmarkCircle, IoAlertCircle } from 'react-icons/io5'
import { getRandomMessage } from '@/data/theoMessages'
import confetti from 'canvas-confetti'
import TheoCharacter from '../TheoCharacter'
import styles from './QuizSystem.module.css'

interface FeedbackLayerProps {
  isCorrect: boolean
  combo: number
  explanation: string
  explanationAudio?: string
  onNext: () => void
  lives: number
}

export default function FeedbackLayer({ 
  isCorrect, 
  combo, 
  explanation, 
  explanationAudio,
  onNext,
  lives 
}: FeedbackLayerProps) {
  const { playTrack } = useSound()
  const color = isCorrect ? '#00ffa3' : '#ff3d71'
  const icon = isCorrect ? <IoCheckmarkCircle /> : <IoAlertCircle />
  
  // Mensagens do Théo de acordo com o resultado
  const theoTitle = useMemo(() => {
    if (isCorrect && combo >= 3) return getRandomMessage('combo', combo)
    if (isCorrect) return getRandomMessage('success')
    return getRandomMessage('error')
  }, [isCorrect, combo])

  // Efeitos sensoriais (Confetti + Vibração)
  useEffect(() => {
    if (isCorrect) {
      // Confetti
      const colors = combo >= 3 ? ['#00ffa3', '#4facfe', '#ffb100'] : ['#00ffa3', '#ffffff'];
      confetti({
        particleCount: combo >= 3 ? 100 : 40,
        spread: 70,
        origin: { y: 0.6 },
        colors: colors
      });

      // Vibração curta (Sucesso)
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      // Vibração dupla (Erro)
      if ('vibrate' in navigator) {
        navigator.vibrate([100, 50, 100]);
      }
    }

    // 1. Tocar explicação após um delay (se houver áudio disponível)
    let explanationPlayer: HTMLAudioElement | null = null
    const delay = isCorrect ? 1000 : 1500 

    const timeout = setTimeout(() => {
       if (explanationAudio) {
         explanationPlayer = playTrack(explanationAudio!, 0.8)
       }
    }, delay)

    return () => {
      clearTimeout(timeout)
      explanationPlayer?.pause()
    }
  }, [isCorrect, combo, explanationAudio, playTrack]);

  return (
    <div className={`${styles.feedbackOverlay} ${isCorrect ? '' : styles.shake}`} style={{ '--borderColor': color } as React.CSSProperties}>
      <div className={styles.feedbackContent}>
        
        {/* Personagem Dinâmico */}
        <div className={styles.theoFeedbackFrame}>
           <TheoCharacter 
             size={140}
             emotion={isCorrect ? 'bounce' : 'tilt'}
             className={styles.theoAvatarFeedback}
           />
           {isCorrect && combo >= 3 && (
             <div className={styles.comboBadgeFloating}>COMBO {combo}x 🔥</div>
           )}
        </div>

        <div className={styles.feedbackHeader}>
          <div className={styles.feedbackIcon} style={{ color }}>{icon}</div>
          <div className={styles.feedbackTitle} style={{ color }}>{theoTitle}</div>
        </div>

        <p className={styles.explanationText}>
          {explanation}
        </p>

        <button 
          className={styles.nextBtn} 
          onClick={onNext}
          style={{ background: color }}
        >
          {lives <= 0 ? 'VER MEUS RESULTADOS' : 'PRÓXIMA PERGUNTA'}
        </button>
      </div>
    </div>
  )
}
