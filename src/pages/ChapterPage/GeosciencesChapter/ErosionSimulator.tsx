import { useState, useEffect, useRef, useCallback } from 'react'
import styles from './ErosionSimulator.module.css'

// ─── TYPES ───────────────────────────────────────────────────────────────────

type ErosionState = 'idle' | 'raining' | 'windy' | 'combinedForces' | 'highErosion' | 'stabilized'

interface SimControls {
  rainIntensity: number    // 0–100
  windIntensity: number    // 0–100
  vegetation: boolean
}

interface TerrainMetrics {
  soilLoss: number         // 0–100 %
  erosionSpeed: string
  waterPresence: string
  vegProtection: string
  statusLabel: string
  statusLevel: 'stable' | 'mild' | 'moderate' | 'intense'
}

// ─── DATA ─────────────────────────────────────────────────────────────────────

const THEO_TIPS: Record<ErosionState, string> = {
  idle: 'O solo está calmo… mas espera a chuva chegar! 😌',
  raining: 'Cada gota de chuva carrega um grãozinho de solo. Imagina anos assim! 🌧️',
  windy: 'O vento funciona como uma lixa gigante no solo nu! 🌬️',
  combinedForces: 'Chuva + vento juntos? O solo não tem chance! 💥',
  highErosion: 'Isso é erosão intensa! Em anos, uma montanha pode virar um vale 😱',
  stabilized: 'Com plantas, as raízes seguram tudo! A vegetação é o escudo do solo 🌱',
}

