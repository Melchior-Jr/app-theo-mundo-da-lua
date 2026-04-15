import { useState, useCallback } from 'react'
import styles from './SoilSimulator.module.css'
import geoStyles from './GeosciencesChapter.module.css'
import { 
  CloudDrizzle,
  CloudRain,
  CloudLightning,
  Leaf,
  Wind
} from 'lucide-react';

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

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function getStageFromValue(val: number) {
  return SOIL_STAGES.find(s => val >= s.timeRange[0] && val <= s.timeRange[1]) ?? SOIL_STAGES[0]
}

function getYearFromValue(val: number) {
  let year = 0;
  if (val <= 25) year = (val / 25) * 500;
  else if (val <= 50) year = 500 + ((val - 25) / 25) * 1500;
  else if (val <= 75) year = 2000 + ((val - 50) / 25) * 3000;
  else year = 5000 + ((val - 75) / 25) * 5000;
  
  const rounded = Math.round(year);
  return rounded === 0 ? "Ano 0" : `+${rounded.toLocaleString('pt-BR')} Anos`;
}

// ─── SOIL SVG ─────────────────────────────────────────────────────────────────

function SoilCrossSection({ timeValue, rainLevel, hasVegetation }: {
  timeValue: number
  rainLevel: number
  hasVegetation: boolean
}) {
  const stage = getStageFromValue(timeValue)
  const progress = timeValue / 100

  const bedrockH = 60
  const fragmentH = Math.min(progress * 50, 30)
  const organicH = Math.min(Math.max((progress - 0.5) * 60, 0), 20)
  const hummusH = Math.min(Math.max((progress - 0.7) * 50, 0), 12)
  const topsoilH = Math.min(Math.max((progress - 0.8) * 40, 0), 8)

  const bedrockColor = progress < 0.3 ? '#9E9E9E' : '#7B7B7B'
  const fragmentColor = '#A0522D'
  const organicColor = `hsl(${25 + progress * 15}, ${40 + progress * 25}%, ${30 + progress * 10}%)`
  const hummusColor = '#3E2005'
  const topsoilColor = hasVegetation ? '#1B5E20' : '#2E7D32'

  const rainDrops = rainLevel > 0
    ? Array.from({ length: rainLevel * 3 }, (_, i) => ({
        x: (i * 37 + 15) % 200,
        delay: (i * 0.3) % 2,
        dur: 0.8 + (i % 3) * 0.2,
      }))
    : []

  const roots = hasVegetation && progress > 0.5
    ? Array.from({ length: 4 }, (_, i) => ({
        x: 60 + i * 20,
        depth: Math.min((progress - 0.5) * 100, 40),
      }))
    : []

  return (
    <svg viewBox="0 0 200 180" className={styles.soilSvg} aria-label={`Simulação de solo: estágio ${stage.label}`}>
      <rect x="0" y="0" width="200" height="60" fill={`hsl(210, ${20 + progress * 30}%, ${10 + progress * 10}%)`} />

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

      <line x1="0" y1="60" x2="200" y2="60" stroke="rgba(255,255,255,0.1)" strokeWidth="0.5" />

      <rect x="0" y={180 - bedrockH} width="200" height={bedrockH} fill={bedrockColor} />
      {progress > 0.1 && [30, 80, 130, 170].map((x, i) => (
        <path
          key={i}
          d={`M${x} ${180 - bedrockH} l${-5 + i * 2} ${10 + i * 3}`}
          stroke="rgba(0,0,0,0.3)" strokeWidth="1.5" fill="none"
        />
      ))}

      {fragmentH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH}
          width="200" height={fragmentH}
          fill={fragmentColor}
          className={styles.layerAnimate}
        />
      )}

      {organicH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH}
          width="200" height={organicH}
          fill={organicColor}
          className={styles.layerAnimate}
        />
      )}

      {hummusH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH - hummusH}
          width="200" height={hummusH}
          fill={hummusColor}
          className={styles.layerAnimate}
        />
      )}

      {topsoilH > 0 && (
        <rect
          x="0" y={180 - bedrockH - fragmentH - organicH - hummusH - topsoilH}
          width="200" height={topsoilH}
          fill={topsoilColor}
          className={styles.layerAnimate}
        />
      )}

      {roots.map((root, i) => (
        <path
          key={i}
          d={`M${root.x} 60 Q${root.x + 5} ${80} ${root.x - 3} ${60 + root.depth}`}
          stroke="#2E7D32" strokeWidth="1.5" fill="none" opacity="0.7"
          className={styles.rootAnimate}
        />
      ))}

      {hasVegetation && progress > 0.3 && (
        <>
          <circle cx="60" cy="50" r={4 + progress * 8} fill="#2E7D32" opacity="0.9" />
          <circle cx="100" cy="45" r={5 + progress * 10} fill="#388E3C" opacity="0.8" />
          <circle cx="145" cy="52" r={3 + progress * 6} fill="#1B5E20" opacity="0.9" />
          <rect x="59" y={50 + (4 + progress * 8)} width="2" height="8" fill="#5D4037" />
          <rect x="99" y={45 + (5 + progress * 10)} width="2" height="10" fill="#5D4037" />
        </>
      )}

      <text x="10" y="15" fill="rgba(255,255,255,0.5)" fontSize="7" fontFamily="Outfit, sans-serif">
        {getYearFromValue(timeValue)}
      </text>

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

