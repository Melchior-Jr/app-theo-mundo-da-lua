import { useState, useCallback } from 'react'
import styles from './SoilSimulator.module.css'

// ─── DATA ───────────────────────────────────────────────────────────────────

const SOIL_STAGES = [
  {
    id: 'initial',
    label: 'Rocha Intacta',
    year: 'Ano 0',
    timeRange: [0, 15],
    description: 'Uma rocha maciça exposta ao ambiente. Sol, frio e vento começam a trabalhar silenciosamente.',
    tip: 'A rocha parece eterna, mas o tempo vai vencer ela! 🪨',
    stats: {
      tempo: 'Ano 0',
      material: 'Rocha sólida',
      umidade: 'Nenhuma',
      fertilidade: '0%',
    },
  },
  {
    id: 'weathering',
    label: 'Intemperismo',
    year: '+500 Anos',
    timeRange: [15, 35],
    description: 'Chuva e variações de temperatura criam rachaduras. Líquens e musgos colonizam as fissuras.',
    tip: 'Imagine a rocha sendo "arranhada" pela chuva por séculos seguidos! 🌧️',
    stats: {
      tempo: '+500 anos',
      material: 'Rocha fragmentada',
      umidade: 'Baixa',
      fertilidade: '5%',
    },
  },
  {
    id: 'fragmentation',
    label: 'Fragmentação',
    year: '+2.000 Anos',
    timeRange: [35, 60],
    description: 'A rocha se quebra em grãos e sedimentos. Pequenas plantas conquistam o terreno.',
    tip: 'Cada pedacinho de rocha vai virar nutriente para as plantas! 🌿',
    stats: {
      tempo: '+2.000 anos',
      material: 'Sedimentos',
      umidade: 'Média',
      fertilidade: '25%',
    },
  },
  {
    id: 'organicFormation',
    label: 'Matéria Orgânica',
    year: '+5.000 Anos',
    timeRange: [60, 80],
    description: 'Animais e plantas mortos se decompõem criando húmus. O solo começa a ter vida própria.',
    tip: 'O húmus é o "ouro" do solo — cada fragmento é cheio de nutrientes! 🍂',
    stats: {
      tempo: '+5.000 anos',
      material: 'Solo + Húmus',
      umidade: 'Alta',
      fertilidade: '60%',
    },
  },
  {
    id: 'matureSoil',
    label: 'Solo Desenvolvido',
    year: '+10.000 Anos',
    timeRange: [80, 100],
    description: 'Solo fértil e profundo, capaz de sustentar florestas inteiras. Levou milênios para surgir!',
    tip: 'Leva MUITO tempo pra formar solo assim… tipo milhares de anos! 😲',
    stats: {
      tempo: '+10.000 anos',
      material: 'Solo maduro',
      umidade: 'Muito alta',
      fertilidade: '95%',
    },
  },
]

const QUIZ_OPTIONS = [
  { id: 'rain', label: 'Mais chuva', correct: false, feedback: 'A chuva ajuda, mas sozinha pode causar erosão!' },
  { id: 'wind', label: 'Mais vento', correct: false, feedback: 'O vento fragmenta a rocha, mas não é o principal motor.' },
  { id: 'vegetation', label: 'Mais vegetação', correct: true, feedback: 'Exato! As raízes fragmentam a rocha e a matéria orgânica fertiliza o solo.' },
  { id: 'nothing', label: 'Nada influencia', correct: false, feedback: 'Tudo influencia! Clima, vida e tempo trabalham juntos.' },
]

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getStageFromValue(val: number) {
  return SOIL_STAGES.find(s => val >= s.timeRange[0] && val <= s.timeRange[1]) ?? SOIL_STAGES[0]
}

// ─── SOIL SVG ─────────────────────────────────────────────────────────────────