const INTERPRETATION: Record<ErosionState, { title: string; text: string }> = {
  idle: {
    title: 'Terreno Estável',
    text: 'O solo está em equilíbrio. Sem forças externas, a erosão natural é lenta e o relevo permanece praticamente inalterado.',
  },
  raining: {
    title: 'Erosão Hídrica',
    text: 'A chuva impacta o solo e carrega partículas encosta abaixo. Com o tempo, surgem sulcos e ravinas que formam vales.',
  },
  windy: {
    title: 'Erosão Eólica',
    text: 'O vento transporta grãos de solo e areia, desgastando rochas e criando formas únicas como dunas e penhascos esculpidos.',
  },
  combinedForces: {
    title: 'Forças Combinadas',
    text: 'A combinação de chuva e vento intensifica drasticamente a erosão. É assim que grandes vales e planícies se formam ao longo de milênios.',
  },
  highErosion: {
    title: '⚠️ Erosão Crítica',
    text: 'Com alta intensidade e solo exposto, a erosão é devastadora. O material é removido rapidamente, gerando riscos de deslizamentos.',
  },
  stabilized: {
    title: '🌿 Solo Protegido',
    text: 'A vegetação ancora o solo. As raízes criam uma rede que resiste às forças erosivas, mantendo o terreno coeso e fértil.',
  },
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function getErosionState(controls: SimControls): ErosionState {
  const { rainIntensity, windIntensity, vegetation } = controls
  const totalForce = rainIntensity + windIntensity

  if (vegetation && totalForce > 30) return 'stabilized'
  if (totalForce === 0) return 'idle'
  if (totalForce > 130) return 'highErosion'
  if (rainIntensity > 40 && windIntensity > 40) return 'combinedForces'
  if (rainIntensity > windIntensity) return 'raining'
  return 'windy'
}

function computeMetrics(controls: SimControls): TerrainMetrics {
  const { rainIntensity, windIntensity, vegetation } = controls
  const totalForce = rainIntensity + windIntensity
  const vegFactor = vegetation ? 0.35 : 1.0
  const rawLoss = Math.min(totalForce * vegFactor, 100)
  const soilLoss = Math.round(rawLoss)

  let erosionSpeed = 'Nenhuma'
  if (soilLoss < 5) erosionSpeed = 'Nenhuma'
  else if (soilLoss < 25) erosionSpeed = 'Lenta'
  else if (soilLoss < 55) erosionSpeed = 'Moderada'
  else if (soilLoss < 80) erosionSpeed = 'Rápida'
  else erosionSpeed = 'Intensa'

  const waterPresence = rainIntensity < 10
    ? 'Seca'
    : rainIntensity < 40
      ? 'Leve escoamento'
      : rainIntensity < 70
        ? 'Rio formando'
        : 'Rio intenso'

  const vegProtection = vegetation
    ? soilLoss < 30
      ? 'Alta (raízes ativas)'
      : 'Média (sob pressão)'
    : 'Nenhuma (solo exposto)'

  let statusLabel = 'Estável'
  let statusLevel: TerrainMetrics['statusLevel'] = 'stable'
  if (soilLoss > 65) { statusLabel = 'Erosão intensa'; statusLevel = 'intense' }
  else if (soilLoss > 35) { statusLabel = 'Erosão moderada'; statusLevel = 'moderate' }
  else if (soilLoss > 10) { statusLabel = 'Erosão leve'; statusLevel = 'mild' }

  return { soilLoss, erosionSpeed, waterPresence, vegProtection, statusLabel, statusLevel }
}

// ─── TERRAIN SVG ──────────────────────────────────────────────────────────────

interface TerrainSVGProps {
  erosionLevel: number   // 0–100
  controls: SimControls
  accumulatedTime: number
}

function TerrainSVG({ erosionLevel, controls, accumulatedTime }: TerrainSVGProps) {
  const { rainIntensity, windIntensity, vegetation } = controls
  const t = accumulatedTime
  const e = erosionLevel / 100

  // Mountain profile points — deforms over erosion
  const ridgeH = 160 - e * 60     // peak height drops with erosion
  const leftSlope = 20 + e * 25   // left slope flattens
  const rightSlope = 280 - e * 30

  // Terrain profile as a path
  const groundY = 190
  const terrainPoints = [
    [0, groundY],
    [leftSlope, groundY - 20],
    [80 + e * 10, groundY - 50 - e * 20],
    [140, groundY - ridgeH],
    [175, groundY - ridgeH + 15 + e * 30],
    [rightSlope, groundY - 30 - e * 10],
    [320, groundY - 5],
    [320, 220],
    [0, 220],
  ]

  const pointsStr = terrainPoints.map(p => p.join(',')).join(' ')

  // Valley forming (sulco central)
  const valleyDepth = e > 0.3 ? (e - 0.3) * 40 : 0

  // Rain drops
  const rainCount = Math.floor(rainIntensity / 8)
  const RAIN_SEED = [13, 57, 89, 23, 41, 67, 11, 95, 35, 78, 5, 52, 19, 63, 44]
  const rainDrops = Array.from({ length: rainCount }, (_, i) => ({
    x: (RAIN_SEED[i % RAIN_SEED.length] * 19 + i * 23) % 300 + 5,
    delay: (i * 0.25) % 1.5,
    dur: 0.7 + (i % 4) * 0.15,
  }))

  // Wind particles
  const windCount = Math.floor(windIntensity / 10)
  const WIND_SEED = [20, 45, 70, 15, 60, 30, 85, 10, 55, 40]
  const windParticles = Array.from({ length: windCount }, (_, i) => ({
    y: 120 + (WIND_SEED[i % WIND_SEED.length] % 60),
    delay: i * 0.3,
    dur: 1.2 + (i % 3) * 0.4,
  }))

  // Water runoff on slope
  const hasWater = rainIntensity > 20
  const waterOpacity = Math.min((rainIntensity - 20) / 80, 0.85)

  // Vegetation
  const treeCount = vegetation ? 4 : 0
  const treePositions = [50, 100, 155, 220]

  const skyBottom = `hsl(${200 + e * 10}, ${25 + e * 15}%, ${8 + e * 4}%)`
  const soilGrad1 = `hsl(${25 - e * 5}, ${45 - e * 10}%, ${35 - e * 10}%)`

  return (
    <svg
      viewBox="0 0 320 220"
      className={styles.terrainSvg}
      aria-label="Simulação de terreno com erosão"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={skyBottom} />
          <stop offset="100%" stopColor={`hsl(210, 30%, 12%)`} />
        </linearGradient>
        <linearGradient id="terrainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={soilGrad1} />
          <stop offset="40%" stopColor="#5C3D1A" />
          <stop offset="100%" stopColor="#3a2010" />
        </linearGradient>
        <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(80, 160, 255, 0.5)" />
          <stop offset="100%" stopColor="rgba(40, 100, 200, 0.2)" />
        </linearGradient>
        <linearGradient id="subsoilGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3a2010" />
          <stop offset="100%" stopColor="#1a0f08" />
        </linearGradient>
        <clipPath id="terrainClip">
          <polygon points={pointsStr} />
        </clipPath>
      </defs>

      {/* Sky */}
      <rect x="0" y="0" width="320" height="220" fill="url(#skyGrad)" />

      {/* Subtle cloud wisps */}
      <ellipse cx="70" cy="25" rx="35" ry="8" fill="rgba(255,255,255,0.04)"
        style={{ transform: `translateX(${(t * 0.02) % 50}px)` }}
      />
      <ellipse cx="220" cy="18" rx="45" ry="7" fill="rgba(255,255,255,0.03)"
        style={{ transform: `translateX(${(t * 0.015) % 40}px)` }}
      />

      {/* Rain drops */}
      {rainDrops.map((drop, i) => (
        <line
          key={i}
          x1={drop.x} y1={-5}
          x2={drop.x - 3} y2={10}
          stroke="rgba(120,180,255,0.65)"
          strokeWidth="1.5"
          className={styles.rainDrop}
          style={{
            animationDelay: `${drop.delay}s`,
            animationDuration: `${drop.dur}s`,
          }}
        />
      ))}

      {/* Wind particles */}
      {windParticles.map((p, i) => (
        <circle
          key={i}
          cx={-10}
          cy={p.y}
          r={2 + (i % 3)}
          fill={`rgba(${180 + i * 8}, ${140 + i * 5}, 80, 0.55)`}
          className={styles.windParticle}
          style={{
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.dur}s`,
          }}
        />
      ))}

      {/* Terrain body */}
      <polygon
        points={pointsStr}
        fill="url(#terrainGrad)"
        className={styles.terrainBody}
      />

      {/* Subsoil layer (rock) */}
      <rect x="0" y="195" width="320" height="25" fill="url(#subsoilGrad)" />
      <line x1="0" y1="195" x2="320" y2="195" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

      {/* Soil texture lines */}
      {[5, 12, 19].map((offset, i) => (
        <line
          key={i}
          x1="0" y1={200 + offset}
          x2="320" y2={200 + offset}
          stroke="rgba(0,0,0,0.2)" strokeWidth="1"
        />
      ))}

      {/* Valley/sulco from rain erosion */}
      {valleyDepth > 0 && (
        <path
          d={`M ${140 + e * 5} ${groundY - 10}
              Q ${148} ${groundY + valleyDepth * 0.5}
              ${150} ${groundY + valleyDepth}
              Q ${152} ${groundY + valleyDepth * 0.5}
              ${160 - e * 5} ${groundY - 10}`}
          fill="rgba(0,0,0,0.3)"
          className={styles.valleyAnimate}
        />
      )}

      {/* Water runoff on slope */}
      {hasWater && (
        <path
          d={`M ${140} ${groundY - ridgeH + 5}
              Q ${145} ${groundY - ridgeH * 0.5}
              ${148 + e * 10} ${groundY - 5}`}
          stroke={`rgba(80, 160, 255, ${waterOpacity})`}
          strokeWidth={2 + rainIntensity / 40}
          fill="none"
          strokeLinecap="round"
          className={styles.waterFlow}
        />
      )}

      {/* River at bottom (high rain) */}
      {rainIntensity > 50 && (
        <path
          d={`M 0 ${groundY + 5}
              Q 80 ${groundY + 3}
              160 ${groundY + 7}
              Q 240 ${groundY + 2}
              320 ${groundY + 6}`}
          stroke="rgba(80, 160, 255, 0.5)"
          strokeWidth="3"
          fill="none"
          className={styles.riverFlow}
        />
      )}

      {/* Vegetation / trees */}
      {treePositions.slice(0, treeCount).map((tx, i) => {
        const ty = groundY - 5
        const treeH = 22 + i * 4
        const shade = `hsl(${130 + i * 8}, 55%, ${25 + i * 4}%)`
        return (
          <g key={i} className={styles.treeGroup}>
            {/* trunk */}
            <rect x={tx + 3} y={ty - treeH * 0.3} width="3" height={treeH * 0.35}
              fill="#5D4037" />
            {/* canopy */}
            <ellipse cx={tx + 4.5} cy={ty - treeH * 0.55} rx={8 + i} ry={treeH * 0.35}
              fill={shade} />
            {/* highlight */}
            <ellipse cx={tx + 3} cy={ty - treeH * 0.65} rx={4} ry={treeH * 0.2}
              fill={`hsl(${140 + i * 5}, 60%, 40%)`} opacity="0.5" />
          </g>
        )
      })}

      {/* Erosion soil particles flying (wind high) */}
      {windIntensity > 60 && Array.from({ length: 5 }, (_, i) => (
        <circle
          key={i}
          cx={80 + i * 30}
          cy={groundY - 30 - i * 10}
          r={2}
          fill="rgba(180, 120, 60, 0.7)"
          className={styles.soilParticle}
          style={{ animationDelay: `${i * 0.4}s` }}
        />
      ))}

      {/* Year label */}
      <text x="8" y="14" fill="rgba(255,255,255,0.4)" fontSize="7"
        fontFamily="Outfit, sans-serif" letterSpacing="0.5">
        {erosionLevel < 5 ? 'ANO 0' : erosionLevel < 40 ? `+${Math.round(erosionLevel * 200)} ANOS`
          : erosionLevel < 75 ? `+${Math.round(erosionLevel * 500)} ANOS`
          : `+${Math.round(erosionLevel * 2000)} ANOS`}
      </text>
    </svg>
  )
}

// ─── INFO PANEL ───────────────────────────────────────────────────────────────

interface InfoPanelProps {
  state: ErosionState
  metrics: TerrainMetrics
  controls: SimControls
}

function ErosionInfoPanel({ state, metrics, controls }: InfoPanelProps) {
  const interp = INTERPRETATION[state]
  const tip = THEO_TIPS[state]

  const statusColors: Record<TerrainMetrics['statusLevel'], string> = {
    stable: '#52b788',
    mild: '#ffd60a',
    moderate: '#fb8500',
    intense: '#e63946',
  }

  return (
    <aside className={styles.infoPanel}>
      {/* Status Badge */}
      <div className={styles.statusRow}>
        <div
          className={styles.statusBadge}
          style={{ background: `${statusColors[metrics.statusLevel]}22`, borderColor: statusColors[metrics.statusLevel] }}
        >
          <span className={styles.statusDot} style={{ background: statusColors[metrics.statusLevel] }} />
          <span style={{ color: statusColors[metrics.statusLevel] }}>{metrics.statusLabel}</span>
        </div>
      </div>

      {/* Metrics Grid 2×2 */}
      <div className={styles.metricsGrid}>
        <MetricCard
          icon="🌍"
          label="Perda de Solo"
          value={`${metrics.soilLoss}%`}
          highlight={metrics.soilLoss > 50}
        />
        <MetricCard
          icon="⚡"
          label="Velocidade"
          value={metrics.erosionSpeed}
          highlight={metrics.soilLoss > 60}
        />
        <MetricCard
          icon="💧"
          label="Água"
          value={metrics.waterPresence}
          highlight={controls.rainIntensity > 50}
        />
        <MetricCard
          icon="🌿"
          label="Proteção Vegetal"
          value={metrics.vegProtection}
          highlight={!controls.vegetation}
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

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function ErosionSimulator() {
  const [controls, setControls] = useState<SimControls>({
    rainIntensity: 0,
    windIntensity: 0,
    vegetation: true,
  })
  const [erosionLevel, setErosionLevel] = useState(0)
  const [isAccelerating, setIsAccelerating] = useState(false)
  const [accTime, setAccTime] = useState(0)

  const animRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(0)

  const erosionState = getErosionState(controls)
  const metrics = computeMetrics(controls)

  // Erosion accumulation loop
  useEffect(() => {
    const { rainIntensity, windIntensity, vegetation } = controls
    const totalForce = rainIntensity + windIntensity
    const vegFactor = vegetation ? 0.35 : 1.0
    const rate = (totalForce / 100) * vegFactor * (isAccelerating ? 6 : 1)

    const animate = (ts: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = ts
      const delta = (ts - lastTimeRef.current) / 1000
      lastTimeRef.current = ts

      setErosionLevel(prev => Math.min(prev + rate * delta * 8, 100))
      setAccTime(prev => prev + delta)

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)
    return () => {
      cancelAnimationFrame(animRef.current)
      lastTimeRef.current = 0
    }
  }, [controls, isAccelerating])

  const handleRain = useCallback((v: number) => {
    setControls(c => ({ ...c, rainIntensity: v }))
  }, [])

  const handleWind = useCallback((v: number) => {
    setControls(c => ({ ...c, windIntensity: v }))
  }, [])

  const handleVeg = useCallback(() => {
    setControls(c => ({ ...c, vegetation: !c.vegetation }))
  }, [])

  const handleReset = useCallback(() => {
    setErosionLevel(0)
    setAccTime(0)
    setControls({ rainIntensity: 0, windIntensity: 0, vegetation: true })
    setIsAccelerating(false)
  }, [])

  return (
    <div className={styles.wrapper}>
      <main className={styles.mainCard}>

        {/* ─── LEFT: SIMULATION ──────────────────────────────── */}
        <section className={styles.simArea}>
          {/* Terrain canvas */}
          <div className={styles.terrainContainer}>
            <TerrainSVG
              erosionLevel={erosionLevel}
              controls={controls}
              accumulatedTime={accTime}
            />

            {/* Erosion progress bar */}
            <div className={styles.erosionBar}>
              <span className={styles.erosionBarLabel}>Erosão acumulada</span>
              <div className={styles.erosionBarTrack}>
                <div
                  className={styles.erosionBarFill}
                  style={{
                    width: `${erosionLevel}%`,
                    background: `hsl(${25 - erosionLevel * 0.2}, 85%, ${55 - erosionLevel * 0.2}%)`,
                  }}
                />
              </div>
              <span className={styles.erosionBarValue}>{Math.round(erosionLevel)}%</span>
            </div>
          </div>

          {/* Controls panel */}
          <div className={styles.controlsPanel}>
            {/* Rain Slider */}
            <div className={styles.controlGroup}>
              <div className={styles.controlHeader}>
                <span className={styles.controlIcon}>🌧️</span>
                <span className={styles.controlName}>Chuva</span>
                <span className={styles.controlBadge}>
                  {controls.rainIntensity < 20
                    ? 'Baixo'
                    : controls.rainIntensity < 60
                      ? 'Médio'
                      : 'Alto'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={controls.rainIntensity}
                onChange={e => handleRain(Number(e.target.value))}
                className={styles.simSlider}
                aria-label="Intensidade da chuva"
                style={{ '--thumb-color': '#5ba4f5' } as React.CSSProperties}
              />
              <div className={styles.sliderLabels}>
                <span>Seco</span><span>Intenso</span>
              </div>
            </div>

            {/* Wind Slider */}
            <div className={styles.controlGroup}>
              <div className={styles.controlHeader}>
                <span className={styles.controlIcon}>🌬️</span>
                <span className={styles.controlName}>Vento</span>
                <span className={styles.controlBadge}>
                  {controls.windIntensity < 20
                    ? 'Baixo'
                    : controls.windIntensity < 60
                      ? 'Médio'
                      : 'Alto'}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={controls.windIntensity}
                onChange={e => handleWind(Number(e.target.value))}
                className={styles.simSlider}
                aria-label="Intensidade do vento"
                style={{ '--thumb-color': '#ffd166' } as React.CSSProperties}
              />
              <div className={styles.sliderLabels}>
                <span>Calmo</span><span>Forte</span>
              </div>
            </div>

            {/* Vegetation Toggle + Actions */}
            <div className={styles.controlActions}>
              <button
                className={`${styles.vegToggle} ${controls.vegetation ? styles.vegOn : styles.vegOff}`}
                onClick={handleVeg}
                aria-pressed={controls.vegetation}
                aria-label="Toggle de vegetação"
              >
                <span className={styles.vegIcon}>🌱</span>
                <span>{controls.vegetation ? 'Vegetação ON' : 'Vegetação OFF'}</span>
                <span className={`${styles.vegPill} ${controls.vegetation ? styles.pillOn : styles.pillOff}`}>
                  {controls.vegetation ? 'ON' : 'OFF'}
                </span>
              </button>

              <button
                className={`${styles.accelBtn} ${isAccelerating ? styles.accelActive : ''}`}
                onClick={() => setIsAccelerating(a => !a)}
                aria-pressed={isAccelerating}
                aria-label="Acelerar tempo"
              >
                ⏩ {isAccelerating ? 'Desacelerar' : 'Acelerar Tempo'}
              </button>

              <button
                className={styles.resetBtn}
                onClick={handleReset}
                aria-label="Restaurar terreno"
              >
                ↺ Restaurar
              </button>
            </div>
          </div>
        </section>

        {/* ─── RIGHT: INFO PANEL ─────────────────────────────── */}
        <ErosionInfoPanel
          state={erosionState}
          metrics={metrics}
          controls={controls}
        />

      </main>
    </div>
  )
}
