import { useState } from 'react'
import styles from './QuizSystem.module.css'
import { IoHeart, IoFlash, IoStar, IoSettings } from 'react-icons/io5'
import { useSound } from '@/context/SoundContext'
import SettingsModal from './SettingsModal'

interface QuizHeaderProps {
  lives: number
  xp: number
  combo: number
  progress: number
  onExit: () => void
}

export default function QuizHeader({ lives, xp, combo, progress, onExit }: QuizHeaderProps) {
  const { playSFX } = useSound()
  const [showSettings, setShowSettings] = useState(false)

  return (
    <header className={styles.header}>
      <div className={styles.headerLeft}>
        <button 
          className={styles.navBackBtn} 
          onClick={() => {
            playSFX('click')
            onExit()
          }}
        >
          ×
        </button>
      </div>

      <div className={styles.progBarContainer}>
        <div 
          className={styles.progBarFill} 
          style={{ width: `${progress}%` }}
        >
          <div className={styles.progBarGlass} />
        </div>
      </div>

      <div className={styles.stats}>
        <div className={`${styles.statItem} ${styles.lives}`}>
          <IoHeart /> <span>{lives}</span>
        </div>
        <div className={`${styles.statItem} ${styles.xp}`}>
          <IoStar /> <span>{xp}</span>
        </div>
        {combo >= 3 && (
          <div className={`${styles.statItem} ${styles.comboCount} ${combo >= 5 ? styles.comboFire : ''}`}>
            <IoFlash /> <span>{combo}</span>
          </div>
        )}
        <button 
          className={styles.muteBtn} 
          onClick={() => {
            playSFX('click')
            setShowSettings(true)
          }}
          title="Configurações de Som"
        >
          <IoSettings />
        </button>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </header>
  )
}
