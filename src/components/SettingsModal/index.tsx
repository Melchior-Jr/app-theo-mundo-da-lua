import { Volume2, VolumeX, X, Music, Headphones, MessageSquare, Zap, RotateCcw } from 'lucide-react'
import { useSound } from '@/context/SoundContext'
import styles from './SettingsModal.module.css'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { 
    isMuted, toggleMute, 
    bgVolume, setBgVolume,
    sfxVolume, setSfxVolume,
    narrationVolume, setNarrationVolume,
    narrationRate, setNarrationRate, 
    resetSettings,
    playSFX
  } = useSound()


  if (!isOpen) return null

  const handleSliderChange = (type: 'bg' | 'sfx' | 'narration' | 'rate', val: number) => {
    switch(type) {
      case 'bg': setBgVolume(val); break
      case 'sfx': setSfxVolume(val); break
      case 'narration': setNarrationVolume(val); break
      case 'rate': setNarrationRate(val); break
    }
  }

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      playSFX('click')
      onClose()
    }
  }

  return (
    <div className={styles.overlay} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}>⚙️</div>
            <h2 className={styles.title}>Configurações</h2>
          </div>
          <button className={styles.closeBtn} onClick={() => { playSFX('click'); onClose(); }}>
            <X size={20} />
          </button>
        </header>

        <div className={styles.content}>
          {/* Mute Toggle Section */}
          <div className={styles.muteSection} onClick={toggleMute}>
            <div className={styles.muteIcon}>
              {isMuted ? <VolumeX className={styles.muted} /> : <Volume2 className={styles.unmuted} />}
            </div>
            <div className={styles.muteInfo}>
              <span className={styles.muteTitle}>{isMuted ? 'Áudio Desativado' : 'Áudio Ativado'}</span>
              <span className={styles.muteSub}>Clique para alternar</span>
            </div>
            <div className={`${styles.toggle} ${!isMuted ? styles.active : ''}`}>
               <div className={styles.toggleKnob} />
            </div>
          </div>

          <div className={styles.divider}>Volume Individual</div>

          {/* Sliders Section */}
          <div className={styles.sliders}>
            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <div className={styles.labelIcon}><Music size={16} /> Música de Fundo</div>
                <span className={styles.percent}>{Math.round(bgVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="0.5" step="0.05"
                value={bgVolume}
                disabled={isMuted}
                onChange={(e) => handleSliderChange('bg', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <div className={styles.labelIcon}><Headphones size={16} /> Efeitos Sonoros (SFX)</div>
                <span className={styles.percent}>{Math.round(sfxVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={sfxVolume}
                disabled={isMuted}
                onChange={(e) => handleSliderChange('sfx', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <div className={styles.labelIcon}><MessageSquare size={16} /> Narração do Théo</div>
                <span className={styles.percent}>{Math.round(narrationVolume * 100)}%</span>
              </div>
              <input 
                type="range" 
                min="0" max="1" step="0.05"
                value={narrationVolume}
                disabled={isMuted}
                onChange={(e) => handleSliderChange('narration', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>

            <div className={styles.controlGroup}>
              <div className={styles.labelRow}>
                <div className={styles.labelIcon}><Zap size={16} /> Velocidade da Narração</div>
                <span className={styles.percent}>{narrationRate.toFixed(1)}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" max="2" step="0.1"
                value={narrationRate}
                onChange={(e) => handleSliderChange('rate', parseFloat(e.target.value))}
                className={styles.slider}
              />
            </div>
          </div>

        </div>

        <footer className={styles.footer}>
          <button className={styles.resetBtn} onClick={() => { playSFX('click'); resetSettings(); }}>
            <RotateCcw size={12} />
            Resetar Padrão
          </button>
          <p>🚀 As configurações são salvas automaticamente!</p>
        </footer>
      </div>
    </div>
  )
}
