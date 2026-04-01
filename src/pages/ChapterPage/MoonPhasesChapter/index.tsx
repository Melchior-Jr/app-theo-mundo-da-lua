import { useState, useEffect } from 'react'
import { getNarrationById } from '@/data/narration'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import FloatingTooltip from '@/components/FloatingTooltip'
import styles from './MoonPhasesChapter.module.css'

type MoonPhaseId = 'nova' | 'quarto-crescente' | 'cheia' | 'quarto-minguante'

interface MoonPhaseData {
  id: MoonPhaseId
  name: string
  audioId: string
  description: string
  details: string
  orbitRotation: number
  stats: {
    iluminacao: string
    idade: string
    visibilidade: string
  }
}

const PHASES: MoonPhaseData[] = [
  { 
    id: 'nova', 
    name: 'Lua Nova', 
    audioId: 'moon-nova', 
    description: 'A Lua está entre a Terra e o Sol.',
    details: 'Nesta fase, a face voltada para nós não recebe luz solar direta. É o melhor momento para observar estrelas!',
    orbitRotation: 0,
    stats: { iluminacao: '0%', idade: '0 dias', visibilidade: 'Invisível' }
  },
  { 
    id: 'quarto-crescente', 
    name: 'Crescente', 
    audioId: 'moon-crescente', 
    description: 'Vemos exatamente metade da Lua iluminada.',
    details: 'A Lua percorreu exatamente 1/4 da sua órbita. Nos próximos dias ela ficará cada vez maior!',
    orbitRotation: 90,
    stats: { iluminacao: '50%', idade: '7.4 dias', visibilidade: 'Tarde/Noite' }
  },
  { 
    id: 'cheia', 
    name: 'Lua Cheia', 
    audioId: 'moon-cheia', 
    description: 'A Terra está entre a Lua e o Sol.',
    details: 'Toda a face que vemos está iluminada. Ela nasce exatamente quando o Sol se põe!',
    orbitRotation: 180,
    stats: { iluminacao: '100%', idade: '14.8 dias', visibilidade: 'Noite toda' }
  },
  { 
    id: 'quarto-minguante', 
    name: 'Minguante', 
    audioId: 'moon-minguante', 
    description: 'Novamente vemos apenas metade da Lua.',
    details: 'Desta vez, é o outro lado que está iluminado. Ela nasce por volta da meia-noite.',
    orbitRotation: 270,
    stats: { iluminacao: '50%', idade: '22.1 dias', visibilidade: 'Madrugada/Manhã' }
  },
]

export default function MoonPhasesChapter() {
  const [hasPlayedIntro, setHasPlayedIntro] = useState(false)
  const [phaseIdx, setPhaseIdx] = useState(0)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024)
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: string; title: string } | null>(null)
  const { canStartLocal, setActiveNarration, setThemeColor } = useNarrationSequence()
  const currentPhase = PHASES[phaseIdx]

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

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
    setTooltip(null) // Fecha tooltip ao mudar de fase
    const phase = PHASES[idx]
    const nar = getNarrationById(phase.audioId)
    if (nar) {
      setActiveNarration(nar)
    }
  }

  const handleSceneClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY
    
    setTooltip({
      visible: true,
      x,
      y,
      title: "Exploração Lunar",
      content: currentPhase.details
    })
  }

  return (
    <div className={styles.chapterContainer}>
      {/* ESPAÇO DE RENDERIZAÇÃO 3D E ANIMAÇÕES */}
      <div className={styles.dashboard}>
        {/* CABEÇALHO INFORMATIVO */}
        <div className={styles.infoSection}>
          <h1 className={styles.phaseTitle}>{currentPhase.name}</h1>
          <p className={styles.phaseDescription}>{currentPhase.description}</p>
        </div>

        <div className={styles.scenesContainer} onClick={handleSceneClick}>
          <MoonPhaseScene currentPhase={currentPhase} />
        </div>

        {/* CARTÕES DE DETALHES (GLASSMORPHISM) */}
        <div className={styles.detailsGrid}>
          <div className={styles.detailCard}>
            <span className={styles.cardLabel}>Iluminação</span>
            <span className={styles.cardValue}>{currentPhase.stats.iluminacao}</span>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.cardLabel}>Idade da Lua</span>
            <span className={styles.cardValue}>{currentPhase.stats.idade}</span>
          </div>
          <div className={styles.detailCard}>
            <span className={styles.cardLabel}>Melhor Horário</span>
            <span className={styles.cardValue}>{currentPhase.stats.visibilidade}</span>
          </div>
        </div>

        {/* CURIOSIDADE DO THÉO (DESKTOP) */}
        {!isMobile && (
          <div className={styles.factCard}>
            <div className={styles.factIcon}>💡</div>
            <div className={styles.factContent}>
              <span className={styles.factLabel}>Curiosidade do Théo</span>
              <p className={styles.factText}>{currentPhase.details}</p>
            </div>
          </div>
        )}

        {/* TOOLTIP DINÂMICA (MOBILE & DESKTOP CLICKS) */}
        {tooltip && (
          <FloatingTooltip 
            isVisible={tooltip.visible}
            x={tooltip.x}
            y={tooltip.y}
            title={tooltip.title}
            content={tooltip.content}
            onClose={() => setTooltip(null)}
            color="#ffea00"
          />
        )}
      </div>

      {/* DOCK DE SELEÇÃO (ESTILO CONSTELAÇÕES/PLANETAS) */}
      <nav className={styles.phaseDock}>
        <div className={styles.dockTrack}>
          {PHASES.map((phase, idx) => {
            const emojis = ['🌑', '🌓', '🌕', '🌗']
            return (
              <button
                key={phase.id}
                id={`moon-dock-${phase.id}`}
                className={`${styles.dockItem} ${idx === phaseIdx ? styles.active : ''}`}
                onClick={() => handlePhaseClick(idx)}
              >
                <div className={styles.dockCircle}>
                  {emojis[idx]}
                </div>
                <span className={styles.dockLabel}>{phase.name}</span>
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
