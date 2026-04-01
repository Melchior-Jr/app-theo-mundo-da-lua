import { useState, useEffect } from 'react'
import { IoClose, IoMusicalNotes, IoVolumeHigh, IoStar, IoPerson } from 'react-icons/io5'
import { useSound } from '@/context/SoundContext'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import styles from './QuizSystem.module.css'

interface SettingsModalProps {
  onClose: () => void
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { 
    bgVolume, setBgVolume, 
    sfxVolume, setSfxVolume, 
    narrationVolume, setNarrationVolume,
    isMuted, toggleMute,
    playSFX
  } = useSound()
  const { user } = useAuth()
  const [profile, setProfile] = useState<{ xp: number; level: string }>({ xp: 0, level: 'Recruta' })

  useEffect(() => {
    async function fetchProfile() {
      if (!user) return
      const { data } = await supabase
        .from('player_global_stats')
        .select('galactic_xp')
        .eq('player_id', user.id)
        .maybeSingle()
      
      if (data) {
        const xp = data.galactic_xp
        let level = 'Recruta'
        if (xp >= 5000) level = 'Comandante'
        else if (xp >= 2000) level = 'Explorador'
        else if (xp >= 500) level = 'Cadete'
        
        setProfile({ xp, level })
      }
    }
    fetchProfile()
  }, [user])

  const handleToggleMute = () => {
    toggleMute()
    playSFX('click')
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.settingsModal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeModal} onClick={onClose}>
          <IoClose />
        </button>

        <div className={styles.settingsHeader}>
          <div className={styles.profileBrief}>
            <div className={styles.profileAvatar}>
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Avatar" />
              ) : (
                <div className={styles.avatarPlaceholder}><IoPerson /></div>
              )}
            </div>
            <div className={styles.profileInfoCompact}>
              <h3>{user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Explorador'}</h3>
              <div className={styles.profileStatsRow}>
                <span className={styles.levelTag}>{profile.level}</span>
                <span className={styles.xpTag}><IoStar /> {profile.xp} XP</span>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.settingsDivider} />

        <div className={styles.settingsContent}>
          {/* Mute Global */}
          <div className={styles.settingRow}>
            <div className={styles.settingInfo}>
              <div className={styles.settingLabelIcon}>
                {isMuted ? <IoVolumeHigh style={{ opacity: 0.3 }} /> : <IoVolumeHigh />}
                <span>Silenciar Tudo</span>
              </div>
            </div>
            <button 
              className={`${styles.toggleSwitch} ${isMuted ? styles.toggleOn : ''}`}
              onClick={handleToggleMute}
            >
              <div className={styles.toggleHandle} />
            </button>
          </div>

          <div className={styles.settingsDivider} />

          {/* Volume da Narração */}
          <div className={styles.settingItem}>
            <div className={styles.settingLabelRow}>
              <div className={styles.settingLabelIcon}>
                <IoVolumeHigh />
                <span>Narração do Théo</span>
              </div>
              <span className={styles.volumePercent}>{Math.round(narrationVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={narrationVolume}
              onChange={(e) => setNarrationVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className={styles.volumeSlider}
            />
          </div>

          {/* Volume da Música */}
          <div className={styles.settingItem}>
            <div className={styles.settingLabelRow}>
              <div className={styles.settingLabelIcon}>
                <IoMusicalNotes />
                <span>Música de Fundo</span>
              </div>
              <span className={styles.volumePercent}>{Math.round(bgVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="0.5" 
              step="0.01" 
              value={bgVolume}
              onChange={(e) => setBgVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className={styles.volumeSlider}
            />
          </div>

          {/* Volume do SFX */}
          <div className={styles.settingItem}>
            <div className={styles.settingLabelRow}>
              <div className={styles.settingLabelIcon}>
                <IoVolumeHigh />
                <span>Efeitos do Jogo</span>
              </div>
              <span className={styles.volumePercent}>{Math.round(sfxVolume * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0" 
              max="1" 
              step="0.05" 
              value={sfxVolume}
              onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
              disabled={isMuted}
              className={styles.volumeSlider}
            />
          </div>
        </div>

        <div className={styles.settingsFooter}>
          <button className={styles.confirmBtn} onClick={onClose}>
            confirmar sistemas
          </button>
        </div>
      </div>
    </div>
  )
}
