import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './TectonicSimulator.module.css'

// ─── TYPES ────────────────────────────────────────────────────────────────────

type PlateMovement = 'stable' | 'colliding' | 'diverging' | 'sliding'
type SimState = 'idle' | 'plateMovement' | 'pressureBuildUp' | 'earthquake' | 'eruption' | 'postEvent'

interface SimControls {
  plateMovement: PlateMovement
  magmaPressure: number   // 0–100
}

interface GeoMetrics {
  seismicIntensity: string
  magmaPressureLabel: string
  movementType: string
  eruptionRisk: string
  riskLevel: 'none' | 'low' | 'medium' | 'high' | 'critical'
  statusLabel: string
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const THEO_TIPS: Record<SimState, string> = {
  idle: 'As placas estão sempre se mexendo… mesmo quando a gente não sente! 👀',
  plateMovement: 'Cada centímetro que a placa anda leva anos — mas a força é imensurável! ⚡',
  pressureBuildUp: 'O magma está ficando impaciente lá embaixo. Cuidado! 🔥',
  earthquake: 'Sente esse tremor? É a Terra liberando energia acumulada por anos! 😨',
  eruption: 'ERUPÇÃO! O magma encontrou seu caminho — nada vai segurá-lo agora! 🌋',
  postEvent: 'Depois de uma erupção, a lava esfria e vira nova rocha. A Terra se renova! 🪨',
}

const INTERPRETATION: Record<SimState, { title: string; text: string }> = {
  idle: {
    title: 'Sistema Estável',
    text: 'O interior da Terra está em equilíbrio dinâmico. O magma circula lentamente no manto, mas sem pressão suficiente para eventos sísmicos.',
  },
  plateMovement: {
    title: 'Movimento Tectônico',
    text: 'As placas tectônicas estão em movimento. Cada tipo de movimento — colisão, afastamento ou deslizamento — gera consequências geológicas distintas na crosta terrestre.',
  },
  pressureBuildUp: {
    title: '⚠️ Pressão Crescente',
    text: 'A pressão interna do magma está aumentando. A rocha se aquece, deforma e pode não aguentar por muito tempo. Um evento geológico está se aproximando.',
  },
  earthquake: {
    title: '⚡ Terremoto!',
    text: 'As tensões acumuladas entre as placas foram liberadas de forma abrupta. Ondas sísmicas se propagam pela crosta, causando tremores que podemos sentir na superfície.',
  },
  eruption: {
    title: '🌋 Erupção Vulcânica!',
    text: 'O magma rompeu a crosta e emerge como lava incandescente. Cinzas e gases são lançados na atmosfera. A força interior da Terra se manifesta na superfície.',
  },
  postEvent: {
    title: 'Pós-Evento',
    text: 'Após a erupção, a lava esfria e solidifica, formando novas rochas basálticas. A pressão interna cai e o sistema entra em novo equilíbrio — até o próximo ciclo.',
  },
}

const MOVEMENT_LABELS: Record<PlateMovement, string> = {
  stable: 'Estável',
  colliding: 'Convergente',
  diverging: 'Divergente',
  sliding: 'Transformante',
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getSimState(controls: SimControls, isErupting: boolean, isQuaking: boolean): SimState {
  if (isErupting) return 'eruption'
  if (isQuaking) return 'earthquake'
  const { magmaPressure, plateMovement } = controls
  if (magmaPressure > 70 || (magmaPressure > 45 && plateMovement !== 'stable')) return 'pressureBuildUp'
  if (plateMovement !== 'stable') return 'plateMovement'
  if (magmaPressure > 20) return 'pressureBuildUp'
  return 'idle'
}

function computeMetrics(controls: SimControls, state: SimState): GeoMetrics {
  const { magmaPressure, plateMovement } = controls
  const totalStress = magmaPressure + (plateMovement !== 'stable' ? 30 : 0)

  let seismicIntensity = 'Nenhuma'
  if (state === 'earthquake') seismicIntensity = 'Alta — Magnitude 6+'
  else if (state === 'eruption') seismicIntensity = 'Crítica — Magnitude 7+'
  else if (totalStress > 80) seismicIntensity = 'Crescente'
  else if (totalStress > 40) seismicIntensity = 'Leve'

  let eruptionRisk = '0%'
  const riskVal = Math.min(Math.round(totalStress * 0.9), 100)
  eruptionRisk = `${riskVal}%`

  let riskLevel: GeoMetrics['riskLevel'] = 'none'
  if (state === 'eruption') riskLevel = 'critical'
  else if (state === 'earthquake') riskLevel = 'high'
  else if (riskVal > 70) riskLevel = 'high'
  else if (riskVal > 40) riskLevel = 'medium'
  else if (riskVal > 10) riskLevel = 'low'

  let statusLabel = 'Estável'
  if (state === 'eruption') statusLabel = 'Erupção em curso'
  else if (state === 'earthquake') statusLabel = 'Terremoto ativo'
  else if (state === 'pressureBuildUp') statusLabel = 'Tensão acumulando'
  else if (state === 'plateMovement') statusLabel = 'Placas em movimento'
  else if (state === 'postEvent') statusLabel = 'Pós-evento'

  return {
    seismicIntensity,
    magmaPressureLabel: magmaPressure < 25 ? 'Baixa' : magmaPressure < 55 ? 'Moderada' : magmaPressure < 80 ? 'Alta' : 'Crítica',
    movementType: MOVEMENT_LABELS[plateMovement],
    eruptionRisk,
    riskLevel,
    statusLabel,
  }
}

// ─── TECTONIC SVG ─────────────────────────────────────────────────────────────

interface TectonicSVGProps {
  controls: SimControls
  isErupting: boolean
  isQuaking: boolean
  magmaPhase: number      // 0–2π (animated)
  eruptionAge: number     // seconds since eruption started
}

function TectonicSVG({ controls, isErupting, isQuaking, magmaPhase, eruptionAge }: TectonicSVGProps) {
  const { plateMovement, magmaPressure } = controls
  const p = magmaPressure / 100

  // Plate offsets
  const leftOff  = plateMovement === 'colliding' ? 8 : plateMovement === 'diverging' ? -10 : 0
  const rightOff = plateMovement === 'colliding' ? -8 : plateMovement === 'diverging' ? 10 : 0
  const slideY   = plateMovement === 'sliding' ? 4 : 0

  // Volcano height grows with pressure and collision
  const volcanoH = 55 + p * 20 + (plateMovement === 'colliding' ? 12 : 0)
  const craterW = 16 - p * 4

  // Magma color based on pressure
  const magmaL = Math.round(40 + p * 20)
  const magmaColor = `hsl(${14 + p * 10}, 95%, ${magmaL}%)`
  const magmaGlow = `hsla(${14 + p * 10}, 100%, 60%, ${0.3 + p * 0.4})`

  // Magma blob animation via sine wave
  const blobOffset = Math.sin(magmaPhase) * 4 * p
  const blobOffset2 = Math.sin(magmaPhase + 1.5) * 5 * p

  // Eruption particles — lava blobs shooting up
  const lavaParticles = isErupting
    ? Array.from({ length: 8 }, (_, i) => {
        const angle = (-90 + (i - 3.5) * 18) * (Math.PI / 180)
        const speed = 30 + (i % 3) * 18
        const t = ((eruptionAge * 1.5 + i * 0.4) % 2)
        return {
          x: 160 + Math.cos(angle) * speed * t,
          y: 105 - volcanoH + 5 + Math.sin(angle) * speed * t + 0.5 * 120 * t * t,
          r: 4 - t * 1.5,
          opacity: Math.max(0, 1 - t * 0.8),
          color: `hsl(${15 + i * 4}, 95%, ${55 - t * 20}%)`,
        }
      })
    : []

  // Ash clouds
  const ashClouds = isErupting && eruptionAge > 0.5
    ? Array.from({ length: 4 }, (_, i) => ({
        x: 140 + (i % 2 === 0 ? -1 : 1) * (10 + i * 12) + eruptionAge * (i % 2 === 0 ? -8 : 8),
        y: 60 + i * 12 - eruptionAge * 6,
        r: 10 + i * 5,
        opacity: Math.max(0, 0.25 - eruptionAge * 0.04),
      }))
    : []

  // Crack positions on ground (quake)
  const cracks = (isQuaking || isErupting)
    ? [[60, 168, 85, 172], [210, 170, 230, 166], [130, 172, 150, 176]]
    : []

  return (
    <svg
      viewBox="0 0 320 220"
      className={styles.tectonicSvg}
      aria-label="Simulação de vulcão e placas tectônicas"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="tSkyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={`hsl(${isErupting ? 12 : 215}, ${isErupting ? 40 : 25}%, ${isErupting ? 10 : 8}%)`} />
          <stop offset="100%" stopColor="#0d1218" />
        </linearGradient>
        <linearGradient id="mantleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a1200" />
          <stop offset="40%" stopColor="#3d1800" />
          <stop offset="100%" stopColor="#1a0a00" />
        </linearGradient>
        <linearGradient id="crustGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3d2b1a" />
          <stop offset="100%" stopColor="#2a1a0a" />
        </linearGradient>
        <radialGradient id="magmaBlob" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={`hsl(30, 100%, 75%)`} />
          <stop offset="60%" stopColor={magmaColor} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <radialGradient id="magmaChamber" cx="50%" cy="40%" r="50%">
          <stop offset="0%" stopColor={`hsl(25, 100%, ${55 + p * 20}%)`} />
          <stop offset="50%" stopColor={magmaColor} />
          <stop offset="100%" stopColor="#3d1800" />
        </radialGradient>
        <radialGradient id="eruGlow" cx="50%" cy="80%" r="70%">
          <stop offset="0%" stopColor={`hsla(20, 100%, 60%, ${isErupting ? 0.25 : 0})`} />
          <stop offset="100%" stopColor="transparent" />
        </radialGradient>
        <filter id="shake">
          <feTurbulence type="turbulence" baseFrequency="0.02" numOctaves="3"
            result="noise" seed={Math.round(magmaPhase * 10)} />
          <feDisplacementMap in="SourceGraphic" in2="noise"
            scale={isQuaking ? 3 : isErupting ? 2 : 0} xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="320" height="220" fill="url(#tSkyGrad)" />

      {/* Eruption sky glow */}
      {isErupting && <rect x="0" y="0" width="320" height="220" fill="url(#eruGlow)" />}

      {/* Stars / sky detail */}
      {[30, 80, 140, 200, 260, 50, 110, 175, 240, 295].map((sx, i) => (
        <circle key={i} cx={sx} cy={8 + (i % 4) * 10} r={0.8} fill="rgba(255,255,255,0.4)"
          opacity={isErupting ? 0 : 0.5} />
      ))}

      {/* ── EARTH CROSS-SECTION (bottom layers) ── */}

      {/* Mantle */}
      <rect x="0" y="160" width="320" height="60" fill="url(#mantleGrad)" />

      {/* Magma flow blobs — animated */}
      {[...Array(5)].map((_, i) => {
        const bx = 40 + i * 55 + (i % 2 === 0 ? blobOffset : -blobOffset2) * 3
        const by = 175 + Math.sin(magmaPhase + i * 1.3) * 5
        const br = 20 + p * 12 + Math.sin(magmaPhase + i) * 3
        const opacity = 0.3 + p * 0.4
        return (
          <ellipse key={i} cx={bx} cy={by} rx={br} ry={br * 0.5}
            fill={magmaColor} opacity={opacity} />
        )
      })}

      {/* Magma chamber below volcano */}
      <ellipse
        cx="160"
        cy={195 + blobOffset * 0.5}
        rx={45 + p * 15}
        ry={22 + p * 8}
        fill="url(#magmaChamber)"
        opacity={0.85}
      />

      {/* Magma channel / conduit */}
      <path
        d={`M ${152} ${175} Q ${155 + blobOffset * 0.3} ${155} ${158} ${130} L ${162} ${130} Q ${165 - blobOffset * 0.3} ${155} ${168} ${175} Z`}
        fill={`hsl(20, 95%, ${45 + p * 20}%)`}
        opacity={0.6 + p * 0.3}
      />

      {/* LEFT PLATE */}
      <g style={{ transform: `translateX(${leftOff}px) translateY(${-slideY}px)`, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <path
          d={`M 0 165 Q 80 162 155 163 L 155 175 Q 80 178 0 180 Z`}
          fill="url(#crustGrad)"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
        {/* Surface left */}
        <path
          d={`M 0 163 Q 40 160 90 161 L 90 165 Q 40 164 0 165 Z`}
          fill="#4a3020"
        />
        {/* Left plate label */}
        <text x="30" y="170" fill="rgba(255,255,255,0.25)" fontSize="5" fontFamily="Outfit,sans-serif" letterSpacing="1">
          PLACA A
        </text>
      </g>

      {/* RIGHT PLATE */}
      <g style={{ transform: `translateX(${rightOff}px) translateY(${slideY}px)`, transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}>
        <path
          d={`M 165 163 Q 240 162 320 165 L 320 180 Q 240 178 165 175 Z`}
          fill="url(#crustGrad)"
          stroke="rgba(255,255,255,0.06)" strokeWidth="1"
        />
        <path
          d={`M 165 161 Q 210 160 260 161 L 260 165 Q 210 164 165 163 Z`}
          fill="#4a3020"
        />
        <text x="235" y="170" fill="rgba(255,255,255,0.25)" fontSize="5" fontFamily="Outfit,sans-serif" letterSpacing="1">
          PLACA B
        </text>
      </g>

      {/* Fault line / gap between plates */}
      <line
        x1="160" y1="162" x2="160" y2="178"
        stroke={plateMovement === 'diverging' ? magmaColor : 'rgba(255,255,255,0.12)'}
        strokeWidth={plateMovement === 'diverging' ? 2 : 1}
        strokeDasharray={plateMovement === 'sliding' ? '4 3' : 'none'}
      />

      {/* Ground surface */}
      <path
        d={`M 0 ${163 - leftOff * 0.3} Q 80 161 155 162 L 160 162 Q 165 162 165 162 Q 240 162 320 ${163 + rightOff * 0.3}`}
        fill="#5c3d24"
        filter={isQuaking ? 'url(#shake)' : undefined}
      />

      {/* Cracks on ground */}
      {cracks.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1} y1={y1} x2={x2} y2={y2}
          stroke="rgba(255,100,30,0.5)" strokeWidth="1.5"
          className={styles.crackLine} />
      ))}

      {/* ── VOLCANO ── */}
      <g filter={isQuaking ? 'url(#shake)' : undefined}>
        {/* Volcano body */}
        <path
          d={`M ${160 - 35 - p * 5} 162 
              L ${160 - craterW} ${162 - volcanoH + 3}
              L 160 ${162 - volcanoH}
              L ${160 + craterW} ${162 - volcanoH + 3}
              L ${160 + 35 + p * 5} 162 Z`}
          fill={`hsl(${15 - p * 5}, ${55 + p * 10}%, ${20 + p * 5}%)`}
          stroke="rgba(255,255,255,0.05)" strokeWidth="0.5"
        />
        {/* Snow cap (only at low pressure) */}
        {p < 0.35 && (
          <path
            d={`M 160 ${162 - volcanoH}
                L ${160 - craterW + 2} ${162 - volcanoH + 8}
                L ${160 + craterW - 2} ${162 - volcanoH + 8} Z`}
            fill="rgba(255,255,255,0.7)"
          />
        )}
        {/* Crater glow */}
        <ellipse
          cx="160"
          cy={162 - volcanoH + 3}
          rx={craterW}
          ry={4}
          fill={`hsl(20, 100%, ${30 + p * 40}%)`}
          opacity={p * 0.9 + 0.1}
        />
        {/* Eruption lava flow */}
        {isErupting && (
          <>
            {/* Lava flowing down side */}
            <path
              d={`M ${160 - craterW + 3} ${162 - volcanoH + 5}
                  Q ${160 - 20} ${162 - volcanoH * 0.6}
                  ${160 - 25} ${162 - 5}`}
              stroke={`hsl(20, 100%, 55%)`}
              strokeWidth="4"
              fill="none"
              strokeLinecap="round"
              opacity="0.85"
              className={styles.lavaFlow}
            />
            <path
              d={`M ${160 + craterW - 3} ${162 - volcanoH + 5}
                  Q ${160 + 22} ${162 - volcanoH * 0.5}
                  ${160 + 28} ${162 - 5}`}
              stroke={`hsl(28, 100%, 60%)`}
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              opacity="0.75"
              className={styles.lavaFlow}
            />
          </>
        )}
      </g>

      {/* ── ERUPTION PARTICLES ── */}
      {lavaParticles.map((p2, i) => (
        <circle key={i} cx={p2.x} cy={p2.y} r={Math.max(0.5, p2.r)}
          fill={p2.color} opacity={p2.opacity} className={styles.lavaBall} />
      ))}

      {/* Ash clouds */}
      {ashClouds.map((a, i) => (
        <ellipse key={i} cx={a.x} cy={a.y} rx={a.r} ry={a.r * 0.6}
          fill={`rgba(80,70,60,${a.opacity})`} />
      ))}

      {/* Smoke from crater */}
      {magmaPressure > 30 && (
        <>
          <ellipse cx={155 + Math.sin(magmaPhase) * 3} cy={162 - volcanoH - 8 - p * 5}
            rx={6 + p * 4} ry={4 + p * 3}
            fill={`rgba(100,80,60,${0.15 + p * 0.2})`} />
          <ellipse cx={163 - Math.sin(magmaPhase) * 2} cy={162 - volcanoH - 14 - p * 8}
            rx={8 + p * 5} ry={5 + p * 3}
            fill={`rgba(80,70,60,${0.1 + p * 0.15})`} />
        </>
      )}

      {/* Pressure glow around conduit */}
      <ellipse cx="160" cy={162 - volcanoH * 0.5}
        rx={8 + p * 6} ry={volcanoH * 0.6}
        fill={`rgba(255,80,0,${p * 0.08})`} />

      {/* Magma glow at surface */}
      <ellipse cx="160" cy="162"
        rx={30 + p * 20} ry="4"
        fill={magmaGlow} opacity={p * 0.6} />

      {/* Layer labels */}
      <text x="5" y="172" fill="rgba(255,255,255,0.3)" fontSize="5.5" fontFamily="Outfit,sans-serif">
        CROSTA
      </text>
      <text x="5" y="185" fill="rgba(255,160,50,0.4)" fontSize="5.5" fontFamily="Outfit,sans-serif">
        MANTO
      </text>
      <text x="5" y="200" fill="rgba(255,100,20,0.45)" fontSize="5.5" fontFamily="Outfit,sans-serif">
        MAGMA
      </text>

      {/* Arrow indicators for plate movement */}
      {plateMovement === 'colliding' && (
        <>
          <path d="M 50 155 L 70 155" stroke="#fb8500" strokeWidth="1.5" markerEnd="url(#arrowR)" opacity="0.6" />
          <path d="M 270 155 L 250 155" stroke="#fb8500" strokeWidth="1.5" opacity="0.6" />
          <text x="46" y="152" fill="rgba(251,133,0,0.6)" fontSize="6" fontFamily="Outfit">→</text>
          <text x="258" y="152" fill="rgba(251,133,0,0.6)" fontSize="6" fontFamily="Outfit">←</text>
        </>
      )}
      {plateMovement === 'diverging' && (
        <>
          <text x="40" y="152" fill="rgba(100,180,255,0.6)" fontSize="6" fontFamily="Outfit">←</text>
          <text x="266" y="152" fill="rgba(100,180,255,0.6)" fontSize="6" fontFamily="Outfit">→</text>
        </>
      )}
      {plateMovement === 'sliding' && (
        <>
          <text x="42" y="148" fill="rgba(255,210,50,0.6)" fontSize="6" fontFamily="Outfit">↑</text>
          <text x="262" y="158" fill="rgba(255,210,50,0.6)" fontSize="6" fontFamily="Outfit">↓</text>
        </>
      )}
    </svg>
  )
}

// ─── INFO PANEL ───────────────────────────────────────────────────────────────

interface InfoPanelProps {
  state: SimState
  metrics: GeoMetrics
  controls: SimControls
}

function GeologyInfoPanel({ state, metrics, controls }: InfoPanelProps) {
  const interp = INTERPRETATION[state]
  const tip = THEO_TIPS[state]

  const riskColors = {
    none: '#52b788',
    low: '#95d5b2',
    medium: '#ffd60a',
    high: '#fb8500',
    critical: '#e63946',
  }
  const color = riskColors[metrics.riskLevel]

  return (
    <aside className={styles.infoPanel}>
      {/* Status Badge */}
      <div className={styles.statusRow}>
        <div className={styles.statusBadge}
          style={{ background: `${color}18`, borderColor: `${color}55` }}>
          <span className={styles.statusDot} style={{ background: color }} />
          <span style={{ color }}>{metrics.statusLabel}</span>
        </div>
      </div>

      {/* Metrics 2×2 */}
      <div className={styles.metricsGrid}>
        <MetricCard
          icon="📡" label="Sísmica"
          value={metrics.seismicIntensity}
          highlight={metrics.riskLevel === 'high' || metrics.riskLevel === 'critical'}
        />
        <MetricCard
          icon="🔥" label="Pressão Magma"
          value={metrics.magmaPressureLabel}
          highlight={controls.magmaPressure > 60}
        />
        <MetricCard
          icon="🌏" label="Movimento"
          value={metrics.movementType}
          highlight={controls.plateMovement !== 'stable'}
        />
        <MetricCard
          icon="🌋" label="Risco Erupção"
          value={metrics.eruptionRisk}
          highlight={metrics.riskLevel === 'high' || metrics.riskLevel === 'critical'}
        />
      </div>

      {/* Interpretation */}
      <div className={styles.interpretBox} key={state}>
        <p className={styles.interpretTitle}>{interp.title}</p>
        <p className={styles.interpretText}>{interp.text}</p>
      </div>

      {/* Theo Tip */}
      <div className={styles.theoTip}>
        <span className={styles.theoEmoji}>🌔</span>
        <div>
          <strong className={styles.theoLabel}>Dica do Théo:</strong>
          <p className={styles.theoText}>{tip}</p>
        </div>
      </div>
    </aside>
  )
}

function MetricCard({ icon, label, value, highlight }: {
  icon: string; label: string; value: string; highlight: boolean
}) {
  return (
    <div className={`${styles.metricCard} ${highlight ? styles.metricHighlight : ''}`}>
      <span className={styles.metricIcon}>{icon}</span>
      <label className={styles.metricLabel}>{label}</label>
      <span className={styles.metricValue}>{value}</span>
    </div>
  )
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

const PLATE_OPTIONS: { id: PlateMovement; label: string; icon: string; desc: string }[] = [
  { id: 'stable',    label: 'Estável',     icon: '⚖️', desc: 'Sem movimento' },
  { id: 'colliding', label: 'Colidindo',   icon: '💥', desc: 'Placas convergem' },
  { id: 'diverging', label: 'Afastando',   icon: '↔️', desc: 'Placas divergem' },
  { id: 'sliding',   label: 'Deslizando',  icon: '⚡', desc: 'Falha transformante' },
]

export default function TectonicSimulator() {
  const [controls, setControls] = useState<SimControls>({
    plateMovement: 'stable',
    magmaPressure: 20,
  })
  const [isErupting, setIsErupting] = useState(false)
  const [isQuaking, setIsQuaking] = useState(false)
  const [eruptionAge, setEruptionAge] = useState(0)
  const [magmaPhase, setMagmaPhase] = useState(0)
  const [postEvent, setPostEvent] = useState(false)

  const animRef = useRef<number>(0)
  const lastRef = useRef<number>(0)
  const eruptionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const quakeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Continuous magma animation
  useEffect(() => {
    const tick = (ts: number) => {
      if (!lastRef.current) lastRef.current = ts
      const delta = (ts - lastRef.current) / 1000
      lastRef.current = ts
      setMagmaPhase(ph => ph + delta * (1.2 + controls.magmaPressure / 80))
      if (isErupting) setEruptionAge(a => a + delta)
      animRef.current = requestAnimationFrame(tick)
    }
    animRef.current = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(animRef.current); lastRef.current = 0 }
  }, [controls.magmaPressure, isErupting])

  // Auto-trigger earthquake at high stress
  useEffect(() => {
    const stress = controls.magmaPressure + (controls.plateMovement !== 'stable' ? 35 : 0)
    if (stress > 95 && !isErupting && !isQuaking && !postEvent) {
      triggerQuake()
    }
  }, [controls, isErupting, isQuaking, postEvent])

  const triggerQuake = useCallback(() => {
    if (isQuaking || quakeTimerRef.current) return
    setIsQuaking(true)
    quakeTimerRef.current = setTimeout(() => {
      setIsQuaking(false)
      quakeTimerRef.current = null
    }, 2200)
  }, [isQuaking])

  const triggerEruption = useCallback(() => {
    if (isErupting) return
    setIsErupting(true)
    setEruptionAge(0)
    setPostEvent(false)

    if (eruptionTimerRef.current) clearTimeout(eruptionTimerRef.current)
    eruptionTimerRef.current = setTimeout(() => {
      setIsErupting(false)
      setPostEvent(true)
      // Reset pressure after eruption
      setControls(c => ({ ...c, magmaPressure: Math.max(c.magmaPressure - 50, 5) }))
    }, 5000)
  }, [isErupting])

  const handleReset = useCallback(() => {
    setControls({ plateMovement: 'stable', magmaPressure: 20 })
    setIsErupting(false)
    setIsQuaking(false)
    setEruptionAge(0)
    setPostEvent(false)
    if (eruptionTimerRef.current) clearTimeout(eruptionTimerRef.current)
    if (quakeTimerRef.current) clearTimeout(quakeTimerRef.current)
  }, [])

  const activeState = postEvent && !isErupting && !isQuaking
    ? 'postEvent'
    : getSimState(controls, isErupting, isQuaking)

  const metrics = computeMetrics(controls, activeState)
  const canErupt = controls.magmaPressure > 55 && !isErupting

  // Pressure badge label
  const pressureBadge = controls.magmaPressure < 25
    ? 'Baixa'
    : controls.magmaPressure < 60
      ? 'Moderada'
      : controls.magmaPressure < 85
        ? 'Alta'
        : '⚠️ Crítica'

  return (
    <div className={`${styles.wrapper} ${isQuaking ? styles.screenShake : ''} ${isErupting ? styles.screenGlow : ''}`}>
      <main className={styles.mainCard}>

        {/* ─── LEFT: SIMULATION ─────────────────────────────── */}
        <section className={styles.simArea}>

          {/* Terrain Canvas */}
          <div className={styles.terrainContainer}>
            <TectonicSVG
              controls={controls}
              isErupting={isErupting}
              isQuaking={isQuaking}
              magmaPhase={magmaPhase}
              eruptionAge={eruptionAge}
            />

            {/* Pressure gauge bar */}
            <div className={styles.pressureBar}>
              <span className={styles.pressureBarLabel}>Pressão interna</span>
              <div className={styles.pressureBarTrack}>
                <div
                  className={styles.pressureBarFill}
                  style={{
                    width: `${controls.magmaPressure}%`,
                    background: `hsl(${20 - controls.magmaPressure * 0.15}, 90%, ${50 + controls.magmaPressure * 0.1}%)`,
                    boxShadow: `0 0 ${8 + controls.magmaPressure * 0.2}px hsl(${20 - controls.magmaPressure * 0.15}, 90%, 55%)`,
                  }}
                />
              </div>
              <span className={styles.pressureBarValue}>{Math.round(controls.magmaPressure)}%</span>
            </div>

            {/* Event flash overlay */}
            {isErupting && <div className={styles.eruptionFlash} />}
          </div>

          {/* Controls panel */}
          <div className={styles.controlsPanel}>

            {/* Plate movement selector */}
            <div className={styles.controlGroup}>
              <div className={styles.controlHeader}>
                <span className={styles.controlIcon}>🌍</span>
                <span className={styles.controlName}>Movimento das Placas</span>
              </div>
              <div className={styles.plateGrid}>
                {PLATE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.plateBtn} ${controls.plateMovement === opt.id ? styles.plateBtnActive : ''}`}
                    onClick={() => setControls(c => ({ ...c, plateMovement: opt.id }))}
                    aria-pressed={controls.plateMovement === opt.id}
                  >
                    <span className={styles.plateBtnIcon}>{opt.icon}</span>
                    <span className={styles.plateBtnLabel}>{opt.label}</span>
                    <span className={styles.plateBtnDesc}>{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Magma pressure slider */}
            <div className={styles.controlGroup}>
              <div className={styles.controlHeader}>
                <span className={styles.controlIcon}>🔥</span>
                <span className={styles.controlName}>Pressão do Magma</span>
                <span
                  className={styles.controlBadge}
                  style={{
                    background: controls.magmaPressure > 75 ? 'rgba(230,57,70,0.15)' : 'rgba(255,107,53,0.12)',
                    color: controls.magmaPressure > 75 ? '#e63946' : '#ff6b35',
                    borderColor: controls.magmaPressure > 75 ? 'rgba(230,57,70,0.4)' : 'rgba(255,107,53,0.3)',
                  }}
                >
                  {pressureBadge}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={controls.magmaPressure}
                onChange={e => setControls(c => ({ ...c, magmaPressure: Number(e.target.value) }))}
                className={styles.simSlider}
                aria-label="Pressão do magma"
                style={{ '--thumb-color': `hsl(${20 - controls.magmaPressure * 0.15}, 90%, 55%)` } as React.CSSProperties}
              />
              <div className={styles.sliderLabels}>
                <span>Baixa</span><span>Crítica</span>
              </div>
            </div>

            {/* Action buttons */}
            <div className={styles.controlActions}>
              <button
                className={`${styles.eruptBtn} ${canErupt ? styles.eruptReady : ''} ${isErupting ? styles.eruptActive : ''}`}
                onClick={triggerEruption}
                disabled={!canErupt}
                aria-label="Ativar erupção vulcânica"
              >
                <span className={styles.eruptIcon}>🌋</span>
                <span>{isErupting ? 'Erupção em curso!' : 'Ativar Erupção'}</span>
              </button>

              <button
                className={`${styles.quakeBtn} ${controls.plateMovement !== 'stable' || controls.magmaPressure > 40 ? styles.quakeReady : ''}`}
                onClick={triggerQuake}
                disabled={isQuaking}
                aria-label="Simular terremoto"
              >
                <span>⚡</span>
                <span>{isQuaking ? 'Tremendo!' : 'Terremoto'}</span>
              </button>

              <button className={styles.resetBtn} onClick={handleReset} aria-label="Resetar simulação">
                ↺ Restaurar
              </button>
            </div>
          </div>
        </section>

        {/* ─── RIGHT: INFO PANEL ────────────────────────────── */}
        <GeologyInfoPanel
          state={activeState}
          metrics={metrics}
          controls={controls}
        />

      </main>
    </div>
  )
}