type RainIntensity = 'seca' | 'leve' | 'média' | 'forte';

export default function SoilSimulator() {
  const [timeValue, setTimeValue] = useState(0)
  const [rain, setRain] = useState<RainIntensity>('seca')
  const [hasVegetation, setHasVegetation] = useState(false)

  const [infoModal, setInfoModal] = useState<{ label: string; content: string } | null>(null)

  const rainLevelMap: Record<RainIntensity, number> = { seca: 0, leve: 1, média: 2, forte: 3 };
  const rainLevel = rainLevelMap[rain];

  const stage = getStageFromValue(timeValue)

  const effectiveTime = Math.min(timeValue + rainLevel * 5 + (hasVegetation ? 8 : 0), 100)

  const handleStatClick = useCallback((label: string, content: string) => {
    setInfoModal({ label, content })
  }, [])

  const handleOverlayClick = useCallback(() => setInfoModal(null), [])

  return (
    <div className={styles.wrapper}>
      <main className={geoStyles.mainCard}>
        <header className={geoStyles.layerMainHeader}>
          <h2 className={geoStyles.layerTitle}>{stage.label}</h2>
        </header>

      <div className={styles.cardSplit}>

        <section className={styles.visualArea}>
          <div className={styles.viewerContainer}>

            <div className={styles.simulationDeck}>
              <div className={styles.deckSection}>
                <span className={styles.deckLabel}>CONTROLES AMBIENTAIS</span>
                <div className={styles.controlsStrip}>
                  {[
                    { id: 'seca', icon: <Wind size={18} />, label: 'Seca' },
                    { id: 'leve', icon: <CloudDrizzle size={18} />, label: 'Leve' },
                    { id: 'média', icon: <CloudRain size={18} />, label: 'Média' },
                    { id: 'forte', icon: <CloudLightning size={18} />, label: 'Tempestade' }
                  ].map((item) => (
                    <button
                      key={item.id}
                      className={`${styles.intensityBtn} ${rain === item.id ? styles.intensityActive : ''}`}
                      onClick={() => setRain(item.id as RainIntensity)}
                      title={item.label}
                    >
                      {item.icon}
                      <span className={styles.btnHint}>{item.label}</span>
                    </button>
                  ))}

                  <div className={styles.stripDivider} />

                  <button 
                    className={`${styles.intensityBtn} ${hasVegetation ? styles.bioticActive : ''}`}
                    onClick={() => setHasVegetation(!hasVegetation)}
                    title="Cobertura de Vegetação"
                  >
                    <Leaf size={18} />
                    <span className={styles.btnHint}>
                      {hasVegetation ? 'Vegetação Ativa' : 'Solo Exposto'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            <div 
              className={styles.soilViewer}
              onClick={() => setInfoModal({ 
                label: `Estágio: ${stage.label}`, 
                content: stage.description 
              })}
              title="Toque para entender este estágio"
            >
              <SoilCrossSection
                timeValue={effectiveTime}
                rainLevel={rainLevel}
                hasVegetation={hasVegetation}
              />
            </div>

            <div className={styles.timelineSection}>
              <div className={styles.timelineHeader}>
                <span className={styles.timelineTag}>⏳ 0 ANOS</span>
                <span className={styles.timelineYear}>{getYearFromValue(timeValue)}</span>
                <span className={styles.timelineTag}>🌍 10.000 ANOS</span>
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
            </div>
          </div>
        </section>

        {/* ─── RIGHT: INFO PANEL ─── */}
        <aside className={styles.infoArea}>
          <div className={styles.infoCard} key={stage.id}>

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
              <div
                className={styles.statBox}
                onClick={() => handleStatClick('Tempo', `Estágio atual: ${stage.stats.tempo}. A formação do solo é um processo que dura de centenas a dezenas de milhares de anos.`)}
                role="button" tabIndex={0}
              >
                <label>⏱ Tempo</label>
                <span>{getYearFromValue(timeValue).replace('+', '')}</span>
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
      </main>
    </div>
  )
}