function SoilCrossSection({ timeValue, rainLevel, hasVegetation }: {
  timeValue: number
  rainLevel: number
  hasVegetation: boolean
}) {
  const stage = getStageFromValue(timeValue)
  const progress = timeValue / 100

  // Layer heights (0-60 visible area)
  const bedrockH = 60
  const fragmentH = Math.min(progress * 50, 30)
  const organicH = Math.min(Math.max((progress - 0.5) * 60, 0), 20)
  const hummusH = Math.min(Math.max((progress - 0.7) * 50, 0), 12)
  const topsoilH = Math.min(Math.max((progress - 0.8) * 40, 0), 8)

  // Colors shift based on progress
  const bedrockColor = progress < 0.3 ? '#9E9E9E' : '#7B7B7B'
  const fragmentColor = '#A0522D'
  const organicColor = `hsl(${25 + progress * 15}, ${40 + progress * 25}%, ${30 + progress * 10}%)`
  const hummusColor = '#3E2005'
  const topsoilColor = hasVegetation ? '#1B5E20' : '#2E7D32'

  // Rain animation
  const rainDrops = rainLevel > 0
    ? Array.from({ length: rainLevel * 3 }, (_, i) => ({
        x: (i * 37 + 15) % 200,
        delay: (i * 0.3) % 2,
        dur: 0.8 + (i % 3) * 0.2,
      }))
    : []

  // Roots
  const roots = hasVegetation && progress > 0.5
    ? Array.from({ length: 4 }, (_, i) => ({
        x: 60 + i * 20,
        depth: Math.min((progress - 0.5) * 100, 40),
      }))
    : []

  return (
    <svg viewBox="0 0 200 180" className={styles.soilSvg} aria-label={`Simulação de solo: estágio ${stage.label}`}>
      {/* Sky */}
      <rect x="0" y="0" width="200" height="60" fill={`hsl(210, ${20 + progress * 30}%, ${10 + progress * 10}%)`} />

      {/* Rain */}
      {rainDrops.map((drop, i) => (
        <line
          key={i}
          x1={drop.x} y1="0"
          x2={drop.x - 3} y2="10"
          stroke="rgba(100, 160, 255, 0.6)"
          strokeWidth="1.5"
          className={styles.rainDrop}
          style={{ animationDelay: `${drop.delay}s`, animationDuration: `${drop.dur}s` }}
        />
      ))}

      {/* Ground level */}
      <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      {/* BEDROCK */}
      <rect x="0" y={180 - bedrockH} width="200" height={bedrockH} fill={bedrockColor} />
      {/* Bedrock texture — cracks */}
      {progress > 0.1 && [30, 80, 130, 170].map((x, i) => (
        <path
          key={i}
          d={`M${x} ${180 - bedrockH} l${-5 + i * 2} ${10 + i * 3}`}
          stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none"
        />
      ))}

      {/* FRAGMENT LAYER */}
      {fragmentH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH}
          width="200" height={fragmentH}
          fill={fragmentColor}
          className={styles.layerAnimate}
        />
      )}

      {/* ORGANIC LAYER */}
      {organicH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH}
          width="200" height={organicH}
          fill={organicColor}
          className={styles.layerAnimate}
        />
      )}

      {/* HUMMUS LAYER */}
      {hummusH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH - hummusH}
          width="200" height={hummusH}
          fill={hummusColor}
          className={styles.layerAnimate}
        />
      )}

      {/* TOPSOIL */}
      {topsoilH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH - hummusH - topsoilH}
          width="200" height={topsoilH}
          fill={topsoilColor}
          className={styles.layerAnimate}
        />
      )}

      {/* Roots */}
      {roots.map((root, i) => (
        <path
          key={i}
          d={`M${root.x} 60 Q${root.x + 5} ${80} ${root.x - 3} ${60 + root.depth}`}
          stroke="#2E7D32" strokeWidth="1.5" fill="none" opacity="0.7"
          className={styles.rootAnimate}
        />
      ))}

      {/* Vegetation on top */}
      {hasVegetation && progress > 0.3 && (
        <>
          <circle cx="60" cy="50" r={4 + progress * 8} fill="#2E7D32" opacity="0.9" />
          <circle cx="100" cy="45" r={5 + progress * 10} fill="#388E3C" opacity="0.8" />
          <circle cx="145" cy="52" r={3 + progress * 6} fill="#1B5E20" opacity="0.9" />
          <rect x="59" y={50 + (4 + progress * 8)} width="2" height="8" fill="#5D4037" />
          <rect x="99" y={45 + (5 + progress * 10)} width="2" height="10" fill="#5D4037" />
        </>
      )}

      {/* Stage label overlay */}
      <text x="10" y="15" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Outfit, sans-serif">
        {stage.year}
      </text>

      {/* Layer labels */}
      {fragmentH > 4 && (
        <text x="5" y={180 - bedrockH - fragmentH / 2 + 2} fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Outfit">Sedimentos</text>
      )}
      {organicH > 4 && (
        <text x="5" y={180 - bedrockH - fragmentH - organicH / 2 + 2} fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Outfit">Orgânico</text>
      )}
      {hummusH > 4 && (
        <text x="5" y={180 - bedrockH - fragmentH - organicH - hummusH / 2 + 2} fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Outfit">Húmus</text>
      )}
      <text x="5" y={180 - bedrockH / 2 + 2} fill="rgba(255,255,255,0.4)" fontSize="6" fontFamily="Outfit">Rocha Base</text>
    </svg>
  )
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────

