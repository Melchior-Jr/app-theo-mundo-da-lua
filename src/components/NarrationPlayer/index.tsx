import { useEffect, useState } from 'react'
import { useNarration } from '@/hooks/useNarration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { getNarrationById, type Narration } from '@/data/narration'
import TheoCharacter from '@/components/TheoCharacter'
import styles from './NarrationPlayer.module.css'

interface NarrationPlayerProps {
  narration: Narration
  curiosity?: string
  themeColor?: string
  autoPlay?: boolean
  onFinish?: () => void
  floating?: boolean
  hidden?: boolean  // Oculta visualmente sem parar o áudio
}

/**
 * NarrationPlayer — exibe controles de áudio, legenda do Théo
 * e indicador visual de fala.
 */
export default function NarrationPlayer({
  narration,
  curiosity,
  themeColor = '#FFD166',
  autoPlay = false,
  onFinish,
  floating = false,
  hidden = false,
}: NarrationPlayerProps) {
  const { 
    floatingPosition, 
    setFloatingPosition,
    narrationPhase,
    setNarrationPhase,
    isCuriosityPlaying,
    setIsCuriosityPlaying,
    setCurrentTime,
    narrationKey
  } = useNarrationSequence()

  // Tenta buscar se existe uma narração oficial de curiosidade para este ID
  // Se não existir, criamos uma "sintética" baseada no texto (Speech Synthesis)
  const officialCuriosity = getNarrationById(`${narration.id}-curiosity`)

  const curiosityNarration: Narration | undefined = officialCuriosity || (curiosity ? {
    id: `${narration.id}-curiosity`,
    chapterId: narration.chapterId,
    title: 'Curiosidade',
    text: curiosity,
    audioPath: null, // Backup: voz de robô
    lang: narration.lang,
    rate: narration.rate,
    pitch: narration.pitch
  } : undefined)

  // Hook para a narração principal
  const mainAudio = useNarration(narration, () => {
    if (curiosityNarration && narrationPhase === 'main') {
      handleSwitchToCuriosity()
    } else if (onFinish) {
      onFinish()
    }
  })

  // Sincroniza o tempo atual com o contexto global para legendas
  useEffect(() => {
    if (narrationPhase === 'main') {
      setCurrentTime(mainAudio.currentTime)
    }
  }, [mainAudio.currentTime, narrationPhase, setCurrentTime])

  // Hook para a curiosidade
  const curiosityAudio = useNarration(curiosityNarration || null)

  const [hasStarted, setHasStarted] = useState(false)
  const [showTapCue, setShowTapCue] = useState(!autoPlay)
  const [forceWaves, setForceWaves] = useState(false)
  
  // Estado para controle de arraste
  const [isDragging, setIsDragging] = useState(false)
  const [hasMoved, setHasMoved] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [dragPos, setDragPos] = useState({ x: 0, y: 0 })
  const [startPos, setStartPos] = useState({ x: 0, y: 0 })

  // Auto-play opcional ou quando a narração muda
  useEffect(() => {
    if (autoPlay && narration) {
      setHasStarted(false)
      setShowTapCue(false)
      setNarrationPhase('main')
      handlePlay()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPlay, narration?.id, narrationKey])

  // A limpeza agora é feita internamente pelo useNarration hook

  const handlePlay = () => {
    // SEMPRE reseta para a narração principal ao clicar no personagem
    setNarrationPhase('main')
    setHasStarted(true)
    setShowTapCue(false)
    setForceWaves(true)
    
    // Para qualquer curiosidade que esteja tocando antes de iniciar o principal
    curiosityAudio.stop()
    mainAudio.play()

    setTimeout(() => {
      setForceWaves(false)
    }, 2000)
  }

  const handlePauseResume = () => {
    // No pause/resume, respeitamos qual áudio está ativo no momento
    const audio = narrationPhase === 'main' ? mainAudio : curiosityAudio
    if (audio.isPaused) {
      audio.resume()
    } else {
      audio.pause()
      // Garante que o visual pare na hora se pausarmos
      setForceWaves(false)
    }
  }

  const handleSwitchToCuriosity = () => {
    mainAudio.pause()
    setNarrationPhase('curiosity')
    setIsCuriosityPlaying(true)
    setHasStarted(true)
    setForceWaves(true)
    // Pequeno delay para a transição de áudio
    setTimeout(() => {
      curiosityAudio.play()
      setForceWaves(false)
    }, 100)
  }

  // Monitora mudanças na fase vindas do contexto (ex: clique na lâmpada em outro componente)
  useEffect(() => {
    if (narrationPhase === 'curiosity') {
      if (isCuriosityPlaying) {
        // Se a UI pede para tocar
        if (curiosityAudio.isPaused) {
          curiosityAudio.resume()
        } else if (!curiosityAudio.isPlaying) {
          handleSwitchToCuriosity()
        }
      } else {
        // Se a UI pede para pausar
        if (curiosityAudio.isPlaying && !curiosityAudio.isPaused) {
          curiosityAudio.pause()
        }
      }
    } else if (narrationPhase === 'main') {
      setIsCuriosityPlaying(false)
      if (curiosityAudio.isPlaying || curiosityAudio.isPaused) {
        curiosityAudio.stop()
      }
      if (hasStarted && !mainAudio.isPlaying) {
        if (mainAudio.isPaused) {
          mainAudio.resume()
        } else {
          mainAudio.play()
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [narrationPhase, isCuriosityPlaying, curiosity])

  // Sincroniza o estado global se o áudio acabar naturalmente
  useEffect(() => {
    if (narrationPhase === 'curiosity') {
      setIsCuriosityPlaying(curiosityAudio.isPlaying && !curiosityAudio.isPaused)
    }
  }, [curiosityAudio.isPlaying, curiosityAudio.isPaused, narrationPhase, setIsCuriosityPlaying])

  const isMainActive = mainAudio.isPlaying || mainAudio.isPaused
  const isCuriosityActive = curiosityAudio.isPlaying || curiosityAudio.isPaused
  const isActive = isMainActive || isCuriosityActive
  // Théo fala se qualquer um dos motores estiver tocando
  const isSpeaking = (mainAudio.isPlaying && !mainAudio.isPaused) || (curiosityAudio.isPlaying && !curiosityAudio.isPaused) || forceWaves

  // Lógica de Drag and Drop
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    if (!floating) return
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragOffset({
      x: clientX - rect.left - rect.width / 2,
      y: clientY - rect.top - rect.height / 2
    })
    setStartPos({ x: clientX, y: clientY })
    setDragPos({ x: clientX, y: clientY })
    setIsDragging(true)
    setHasMoved(false)
  }

  useEffect(() => {
    if (!isDragging) return
    const handleMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY
      if (!hasMoved && Math.hypot(clientX - startPos.x, clientY - startPos.y) > 10) {
        setHasMoved(true)
      }
      setDragPos({ x: clientX, y: clientY })
    }
    const handleEnd = (e: MouseEvent | TouchEvent) => {
      const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : (e as MouseEvent).clientX
      const clientY = 'changedTouches' in e ? e.changedTouches[0].clientY : (e as MouseEvent).clientY
      if (hasMoved) {
        const winW = window.innerWidth
        const winH = window.innerHeight
        const isTop = clientY < winH / 2
        const isLeft = clientX < winW / 2
        if (isTop && isLeft) setFloatingPosition('topLeft')
        else if (isTop && !isLeft) setFloatingPosition('topRight')
        else if (!isTop && isLeft) setFloatingPosition('bottomLeft')
        else setFloatingPosition('bottomRight')
      }
      setIsDragging(false)
    }
    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleEnd)
    window.addEventListener('touchmove', handleMove)
    window.addEventListener('touchend', handleEnd)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleEnd)
      window.removeEventListener('touchmove', handleMove)
      window.removeEventListener('touchend', handleEnd)
    }
  }, [isDragging, hasMoved, startPos, floating, setFloatingPosition])

  const positionClass = styles[`pos${floatingPosition.charAt(0).toUpperCase() + floatingPosition.slice(1)}`]

  return (
    <div
      className={`
        ${styles.playerContainer} 
        ${floating ? styles.isFloating : ''} 
        ${floating ? positionClass : ''}
        ${isDragging && hasMoved ? styles.dragging : ''}
        ${hidden ? styles.hiddenPlayer : ''}
      `}
      role="region"
      aria-label="Narrador flutuante"
      style={{ 
        '--theme-color': themeColor,
        ...(isDragging && hasMoved ? {
          left: `${dragPos.x - dragOffset.x}px`,
          top: `${dragPos.y - dragOffset.y}px`,
          bottom: 'auto',
          right: 'auto',
          margin: 0,
          transform: 'translate(-50%, -50%)'
        } : {})
      } as React.CSSProperties}
    >
      <div className={styles.characterStage}>
        <div className={styles.characterAnchor}>
          {/* Théo — O Protagonista */}
          <div 
            className={`${styles.characterWrapper} ${isSpeaking ? styles.avatarSpeaking : ''}`}
            onMouseDown={onDragStart}
            onTouchStart={onDragStart}
            aria-label={
              !hasStarted && !isActive ? 'Ouvir narração do Théo' :
              (narrationPhase === 'main' ? (mainAudio.isPaused ? 'Retomar' : 'Pausar') : (curiosityAudio.isPaused ? 'Retomar' : 'Pausar'))
            }
            id="btn-theo-toggle"
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (!hasMoved) {
                // Se estiver silenciado/parado por erro de autoplay, forçamos o Play
                if (!isActive) {
                  handlePlay();
                } else {
                  handlePauseResume();
                }
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                if (!isActive) handlePlay();
                else handlePauseResume();
              }
            }}
          >
            {/* No tamanho, usamos isSpeaking para o Théo "estufar" e 120 para ele relaxar ao pausar */}
            {/* Indicador Sugestivo de Toque (Tap Cue - Premium HUD) */}
            {showTapCue && !hasStarted && !isActive && (
              <div className={styles.tapCue}>
                <div className={styles.tapPulse} />
                <div className={`${styles.tapPulse} ${styles.tapPulseSecondary}`} />
                <div className={styles.tapTarget} />
                <span className={styles.tapHand} role="img" aria-label="Toque aqui">👆</span>
                <span className={styles.tapLabel}>Toca aqui</span>
              </div>
            )}

            <TheoCharacter size={floating ? 100 : (isSpeaking ? 160 : 120)} />
            
            {/* Camada de toque invisível para garantir captura de clique */}
            <div 
              style={{ position: 'absolute', inset: 0, zIndex: 10, cursor: floating ? 'grab' : 'pointer' }} 
              aria-hidden="true" 
            />

            {/* Ondinhas de áudio — Agora respeitam fielmente o isSpeaking (incluindo pause) */}
            <div className={`${styles.audioVisualizer} ${isSpeaking ? styles.visualizerActive : ''}`}>

              <div className={styles.soundWaves} aria-hidden="true">
                {[...Array(5)].map((_, i) => <span key={i} className={styles.bar} />)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
