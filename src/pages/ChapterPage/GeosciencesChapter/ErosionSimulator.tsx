import { useState } from 'react'
import styles from './GeosciencesChapter.module.css'

export default function ErosionSimulator() {
  const [activeAgent, setActiveAgent] = useState<'none' | 'chuva' | 'vento' | 'rio'>('none')

  return (
    <div className={styles.interactiveContainer}>
      <header className={styles.interactiveHeader}>
        <h2 className={styles.interactiveTitle}>Artistas da Natureza</h2>
        <p className={styles.interactiveSubtitle}>Clique nos agentes para ver como eles esculpem a paisagem ao longo do tempo.</p>
      </header>

      <div className={styles.erosionSim}>
        <div className={styles.landscapeView}>
          <div className={`${styles.landscape} state-${activeAgent}`}>
            <div className={styles.mountain} />
            <div className={styles.riverBed} />
            
            {/* Efeitos Visuais */}
            {activeAgent === 'chuva' && <div className={styles.rainEffect} />}
            {activeAgent === 'vento' && <div className={styles.windEffect} />}
            {activeAgent === 'rio' && <div className={styles.riverEffect} />}
          </div>
        </div>

        <div className={styles.erosionControls}>
          <button 
            className={`${styles.agentButton} ${activeAgent === 'chuva' ? styles.active : ''}`}
            onClick={() => setActiveAgent('chuva')}
          >
            <span>🌧️</span> Chuva
          </button>
          <button 
            className={`${styles.agentButton} ${activeAgent === 'vento' ? styles.active : ''}`}
            onClick={() => setActiveAgent('vento')}
          >
            <span>🌬️</span> Vento
          </button>
          <button 
            className={`${styles.agentButton} ${activeAgent === 'rio' ? styles.active : ''}`}
            onClick={() => setActiveAgent('rio')}
          >
            <span>🌊</span> Rio
          </button>
          <button 
            className={styles.resetButton}
            onClick={() => setActiveAgent('none')}
          >
            Restaurar
          </button>
        </div>

        <div className={styles.erosionInfo}>
          {activeAgent === 'none' && <p>Selecione um agente erosivo para começar a escultura!</p>}
          {activeAgent === 'chuva' && (
            <p className="animate-fade-in">A <strong>chuva</strong> carrega pequenos pedaços de terra e desgasta as rochas mais moles, criando novos caminhos na montanha.</p>
          )}
          {activeAgent === 'vento' && (
            <p className="animate-fade-in">O <strong>vento</strong> sopra areia contra as rochas, funcionando como uma lixa que esculpe formas incríveis como arcos e buracos.</p>
          )}
          {activeAgent === 'rio' && (
            <p className="animate-fade-in">O <strong>rio</strong> cava vales profundos! A força da água corrente consegue cortar até as rochas mais duras durante milhões de anos.</p>
          )}
        </div>
      </div>
    </div>
  )
}