export default function SoilSimulator() {
  const [timeValue, setTimeValue] = useState(0)
  const [rainLevel, setRainLevel] = useState(0) // 0, 1, 2, 3
  const [hasVegetation, setHasVegetation] = useState(false)
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null)
  const [infoModal, setInfoModal] = useState<{ label: string; content: string } | null>(null)

  const stage = getStageFromValue(timeValue)

  // Effective time boosted by controls
  const effectiveTime = Math.min(timeValue + rainLevel * 5 + (hasVegetation ? 8 : 0), 100)

  const handleStatClick = useCallback((label: string, content: string) => {
    setInfoModal({ label, content })
  }, [])

  // Close modal on overlay click
  const handleOverlayClick = useCallback(() => setInfoModal(null), [])

  return (
    <div className={styles.wrapper}>
      {/* ─── HEADER ─── */}
      <header className={styles.header}>
        <div className={styles.headerBadge}>GEOCIÊNCIAS · CAP 03</div>
        <h1 className={styles.headerTitle}>Formação do Solo</h1>
        <p className={styles.headerSub}>Mova o tempo e veja a transformação de milênios acontecer.</p>
      </header>

      {/* ─── MAIN CARD ─── */}
      <div className={styles.cardSplit}>

        {/* ─── LEFT: VISUAL ─── */}
        <section className={styles.visualArea}>
          <div className={styles.viewerContainer}>

            {/* Soil Cross Section */}
            <div className={styles.soilViewer}>
              <SoilCrossSection
                timeValue={effectiveTime}
                rainLevel={rainLevel}
                hasVegetation={hasVegetation}
              />
              <div className={styles.stageLabel}>{stage.label}</div>
            </div>

            {/* ─── TIMELINE ─── */}
            <div className={styles.timelineSection}>
              <div className={styles.timelineHeader}>
                <span className={styles.timelineTag}>⏳ SUPERFÍCIE</span>
                <span className={styles.timelineYear}>{stage.year}</span>
                <span className={styles.timelineTag}>🌍 {stage.stats.tempo}</span>
              </div>

              <div className={styles.timelineTrack}>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={timeValue}
                  onChange={e => setTimeValue(Number(e.target.value))}
                  className={styles.timelineSlider}
                  aria-label="Controle de tempo de formação do solo"
                />
                <div className={styles.timelineMarkers}>
                  {SOIL_STAGES.map(s => (
                    <button
                      key={s.id}
                      className={`${styles.timelineMarker} ${stage.id === s.id ? styles.markerActive : ''}`}
                      style={{ left: `${(s.timeRange[0] + s.timeRange[1]) / 2}%` }}
                      onClick={() => setTimeValue(Math.round((s.timeRange[0] + s.timeRange[1]) / 2))}
                      aria-label={`Ir para ${s.label}`}
                      title={s.label}
                    />
                  ))}
                </div>
              </div>

              <div className={styles.timelineSteps}>
                {SOIL_STAGES.map(s => (
                  <span
                    key={s.id}
                    className={`${styles.timelineStep} ${stage.id === s.id ? styles.stepActive : ''}`}
                  >
                    {s.label}
                  </span>
                ))}
              </div>
            </div>

            {/* ─── CONTROLS ─── */}
            <div className={styles.controlsRow}>
              {/* Rain */}
              <div className={styles.controlCard}>
                <div className={styles.controlLabel}>
                  <span>🌧️</span>
                  <span>Intensidade de Chuva</span>
                </div>
                <div className={styles.rainButtons}>
                  {['Seca', 'Leve', 'Média', 'Forte'].map((label, idx) => (
                    <button
                      key={idx}
                      className={`${styles.rainBtn} ${rainLevel === idx ? styles.rainBtnActive : ''}`}
                      onClick={() => setRainLevel(idx)}
                      aria-label={`Chuva: ${label}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Vegetation */}
              <div className={styles.controlCard}>
                <div className={styles.controlLabel}>
                  <span>🌱</span>
                  <span>Presença de Vegetação</span>
                </div>
                <button
                  className={`${styles.vegToggle} ${hasVegetation ? styles.vegOn : ''}`}
                  onClick={() => setHasVegetation(v => !v)}
                  aria-pressed={hasVegetation}
                  aria-label={hasVegetation ? 'Desativar vegetação' : 'Ativar vegetação'}
                >
                  <span className={styles.toggleKnob} />
                  <span className={styles.toggleLabel}>{hasVegetation ? 'Ativa 🌿' : 'Inativa'}</span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* ─── RIGHT: INFO PANEL ─── */}
        <aside className={styles.infoArea}>
          <div className={styles.infoCard} key={stage.id}>

            {/* Stage Badge */}
            <div className={styles.stageBadge}>{stage.label}</div>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div
                className={styles.statBox}
                onClick={() => handleStatClick('Tempo', `Estágio atual: ${stage.stats.tempo}. A formação do solo é um processo que dura de centenas a dezenas de milhares de anos.`)}
                role="button" tabIndex={0}
              >
                <label>⏱ Tempo</label>
                <span>{stage.stats.tempo}</span>
              </div>
              <div
                className={styles.statBox}
                onClick={() => handleStatClick('Material', `Material: ${stage.stats.material}. Cada estágio transforma o material em algo mais rico e complexo.`)}
                role="button" tabIndex={0}
              >
                <label>🪨 Material</label>
                <span>{stage.stats.material}</span>
              </div>
              <div
                className={styles.statBox}
                onClick={() => handleStatClick('Umidade', `Umidade: ${stage.stats.umidade}. A água é fundamental — ela carrega nutrientes e dissolve minerais das rochas.`)}
                role="button" tabIndex={0}
              >
                <label>💧 Umidade</label>
                <span>{stage.stats.umidade}</span>
              </div>
              <div
                className={styles.statBox}
                onClick={() => handleStatClick('Fertilidade', `Fertilidade: ${stage.stats.fertilidade}. Quanto mais matéria orgânica, mais nutrientes disponíveis para as plantas.`)}
                role="button" tabIndex={0}
              >
                <label>🌾 Fertilidade</label>
                <span className={styles.fertilityVal}>{stage.stats.fertilidade}</span>
              </div>
            </div>

            {/* Description */}
            <div className={styles.explanationBox}>
              <p>{stage.description}</p>
            </div>

            {/* Theo Tip */}
            <div className={styles.theoTipMini}>
              <div className={styles.theoAvatar}>🌔</div>
              <div className={styles.theoContent}>
                <strong>Dica do Théo:</strong>
                <p>{stage.tip}</p>
              </div>
            </div>

            {/* ─── QUIZ ─── */}
            <div className={styles.quizBox}>
              <div className={styles.quizQuestion}>
                🧠 O que faz o solo se formar mais rápido?
              </div>
              <div className={styles.quizOptions}>
                {QUIZ_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`${styles.quizOption}
                      ${quizAnswer === opt.id ? (opt.correct ? styles.optionCorrect : styles.optionWrong) : ''}
                    `}
                    onClick={() => setQuizAnswer(opt.id)}
                    disabled={quizAnswer !== null}
                    aria-label={`Resposta: ${opt.label}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              {quizAnswer && (
                <div className={`${styles.quizFeedback} ${QUIZ_OPTIONS.find(o => o.id === quizAnswer)?.correct ? styles.feedbackCorrect : styles.feedbackWrong}`}>
                  {QUIZ_OPTIONS.find(o => o.id === quizAnswer)?.feedback}
                  {QUIZ_OPTIONS.find(o => o.id === quizAnswer)?.correct && (
                    <button className={styles.retryBtn} onClick={() => setQuizAnswer(null)}>↩ Tentar de novo</button>
                  )}
                </div>
              )}
            </div>

          </div>
        </aside>

      </div>

      {/* ─── INFO MODAL ─── */}
      {infoModal && (
        <div className={styles.modalOverlay} onClick={handleOverlayClick}>
          <div className={styles.infoModal} onClick={e => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setInfoModal(null)}>×</button>
            <div className={styles.modalGlow} />
            <h3 className={styles.modalTitle}>{infoModal.label}</h3>
            <p className={styles.modalBody}>{infoModal.content}</p>
          </div>
        </div>
      )}
    </div>
  )
}
