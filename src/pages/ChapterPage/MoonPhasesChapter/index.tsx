import { useState, useEffect } from 'react'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import styles from './MoonPhasesChapter.module.css'

type MoonPhaseId = 'nova' | 'crescente' | 'cheia' | 'minguante'

interface MoonPhaseData {
  id: MoonPhaseId
  name: string
  audioId: string
  description: string
  orbitRotation: number // Rotação da Lua na órbita (graus)
}

const PHASES: MoonPhaseData[] = [
  { id: 'nova', name: 'Lua Nova', audioId: 'moon-nova', description: 'A Lua está entre a Terra e o Sol.', orbitRotation: 0 },
  { id: 'crescente', name: 'Quarto Crescente', audioId: 'moon-crescente', description: 'A Lua percorreu 1/4 da sua órbita.', orbitRotation: 90 },
  { id: 'cheia', name: 'Lua Cheia', audioId: 'moon-cheia', description: 'A Terra está entre a Lua e o Sol.', orbitRotation: 180 },
  { id: 'minguante', name: 'Quarto Minguante', audioId: 'moon-minguante', description: 'A Lua está quase completando sua volta.', orbitRotation: 270 },
]

export default function MoonPhasesChapter() {
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const { canStartLocal, setActiveNarration, setThemeColor } = useNarrationSequence()
  const currentPhase = PHASES[phaseIdx]

  // Quando o áudio principal terminar (canStartLocal = true)
  // Toca a reprodução da Lua Nova automaticamente
  useEffect(() => {
    if (canStartLocal && !hasPlayedIntro) {
      const novaNarration = getNarrationById('moon-nova')
      if (novaNarration) setActiveNarration(novaNarration)
      setHasPlayedIntro(true)
      setThemeColor('#ffea00') // Amarelo lunar
    }
  }, [canStartLocal, hasPlayedIntro, setActiveNarration, setThemeColor])

  // Trata a seleção de fase
  const handlePhaseClick = (idx: number) => {
    setPhaseIdx(idx)
    const phase = PHASES[idx]
    const nar = getNarrationById(phase.audioId)
    if (nar) {
      setActiveNarration(nar)
    }
  }

  return (
    <div className={styles.chapterContainer}>
      {/* ESPAÇO DE RENDERIZAÇÃO 3D E ANIMAÇÕES */}
      <div className={styles.dashboard}>
        <MoonPhaseScene currentPhase={currentPhase} />
      </div>

      {/* CONTROLES (DOCK DE FASES) - Agora movido para fora do dashboard para overlay fixo */}
      <nav className={styles.phaseDockContainer}>
        <div className={styles.phaseDockTrack}>
          {PHASES.map((phase, idx) => {
            const emojis = ['🌑', '🌓', '🌕', '🌗']
            return (
              <button
                key={phase.id}
                className={`${styles.phaseDockItem} ${idx === phaseIdx ? styles.active : ''}`}
                onClick={() => handlePhaseClick(idx)}
              >
                <div className={styles.phaseIconWrapper}>
                  {emojis[idx]}
                </div>
                <span className={styles.phaseDockLabel}>{phase.name.replace('Quarto ', '')}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/** 
 * Subcomponente: MoonPhaseScene 
 * Mostra a vista de cima (órbita) e a vista da Terra (fase)
 */
const MoonPhaseScene = ({ currentPhase }: { currentPhase: MoonPhaseData }) => {
  // Configs para perspectiva isométrica
  const rX = 77; // Raio X (distância horizontal da órbita)
  const rY = 27; // Raio Y (distância vertical da órbita)
  const tiltAngle = -15; // Inclinação da órbita em graus
  
  // Transformar o ângulo em radianos
  const angleRad = (currentPhase.orbitRotation * Math.PI) / 180;
  const tiltRads = (tiltAngle * Math.PI) / 180;
  
  // Como 0 graus deve estar à esquerda (-x), usamos o -cos
  const moonX = -rX * Math.cos(angleRad);
  const moonY = -rY * Math.sin(angleRad);
  
  // Rotacionar plano coordenado para acompanhar inclinação da órbita
  const rotatedX = moonX * Math.cos(tiltRads) - moonY * Math.sin(tiltRads);
  const rotatedY = moonX * Math.sin(tiltRads) + moonY * Math.cos(tiltRads);
  
  // O zIndex depende de qual "metade" da elipse original a Lua está (antes de rotacionar)
  const moonZIndex = moonY < 0 ? 5 : 20;

  return (
    <div className={styles.sceneLayout}>
      {/* 1. VISÃO DO ESPAÇO (ORBITAL) */}
      <div className={styles.viewBox}>
        <span className={styles.viewLabel}>Visão do Espaço</span>
        <div className={styles.orbitalScene}>
          {/* SUN */}
          <div className={styles.sunSource}>
            <div className={styles.sunRays}></div>
          </div>

          <div className={styles.earthCenter}></div>
          <div className={styles.orbitLine}></div>

          {/* MOON ISOMÉTRICA */}
          <div 
            className={styles.moonBody}
            style={{ 
              transform: `translate(${rotatedX}px, ${rotatedY}px)`,
              zIndex: moonZIndex 
            } as React.CSSProperties}
          >
            <div className={styles.moonLitSide}></div>
          </div>
        </div>
      </div>

      {/* 2. Vista da Terra (O que a gente vê no céu) */}
      <div className={styles.viewBox}>
        <span className={styles.viewLabel}>O que vemos no céu</span>
        <div className={styles.skyView}>
          <div className={styles.mainMoon}>
            <div className={styles.moonCraters} />
             {/* A sombra depende de quão "cheia" ou "nova" ela está */}
            <div className={`${styles.moonShadowOverlay} ${styles[currentPhase.id]}`} />
          </div>
        </div>
      </div>
    </div>
  )
}
