import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Bell } from 'lucide-react'
import StarField from '@/components/StarField'
import ChapterCard from '@/components/ChapterCard'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { CHAPTERS } from '@/data/chapters'
import { getNarrationById } from '@/data/narration'
import { calcLevel } from '@/utils/playerUtils'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { NotificationService } from '@/services/notificationService'
import { SettingsModal } from '@/components/SettingsModal'
import { useSound } from '@/context/SoundContext'
import styles from './ChaptersPage.module.css'

export default function ChaptersPage() {
  const { session, user } = useAuth()
  const { 
    playerData, 
    playerStats, 
    progress,
    explorationLogs 
  } = usePlayer()

  const [scrolled, setScrolled]       = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  const { playBGMusic, playSFX } = useSound()
  const narration = getNarrationById('chapters-selection')
  const { setActiveNarration, isGlobalLoading } = useNarrationSequence()

  useEffect(() => {
    if (isGlobalLoading) return

    if (narration) setActiveNarration(narration)
    playBGMusic()
  }, [narration, setActiveNarration, playBGMusic, isGlobalLoading])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop
    setScrolled(top > 60)
  }

  useEffect(() => {
    if (user?.id) {
      NotificationService.countUnread(user.id, 'jornada').then(setUnreadCount)
    }
  }, [user])

  const level = calcLevel(playerStats?.galactic_xp)

  return (
    <div className={styles.page} onScroll={handleScroll}>
      <StarField />

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo} onClick={() => playSFX('click')}>
            {!scrolled ? (
              <div className={styles.logoMoon}><div className={styles.moon}></div><div className={styles.glow}></div></div>
            ) : (
              <div className={styles.logoText}>
                <span className={styles.theo}>Théo</span>
                <span className={styles.noMundo}> no Mundo</span>
                <span className={styles.daLuaNav}>da Lua<span className={styles.moonEmojiNav}>🌙</span></span>
              </div>
            )}
          </Link>
          
          <div className={styles.navLinks}>
            {session && (
              <>
                <div className={styles.mobileBell} style={{ position: 'relative' }}>
                  <button 
                    className={styles.bellBtn} 
                    title="Notificações"
                    onClick={() => {
                      playSFX('click')
                      setShowNotifications(!showNotifications)
                    }}
                  >
                    <Bell size={18} />
                    {unreadCount > 0 && <div className={styles.bellDot} />}
                  </button>
                  
                  <NotificationDropdown 
                    userId={user?.id || ''}
                    isOpen={showNotifications}
                    onClose={() => setShowNotifications(false)}
                    onUnreadChange={setUnreadCount}
                  />
                </div>

                <div className={styles.userWidget}>
                  <div className={styles.desktopBell} style={{ position: 'relative' }}>
                    <button 
                      className={styles.bellBtn} 
                      title="Notificações"
                      onClick={() => {
                        playSFX('click')
                        setShowNotifications(!showNotifications)
                      }}
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && <div className={styles.bellDot} />}
                    </button>
                    
                    <NotificationDropdown 
                      userId={user?.id || ''}
                      isOpen={showNotifications}
                      onClose={() => setShowNotifications(false)}
                      onUnreadChange={setUnreadCount}
                    />
                  </div>

                  <button 
                    className={styles.settingsBtn} 
                    title="Configurações"
                    onClick={() => {
                      playSFX('click')
                      setShowSettings(true)
                    }}
                  >
                    <Settings size={18} />
                  </button>

                  <Link to="/perfil" className={styles.userCard} onClick={() => playSFX('click')}>
                    <div className={styles.userAvatarWrap}>
                      {playerData?.avatar_url ? <img src={playerData.avatar_url} className={styles.userAvatar} /> : <div className={styles.userAvatarFallback}>{playerData?.username?.charAt(0) || '?'}</div>}
                    </div>
                    <div className={styles.userInfo}>
                      <span className={styles.userName}>{playerData?.username || 'Astronauta'}</span>
                      <div className={styles.userMeta}>
                        <span className={styles.userLevel}>NIV. {level}</span>
                        <span className={styles.userXp}>{playerStats?.galactic_xp || 0} XP</span>
                      </div>
                    </div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div className={`${styles.headingGroup} opacity-0 animate-slide-up delay-100`}>
            <p className={styles.pageLabel}>Jornada Galáctica</p>
            <h1 className={styles.pageTitle}>O que você quer explorar?</h1>
          </div>

          <div className={`${styles.progressPills} opacity-0 animate-fade-in delay-200`}>
            {CHAPTERS.map((c) => (
              <Link key={c.id} to={c.path} className={styles.pill} style={{ '--pill-color': c.color } as React.CSSProperties} />
            ))}
          </div>
        </header>

        <div className={styles.grid}>
          {CHAPTERS.map((chapter, i) => {
            const isCompleted = progress.some((p: any) => p.chapter_id === chapter.id && p.completed)
            
            // Calcula XP Ganho (Conclusão + Exploração)
            const chapterCompletionXP = isCompleted ? chapter.xpAward : 0
            
            // Filtra logs de exploração que pertencem a este capítulo
            const explorationXP = explorationLogs
              .filter((log: any) => {
                const id = log.exploration_id
                if (chapter.id === 'sistema-solar') 
                  return id.startsWith('view-planet-') || id.startsWith('interact-3d-') || id.startsWith('stat-detail-')
                if (chapter.id === 'movimentos-da-terra')
                  return id.startsWith('view-motion-') || id.startsWith('interact-motion-3d-') || id.startsWith('motion-detail-')
                if (chapter.id === 'constelaçoes')
                  return id.startsWith('view-constellation-') || id.startsWith('reveal-constellation-') || id.startsWith('const-detail-') || id.startsWith('const-intro-guide-')
                if (chapter.id === 'fases-da-lua')
                  return id.startsWith('view-moon-phase-') || id.startsWith('moon-detail-scene-') || id.startsWith('moon-detail-time-')
                return false
              })
              .reduce((sum: number, log: any) => sum + (log.xp_awarded || 10), 0)

            const totalEarned = chapterCompletionXP + explorationXP

            // Define o XP total potencial (baseado no mapeamento de interação)
            const XP_TOTAL_MAX: Record<string, number> = {
              'sistema-solar': 1000,
              'movimentos-da-terra': 700,
              'constelaçoes': 1300,
              'fases-da-lua': 1000
            }

            return (
              <ChapterCard 
                key={chapter.id} 
                chapter={chapter} 
                featured={i === 0}
                animationDelay={150 + i * 100} 
                isCompleted={isCompleted} 
                xpEarned={totalEarned}
                xpTotal={XP_TOTAL_MAX[chapter.id] || chapter.xpAward}
                onClick={(e) => {
                  if (!user) {
                    e.preventDefault()
                    setShowAuth(true)
                  }
                }}
              />
            )
          })}

          <Link 
            to="/jogos" 
            className={styles.quizCard} 
            style={{ animationDelay: '600ms' }}
            onClick={() => playSFX('click')}
          >
            <div className={styles.quizIcon}>🎮</div>
            <div className={styles.quizContent}>
              <span className={styles.quizTag}>CENTRAL DE JOGOS</span>
              <h3 className={styles.quizTitle}>Desafios no Espaço</h3>
              <p className={styles.quizDesc}>Pronto para os jogos do Théo?</p>
            </div>
            <div className={styles.quizArrow}>→</div>
          </Link>
        </div>

        <footer className={`${styles.footer} opacity-0 animate-fade-in delay-800`}>
          <p>🚀 Théo vai te guiar em cada capítulo!</p>
        </footer>
      </div>

      {showAuth && (
        <div className={styles.authModal}>
          <div className={styles.authModalContent}>
            <h2>Seja bem-vindo, Astronauta!</h2>
            <p>Para salvar seu progresso e ganhar XP, você precisa estar logado.</p>
            <div className={styles.authModalButtons}>
              <Link to="/login" className={styles.authModalPrimary}>Ir para Login</Link>
              <button onClick={() => setShowAuth(false)} className={styles.authModalSecondary}>Continuar como Visitante</button>
            </div>
          </div>
        </div>
      )}

      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  )
}
