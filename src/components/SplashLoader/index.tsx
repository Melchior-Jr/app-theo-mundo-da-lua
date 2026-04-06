import { useState, useEffect } from 'react'
import StarField from '@/components/StarField'
import TheoCharacter from '@/components/TheoCharacter'
import styles from './SplashLoader.module.css'

interface Props {
  onReady: () => void
  loading?: boolean
}

/**
 * SplashLoader — Tela de carregamento Premium unificada.
 * Combina o personagem Théo com HUD Sci-Fi e animações espaciais.
 */
export default function SplashLoader({ onReady, loading }: Props) {
  const [progress, setProgress] = useState(0)
  const [isFinishing, setIsFinishing] = useState(false)
  const [canStart, setCanStart] = useState(false)

  // Simulação de carregamento de sistemas da nave
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer)
          setCanStart(true)
          return 100
        }
        const next = prev + Math.random() * 15
        return next > 100 ? 100 : next
      })
    }, 250)

    return () => clearInterval(timer)
  }, [])

  const handleStart = () => {
    setIsFinishing(true)
    setTimeout(() => {
      onReady()
    }, 1200) 
  }

  return (
    <div className={`${styles.overlay} ${isFinishing ? styles.launching : ''}`}>
      {/* Fundo padrão da aplicação */}
      <StarField />

      <div className={styles.content}>
        {/* Personagem Théo & Orbiting Rocket */}
        <div className={styles.theoContainer}>
          <div className={styles.glow} />
          <TheoCharacter size={180} emotion="celebrate" className={styles.theoAvatar} />
          <div className={styles.rocketMini}>🚀</div>
        </div>

        <div className={styles.textContainer}>
          <h1 className={styles.title}>
            <span className={styles.yellow}>Théo</span>
            <span className={styles.white}>no Mundo</span>
            <span className={styles.cyan}>da Lua 🌙</span>
          </h1>
          <p className={styles.subtitle}>Preparando Missão Científica...</p>
        </div>

        {/* Barra de Progresso Futurista */}
        <div className={styles.loadingTrack}>
          <div 
            className={styles.loadingBar} 
            style={{ width: `${progress}%` }} 
          />
        </div>

        <div className={styles.statusText}>
          {progress < 30 && "Sincronizando Oxigênio... 💨"}
          {progress >= 30 && progress < 60 && "Ajustando Telescópios... 🔭"}
          {progress >= 60 && progress < 90 && "Mapeando Galáxias... 🌌"}
          {progress >= 90 && progress < 100 && "Motores Prontos... 🔥"}
          {progress >= 100 && "Sistemas Online! 🚀"}
        </div>

        {/* Botão de Início (Garante interação do usuário para o áudio) */}
        <button 
          className={`${styles.startButton} ${canStart && !loading ? styles.active : ''}`}
          onClick={handleStart}
          disabled={!canStart || loading}
        >
          {loading ? 'SINCRONIZANDO DADOS...' : canStart ? 'INICIAR MISSÃO!' : `CARREGANDO ${Math.floor(progress)}%`}
        </button>
      </div>
    </div>
  )
}
