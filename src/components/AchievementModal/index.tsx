import { useEffect } from 'react'
import confetti from 'canvas-confetti'
import ShareButton from '@/components/ShareButton'
import { useSound } from '@/context/SoundContext'
import styles from './AchievementModal.module.css'

export type AchievementType = 'level' | 'trophy' | 'unlock' | 'chapter'

export interface Achievement {
  id: string
  type: AchievementType
  title: string
  description: string
  icon: string
  xpBonus?: number
  shareText?: string
}

interface AchievementModalProps {
  achievement: Achievement
  onClose: () => void
}

export default function AchievementModal({ achievement, onClose }: AchievementModalProps) {
  const { playSFX } = useSound()

  useEffect(() => {
    // Tira os fogos ao abrir
    playSFX('success')
    
    const duration = 4 * 1000
    const end = Date.now() + duration

    const colors = achievement.type === 'level' ? ['#FFD166', '#f7c762'] : 
                   achievement.type === 'trophy' ? ['#4CC9F0', '#4361EE'] : 
                   ['#F0F4FF', '#8bf9ff']

    // Explosão inicial
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 },
      colors: colors,
      zIndex: 1100
    })

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        zIndex: 1100
      })
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        zIndex: 1100
      })

      if (Date.now() < end) {
        requestAnimationFrame(frame)
      }
    }

    frame()
  }, [achievement.type, playSFX])

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={`${styles.glow} ${styles[achievement.type]}`} />
        
        <div className={styles.content}>
          <div className={`${styles.iconWrapper} ${styles[achievement.type]}`}>
            <span className={styles.icon}>{achievement.icon}</span>
            <div className={styles.iconRing} />
          </div>

          <div className={styles.textGroup}>
            <span className={styles.typeLabel}>
              {achievement.type === 'level' ? '✨ NOVO NÍVEL' : 
               achievement.type === 'trophy' ? '🏆 TROFÉU CONQUISTADO' : 
               achievement.type === 'chapter' ? '🚀 CAPÍTULO CONCLUÍDO' :
               '🔓 DESBLOQUEIO'}
            </span>
            <h2 className={styles.title}>{achievement.title}</h2>
            <p className={styles.description}>{achievement.description}</p>
          </div>

          {achievement.xpBonus && (
            <div className={styles.xpBadge}>
              <span className={styles.xpText}>+{achievement.xpBonus} XP</span>
            </div>
          )}

          <div className={styles.actions}>
            <ShareButton 
              title={achievement.title}
              text={achievement.shareText || `Acabei de conquistar "${achievement.title}" no Théo no Mundo da Lua! 🚀✨`}
              className={styles.shareButton}
            />
            <button className={styles.closeButton} onClick={onClose}>
              Continuar Jornada
            </button>
          </div>
        </div>

        <button className={styles.absoluteClose} onClick={onClose} aria-label="Fechar">
          ✕
        </button>
      </div>
    </div>
  )
}
