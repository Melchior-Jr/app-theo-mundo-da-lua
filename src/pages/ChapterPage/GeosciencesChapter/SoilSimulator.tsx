import { useState } from 'react'
import styles from './GeosciencesChapter.module.css'

const STAGES = [
  {
    level: 0,
    title: 'Rocha Mãe',
    year: 'Ano 0',
    description: 'Tudo começa com uma grande rocha sólida, sem vida e sem terra.',
    visual: '🪨',
    details: 'A rocha está exposta ao sol, chuva e vento.'
  },
  {
    level: 1,
    title: 'Desintegração',
    year: '+500 Anos',
    description: 'O calor e o frio fazem a rocha rachar. Pequenos pedaços começam a se soltar.',
    visual: '⛏️',
    details: 'Líquens e pequenos musgos começam a aparecer nas frestas.'
  },
  {
    level: 2,
    title: 'Solo Jovem',
    year: '+2.000 Anos',
    description: 'Pequenas plantas e insetos ajudam a quebrar ainda mais os minerais.',
    visual: '🌿',
    details: 'Já existe uma camada fina de terra capaz de segurar água.'
  },
  {
    level: 3,
    title: 'Solo Maduro',
    year: '+10.000 Anos',
    description: 'O solo está profundo e rico em nutrientes (húmus). Árvores grandes podem crescer!',
    visual: '🌳',
    details: 'A rocha mãe agora está bem lá no fundo, protegida pelo solo fértil.'
  }
]

export default function SoilSimulator() {
  const [currentLevel, setCurrentLevel] = useState(0)
  const stage = STAGES[currentLevel]

  return (
    <div className={styles.interactiveContainer}>
      <header className={styles.interactiveHeader}>
        <h2 className={styles.interactiveTitle}>Simulador de Solo</h2>
        <p className={styles.interactiveSubtitle}>Arraste o botão para ver como a natureza leva milhares de anos para criar a terra.</p>
      </header>

      <div className={styles.soilArea}>
        <div className={styles.soilVisual}>
          <div className={`${styles.soilLayers} stage-${currentLevel}`}>
             {/* Representação visual do solo crescendo */}
             <div className={styles.sky} />
             <div className={styles.surface}>
                <span className={styles.surfaceIcon}>{stage.visual}</span>
             </div>
             <div className={styles.soilBody}>
                {currentLevel >= 2 && <div className={styles.soilRich} />}
                {currentLevel >= 1 && <div className={styles.soilMedium} />}
                <div className={styles.bedrock} />
             </div>
          </div>
        </div>

        <div className={styles.soilControls}>
          <div className={styles.stageTimeline}>
            {STAGES.map((s, idx) => (
              <div 
                key={s.level} 
                className={`${styles.timelinePoint} ${idx <= currentLevel ? styles.active : ''}`}
                onClick={() => setCurrentLevel(idx)}
              >
                <div className={styles.pointLabel}>{s.year}</div>
              </div>
            ))}
          </div>
          
          <input 
            type="range" 
            min="0" 
            max={STAGES.length - 1} 
            value={currentLevel} 
            onChange={(e) => setCurrentLevel(parseInt(e.target.value))}
            className={styles.soilRange}
          />
        </div>

        <div className={styles.stageCard}>
          <h3 className={styles.stageTitle}>{stage.title}</h3>
          <p className={styles.stageDesc}>{stage.description}</p>
          <div className={styles.stageDetails}>
            <strong>O que acontece:</strong> {stage.details}
          </div>
        </div>
      </div>
    </div>
  )
}
