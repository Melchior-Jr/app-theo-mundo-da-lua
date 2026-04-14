import { useState } from 'react'
import styles from './GeosciencesChapter.module.css'

export default function TectonicSimulator() {
  const [movement, setMovement] = useState<'none' | 'colisao' | 'afastamento'>('none')

  return (
    <div className={styles.interactiveContainer}>
      <header className={styles.interactiveHeader}>
        <h2 className={styles.interactiveTitle}>Placas Tectônicas</h2>
        <p className={styles.interactiveSubtitle}>A Terra é como um quebra-cabeça gigante cujas peças estão sempre se movendo!</p>
      </header>

      <div className={styles.tectonicArea}>
        <div className={styles.platesDisplay}>
          <div className={`${styles.plate} ${styles.leftPlate} move-${movement}`} />
          <div className={`${styles.plate} ${styles.rightPlate} move-${movement}`} />
          
          {movement === 'colisao' && (
            <div className={styles.volcanoSpawn}>
              <span className={styles.warningIcon}>🌋</span>
            </div>
          )}
          {movement === 'afastamento' && (
            <div className={styles.oceanSpawn}>
              <span className={styles.warningIcon}>🌊</span>
            </div>
          )}
        </div>

        <div className={styles.tectonicControls}>
          <button 
            className={`${styles.tectButton} ${movement === 'colisao' ? styles.active : ''}`}
            onClick={() => setMovement('colisao')}
          >
            Convergir (Bater)
          </button>
          <button 
            className={`${styles.tectButton} ${movement === 'afastamento' ? styles.active : ''}`}
            onClick={() => setMovement('afastamento')}
          >
            Divergir (Separar)
          </button>
        </div>

        <div className={styles.tectonicInfo}>
          {movement === 'colisao' && (
             <p>Ao se chocarem, uma placa pode subir sobre a outra, criando <strong>montanhas</strong> e <strong>vulcões</strong> poderosos!</p>
          )}
          {movement === 'afastamento' && (
             <p>Quando as placas se separam, o magma sobe e cria <strong>novo chão</strong> no fundo dos oceanos!</p>
          )}
        </div>
      </div>
    </div>
  )
}
