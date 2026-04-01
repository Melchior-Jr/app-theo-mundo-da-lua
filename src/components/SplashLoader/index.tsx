import { useState, useEffect } from 'react'
import TheoCharacter from '@/components/TheoCharacter'
import styles from './SplashLoader.module.css'

interface Props {
  onReady: () => void
}

/**
 * SplashLoader — Tela de carregamento lúdica e funcional.
 * Utiliza o personagem Théo oficial em formato SVG.
 */
export default function SplashLoader({ onReady }: Props) {
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
        const next = prev + Math.random() * 12
        return next > 100 ? 100 : next
      })
    }, 200)

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
      <div className={styles.content}>
        {/* Personagem Théo Oficial (SVG) */}
        <div className={styles.theoContainer}>
          <TheoCharacter size={180} emotion="bounce" className={styles.theoAvatar} />
          <div className={styles.glow} />
        </div>

        <div className={styles.textContainer}>
          <h1 className={styles.title}>Théo no Mundo da Lua</h1>
          <p className={styles.subtitle}>Preparando foguete para a missão científica...</p>
        </div>

        {/* Barra de Carregamento Digital */}
        <div className={styles.loadingTrack}>
          <div 
            className={styles.loadingBar} 
            style={{ width: `${progress}%` }} 
          />
          <div className={styles.progressText}>{Math.floor(progress)}%</div>
        </div>

        <div className={styles.statusText}>
          {progress < 30 && "Checando tanques de oxigênio... 💨"}
          {progress >= 30 && progress < 60 && "Sincronizando telescópios... 🔭"}
          {progress >= 60 && progress < 90 && "Carregando mapas estelares... 🌌"}
          {progress >= 90 && progress < 100 && "Contagem regressiva iniciada... ⏱️"}
          {progress >= 100 && "Sistemas online. Pronto para o lançamento! 🚀"}
        </div>

        {/* Botão de Início (Garante interação do usuário para o áudio) */}
        <button 
          className={`${styles.startButton} ${canStart ? styles.active : ''}`}
          onClick={handleStart}
          disabled={!canStart}
        >
          {canStart ? 'INICIAR MISSÃO!' : 'CARREGANDO...'}
        </button>
      </div>

      {/* Background Espacial */}
      <div className={styles.spaceBackground}>
        {[...Array(30)].map((_, i) => (
          <div key={i} className={styles.star} style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 3}s`,
            opacity: Math.random()
          } as React.CSSProperties} />
        ))}
      </div>
    </div>
  )
}
