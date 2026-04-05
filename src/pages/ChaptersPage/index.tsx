import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Settings, Bell } from 'lucide-react'
import StarField from '@/components/StarField'
import ChapterCard from '@/components/ChapterCard'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { useProgress } from '@/hooks/useProgress'
import { useAuth } from '@/context/AuthContext'
import { supabase } from '@/lib/supabase'
import { CHAPTERS } from '@/data/chapters'
import { getNarrationById } from '@/data/narration'
import { calcLevel } from '@/utils/playerUtils'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { NotificationService } from '@/services/notificationService'
import styles from './ChaptersPage.module.css'

export default function ChaptersPage() {
  const { session, user } = useAuth()
  const [featured, ...rest] = CHAPTERS
  const narration = getNarrationById('chapters-selection')
  const { setActiveNarration } = useNarrationSequence()
  const { progress } = useProgress()

  const [playerData, setPlayerData]   = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [scrolled, setScrolled]       = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAuth, setShowAuth] = useState(false)

  useEffect(() => {
    if (narration) setActiveNarration(narration)
  }, [narration, setActiveNarration])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop
    setScrolled(top > 60)
  }

  useEffect(() => {
    if (user?.id) {
      NotificationService.countUnread(user.id, 'jornada').then(setUnreadCount)
    }
  }, [user])

  useEffect(() => {
    if (user?.id) fetchPlayerData()
    else { setPlayerData(null); setPlayerStats(null) }
  }, [user])

  const fetchPlayerData = async () => {
    try {
      const { data: profile } = await supabase.from('players').select('*').eq('id', user?.id).single()
      const { data: stats }   = await supabase.from('player_global_stats').select('*').eq('player_id', user?.id).single()
      setPlayerData(profile); setPlayerStats(stats)
    } catch (e) { console.error(e) }
  }

  const level = calcLevel(playerStats?.galactic_xp)

  return (
    <div className={styles.page} onScroll={handleScroll}>
      <StarField />

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo}>
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
          
          <div className={styles.navActions}>
            {session && (
              <div className={styles.mobileBell} style={{ position: 'relative' }}>
                <button 
                  className={styles.bellBtn} 
                  title="Notificações"
                  onClick={() => setShowNotifications(!showNotifications)}
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
            )}
          </div>

          <div className={styles.navLinks}>
            {session && (
              <div className={styles.userWidget}>
                <div className={styles.desktopBell} style={{ position: 'relative' }}>
                  <button 
                    className={styles.bellBtn} 
                    title="Notificações"
                    onClick={() => setShowNotifications(!showNotifications)}
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
                <div className={styles.userCard}>
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
                </div>

                <button className={styles.settingsBtn} title="Configurações">
                  <Settings size={18} />
                </button>
              </div>
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
          <ChapterCard 
            chapter={featured} 
            featured 
            animationDelay={150} 
            isCompleted={progress.some(p => p.chapter_id === featured.id && p.completed)} 
            onClick={(e) => {
              if (!session) {
                e.preventDefault()
                setShowAuth(true)
              }
            }}
          />
          {rest.map((chapter, i) => (
            <ChapterCard 
              key={chapter.id} 
              chapter={chapter} 
              animationDelay={250 + i * 80} 
              isCompleted={progress.some(p => p.chapter_id === chapter.id && p.completed)} 
              onClick={(e) => {
                if (!session) {
                  e.preventDefault()
                  setShowAuth(true)
                }
              }}
            />
          ))}

          <Link to="/jogos" className={styles.quizCard} style={{ animationDelay: '600ms' }}>
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
    </div>
  )
}
