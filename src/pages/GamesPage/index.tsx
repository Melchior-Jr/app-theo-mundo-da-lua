import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, Trophy, Medal, BookOpen, Lock, ChevronRight, Star, LayoutGrid, Bell, Settings, GraduationCap } from 'lucide-react'
import { calcLevel, getLevelTitle, calcLevelProgress } from '@/utils/playerUtils'
import StarField from '@/components/StarField'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { supabase } from '@/lib/supabase'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { NotificationService } from '@/services/notificationService'
import { SettingsModal } from '@/components/SettingsModal'
import FeaturedBanner from '@/components/FeaturedBanner'
import { useNarrationSequence } from '@/context/NarrationSequenceContext'
import { usePlayer } from '@/context/PlayerContext'
import ShareButton from '@/components/ShareButton'
import styles from './GamesPage.module.css'

// ─── SVGs ────────────────────────────────────────────────────────
function EnhancedCardArt({ main, secondary, color, bg }: { main: string, secondary?: string[], color: string, bg: string }) {
  return (
    <div className={styles.cardArtWrapper} style={{ '--c-dark': bg } as React.CSSProperties}>
      <div className={styles.cardNebula} style={{ background: color }} />
      <span className={styles.cardEmojiMain} aria-hidden="true">{main}</span>
      {secondary?.map((emoji, i) => (
        <span 
          key={i} 
          className={`${styles.cardEmojiSecondary} ${styles[`pos${i}`]}`} 
          aria-hidden="true"
        >
          {emoji}
        </span>
      ))}
    </div>
  )
}

function QuizArt() {
  return <EnhancedCardArt main="🧠" secondary={['❓', '⚡']} color="#4facfe" bg="#0d0d2b" />
}

function InvasoresArt() {
  return <EnhancedCardArt main="👾" secondary={['🛸', '💥']} color="#00e5ff" bg="#050515" />
}

function DuelArt() {
  return <EnhancedCardArt main="⚔️" secondary={['🔥', '🏆']} color="#b5179e" bg="#120520" />
}

function HuntArt() {
  return <EnhancedCardArt main="🔭" secondary={['🪐', '🔍']} color="#06d6a0" bg="#0a0a1a" />
}

function MemoryArt() {
  return <EnhancedCardArt main="🎴" secondary={['🧬', '💎']} color="#ef476f" bg="#0f172a" />
}

function ProgressArt() {
  return (
    <div className={styles.journeyGallery}>
      <div className={styles.nebulaCloud} />

      <div className={styles.mainGroup}>
        <div className={styles.artSun}>
          <span className={styles.emojiIcon} aria-hidden="true">☀️</span>
        </div>
        <div className={styles.artEarth}>
          <span className={styles.emojiIcon} aria-hidden="true">🌍</span>
        </div>
        <div className={styles.artMoon}>
          <span className={styles.emojiIcon} aria-hidden="true">🌙</span>
        </div>
        <div className={styles.artRocket}>
          <span className={styles.emojiIcon} aria-hidden="true">🚀</span>
        </div>
        <div className={styles.artStars}>
          <span className={`${styles.emojiIcon} ${styles.star1}`} aria-hidden="true">⭐</span>
          <span className={`${styles.emojiIcon} ${styles.star2}`} aria-hidden="true">✨</span>
          <span className={`${styles.emojiIcon} ${styles.star3}`} aria-hidden="true">⭐</span>
        </div>
      </div>
    </div>
  )
}

function JourneyArt() {
  return <EnhancedCardArt main="📚" secondary={['🗺️', '✨']} color="#f7c762" bg="#0d1b3e" />
}

// ─── Activities ──────────────────────────────────────────────────
const ACTIVITIES = [
  {
    id: 'journey',
    title: 'Jornada Galáctica',
    sub: 'Trilha principal',
    difficulty: 'Fácil',
    path: '/capitulos',
    color: '#f7c762',
    Art: JourneyArt,
    locked: false,
    type: 'aula'
  },
  {
    id: 'quiz',
    title: 'Quiz Intergaláctico',
    sub: 'Missão mental',
    difficulty: 'Médio',
    path: '/quiz?level=1',
    color: '#4facfe',
    Art: QuizArt,
    locked: false,
    type: 'jogo'
  },
  {
    id: 'invasores',
    title: 'Invasores do Saber',
    sub: 'Ação espacial',
    difficulty: 'Médio',
    path: '/jogos/invasores',
    color: '#00e5ff',
    Art: InvasoresArt,
    locked: false,
    type: 'jogo'
  },
  {
    id: 'duel',
    title: 'Arena de Duelos',
    sub: 'Arena Pvp',
    difficulty: 'Difícil',
    path: '/quiz?mode=challenge',
    color: '#b5179e',
    Art: DuelArt,
    locked: false,
    type: 'jogo'
  },
  {
    id: 'hunt',
    title: 'Caça-planetas',
    sub: 'Busca estelar',
    difficulty: 'Difícil',
    path: '#',
    color: '#06d6a0',
    Art: HuntArt,
    locked: true,
    type: 'jogo'
  },
  {
    id: 'memory',
    title: 'Memória Astral',
    sub: 'Memória lúdica',
    difficulty: 'Fácil',
    path: '#',
    color: '#ef476f',
    Art: MemoryArt,
    locked: true,
    type: 'jogo',
    unlocked_challenge: 0
  }
]

interface Activity {
  id: string
  title: string
  sub: string
  difficulty: 'Fácil' | 'Médio' | 'Difícil'
  path: string
  color: string
  Art: React.FC
  locked: boolean
  type: 'aula' | 'jogo'
  unlocked_challenge?: number
}

interface ExtendedActivity extends Activity {
  current: number
  target: number
  label: string
  percent: number
  status: 'open' | 'progression_locked' | 'dev_locked'
}

const CATEGORIES = ['Tudo', 'Aulas', 'Jogos'] as const
type CategoryType = typeof CATEGORIES[number]
const DIFF_COLOR = { Fácil: '#06d6a0', Médio: '#FFD166', Difícil: '#ef476f' }

export default function GamesPage() {
  const { session, user } = useAuth()
  const { 
    playerData, 
    playerStats, 
    gameStats, 
    progress: chapterProgress, 
    saveExploration
  } = usePlayer()
  
  const { playBGMusic, playSFX } = useSound()
  const [showAuth, setShowAuth] = useState(false)
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const { isGlobalLoading } = useNarrationSequence()
  const [activeCategory, setActiveCategory] = useState<CategoryType>('Tudo')
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showLockModal, setShowLockModal] = useState<{ show: boolean, title: string, message: string }>({ show: false, title: '', message: '' })

  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  const closeMenu = () => setIsMenuOpen(false)


  useEffect(() => {
    if (isGlobalLoading) return
    playBGMusic()
  }, [playBGMusic, isGlobalLoading])

  useEffect(() => {
    fetchTopPlayers()
  }, [])

  useEffect(() => {
    if (!user?.id) return

    // 1. Carga inicial do contador
    NotificationService.countUnread(user.id).then(setUnreadCount)

    // 2. RADAR GALÁCTICO: Escuta notificações em tempo real
    const channel = supabase
      .channel(`notif_radar_${user.id}`)
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` },
        () => NotificationService.countUnread(user.id).then(setUnreadCount)
      )
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'quiz_challenges', filter: `challenged_id=eq.${user.id}` },
        () => NotificationService.countUnread(user.id).then(setUnreadCount)
      )
      .on(
        'postgres_changes' as any,
        { event: '*', scheme: 'public', table: 'quiz_challenges', filter: `challenger_id=eq.${user.id}` },
        () => NotificationService.countUnread(user.id).then(setUnreadCount)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  useEffect(() => {
    fetchTopPlayers()
  }, [])

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const top = e.currentTarget.scrollTop
    setScrolled(top > 60)
  }

  const fetchTopPlayers = async () => {
    try {
      const { data } = await supabase.from('player_global_stats').select('player_id, galactic_xp').order('galactic_xp', { ascending: false }).limit(5)
      if (data) {
        const ids = data.map(d => d.player_id)
        const { data: profiles } = await supabase.from('players').select('id, username, avatar_url').in('id', ids)
        const merged = data.map(d => ({ ...d, ...profiles?.find(p => p.id === d.player_id) }))
        setTopPlayers(merged)
      }
    } catch (e) {
      console.error(e)
    }
  }

  const handleGameClick = (e: React.MouseEvent, item: any) => {
    if (item.status === 'progression_locked') {
      e.preventDefault();
      setShowLockModal({
        show: true,
        title: 'Acesso Restrito, Astronauta!',
        message: `O ${item.title} é um desafio avançado! Para decolar aqui, você precisa completar pelo menos um capítulo na Jornada do Conhecimento primeiro. Estude um pouco e volte aqui!`
      })
      return
    }
    if (item.status === 'dev_locked') {
      e.preventDefault();
      return
    }
    if (!session) { e.preventDefault(); setShowAuth(true) }
  }

  const activitiesProgress: ExtendedActivity[] = useMemo(() => {
    const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253'

    const targets: Record<string, number> = {
      journey: 4,
      quiz: 20, // 5 Níveis * (3 Missões + 1 Revisão)
      invasores: 2500,
      duel: 10
    }

    return ACTIVITIES.map((act) => {
      if (act.locked) return { ...act, percent: 0, label: 'Bloqueado', current: 0, target: 0, status: 'dev_locked' } as ExtendedActivity
      
      let current = 0
      let label = ''

      if (act.id === 'journey') {
        current = chapterProgress.filter(p => p.completed).length
        label = `${current} de ${targets.journey} capítulos`
      } else if (act.id === 'quiz') {
        const stats = gameStats.find(gs => gs.game_id === QUIZ_GAME_ID)
        const challengeData = stats?.metadata?.challenge_data || {}
        
        // Contagem de desafios únicos concluídos
        current = Object.values(challengeData).filter((c: any) => c.completed).length
        label = `${current} de ${targets.quiz} desafios`
      } else if (act.id === 'invasores') {
        const stats = gameStats.find(gs => gs.game_id === 'invasores-do-conhecimento')
        current = Math.floor((stats?.total_score || 0) / 10)
        label = `${current}xp de ${targets.invasores}xp`
      } else if (act.id === 'duel') {
        current = playerStats?.duel_wins || 0
        label = `${current} de ${targets.duel} vitórias`
      }

      const percent = Math.min(100, (current / (targets[act.id] || 1)) * 100)
      
      const hasChapter = chapterProgress.some(p => p.completed)
      let status: 'open' | 'progression_locked' | 'dev_locked' = 'open'
      
      if (act.locked) {
        status = 'dev_locked'
      } else if (act.type === 'jogo' && !hasChapter) {
        status = 'progression_locked'
      }

      return { 
        ...act, 
        current, 
        target: targets[act.id] || 1, 
        label, 
        percent, 
        status, 
        locked: status !== 'open' 
      } as ExtendedActivity
    })
  }, [gameStats, chapterProgress, playerStats])

  const level = calcLevel(playerStats?.galactic_xp)
  const title = getLevelTitle(level)
  const progress = calcLevelProgress(playerStats?.galactic_xp)

  return (
    <div className={styles.page} onScroll={handleScroll}>
      <StarField />
      <div className={styles.nebula1} />
      <div className={styles.nebula2} />

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''} ${isMenuOpen ? styles.navbarMenuOpen : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo} onClick={() => { playSFX('click'); closeMenu(); }}>
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
                  onClick={() => { playSFX('click'); setShowNotifications(!showNotifications); }}
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

            <button className={styles.menuToggle} onClick={() => { playSFX('click'); toggleMenu(); }} aria-label="Menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <button className={`${styles.navLink} ${activeCategory === 'Aulas' ? styles.navLinkActive : ''}`} onClick={() => { playSFX('click'); setActiveCategory('Aulas'); closeMenu(); }}>AULAS</button>
            <button className={`${styles.navLink} ${activeCategory === 'Jogos' ? styles.navLinkActive : ''}`} onClick={() => { playSFX('click'); setActiveCategory('Jogos'); closeMenu(); }}>JOGOS</button>
            <Link to="/ranking" className={styles.navLink} onClick={() => { playSFX('click'); closeMenu(); }}>RANKING</Link>
            <Link to="/trofeus" className={styles.navLink} onClick={() => { playSFX('click'); closeMenu(); }}>TROFÉUS</Link>

            {session ? (
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
            ) : (
              <Link to="/login" className={styles.loginBtn} onClick={() => playSFX('click')}>ENTRAR</Link>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div className={styles.subWrapper}>
            <p className={styles.pageSub}>
              Bem-vindo ao <span className={styles.theo}>Théo</span>
              <span className={styles.noMundo}> no Mundo</span>
              <span className={styles.daLuaNav}> da Lua <span className={styles.moonEmojiNav}>🌙</span></span>
              <br />
              Se prepara aí… porque a gente vai decolar numa viagem pelo espaço cheia de descobertas, missões e muita coisa massa pra explorar!  👨‍🚀🚀
            </p>
          </div>
        </header>

        <FeaturedBanner
          badgeText="MISSÃO PRINCIPAL"
          BadgeIcon={Star}
          title="Jornada do Conhecimento"
          subtitle="Embarque na aventura de Théo e descubra os segredos do universo em 4 capítulos épicos!"
          ctaText="IR PARA AULA"
          ctaPath="/capitulos"
          CtaIcon={GraduationCap}
          Art={ProgressArt}
          onCtaClick={() => playSFX('click')}
        >
          <div className={styles.bannerProgression}>
            <div className={styles.progressionHeader}>
              <span className={styles.progressionCount}>
                {(activitiesProgress.find(a => a.id === 'journey') as any)?.label || '0 de 4 capítulos'}
              </span>
            </div>
            <div className={styles.progressionFooter}>
              <div className={styles.progressionBarWrap}>
                <div className={styles.progressionBar}>
                  <div 
                    className={styles.progressionFill} 
                    style={{ width: `${(activitiesProgress.find(a => a.id === 'journey') as any)?.percent || 0}%` }} 
                  />
                </div>
              </div>
            </div>
          </div>
        </FeaturedBanner>

        {session && (
          <section className={styles.playerSection}>
            <div className={styles.playerWidget}>
              <div className={styles.playerLeft}>
                <div className={styles.playerAvatarWrap}>
                  {playerData?.avatar_url ? <img src={playerData.avatar_url} className={styles.playerAvatar} /> : <div className={styles.playerAvatarFallback}>{playerData?.username?.charAt(0) || '?'}</div>}
                  <div className={styles.playerOnline} />
                </div>
                <div className={styles.playerInfo}>
                  <div className={styles.nameRow}>
                    <span className={styles.playerName}>{playerData?.username || 'Astronauta'}</span>
                    <span className={styles.playerRank}>{title}</span>
                  </div>
                  <span className={styles.playerLevelLabel}>NÍVEL {level}</span>
                  <div className={styles.xpBarWrap}>
                    <div className={styles.xpBar}><div className={styles.xpFill} style={{ width: `${progress}%` }} /></div>
                    <span className={styles.xpLabel}>{progress}%</span>
                  </div>
                </div>
              </div>
              <div className={styles.playerStats}>
                <div className={styles.playerStat}><span className={styles.playerStatNum}>{playerStats?.total_trophies || 0}</span><span className={styles.playerStatLabel}>Troféus</span></div>
                <div className={styles.playerStat}><span className={styles.playerStatNum}>{playerStats?.galactic_xp || 0}</span><span className={styles.playerStatLabel}>Galactic XP</span></div>
              </div>
              <Link to="/perfil" className={styles.playerProfileBtn} onClick={() => playSFX('click')}>Ver Perfil <ChevronRight size={15} /></Link>
            </div>
          </section>
        )}

        <div className={styles.categoriesRow}>
          <h2 className={styles.sectionTitle}><LayoutGrid size={18} /> Missões Disponíveis</h2>
          <div className={styles.categoryPills}>
            {CATEGORIES.map(cat => (
              <button 
                key={cat} 
                className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`} 
                onClick={() => { playSFX('click'); setActiveCategory(cat); }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.gamesGrid}>
            {activitiesProgress
              .filter(act => activeCategory === 'Tudo' || (activeCategory === 'Aulas' ? act.type === 'aula' : act.type === 'jogo'))
              .map((item, idx) => (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.gameCard} ${item.locked ? styles.gameCardLocked : ''}`}
                onClick={(e) => handleGameClick(e, item)}
                style={{ '--c': item.color, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
              >
                <div className={styles.gameCardImage}>
                  <item.Art />
                  {item.status === 'dev_locked' && (
                    <div className={styles.lockOverlay}>
                      <Lock size={20} />
                      <span>Em breve</span>
                    </div>
                  )}
                  {item.status === 'progression_locked' && (
                    <div className={styles.lockOverlay} style={{ backgroundColor: 'rgba(255, 61, 113, 0.4)' }}>
                      <Lock size={20} />
                      <span>Estude Primeiro</span>
                    </div>
                  )}
                </div>
                <div className={styles.gameCardBody}>
                  <div className={styles.gameCardMeta}>
                    <span className={styles.gameCardSub}>{item.type === 'aula' ? 'Caminho do Conhecimento' : item.sub}</span>
                    <span className={styles.gameCardDiff} style={{ color: DIFF_COLOR[item.difficulty as keyof typeof DIFF_COLOR] }}>{item.difficulty}</span>
                  </div>
                  <h3 className={styles.gameCardTitle}>{item.title}</h3>
                  
                  {session && item.status === 'open' && (
                    <div className={styles.gameCardProgress}>
                      <div className={styles.progressHeader}>
                        <span className={styles.progressLabel}>{(item as any).label}</span>
                        <span className={styles.progressPercent}>{Math.round((item as any).percent)}%</span>
                      </div>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill} 
                          style={{ 
                            width: `${(item as any).percent}%`,
                            backgroundColor: item.color 
                          }} 
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div className={styles.gameCardAccent} />
              </Link>
            ))}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}><Trophy size={16} className={styles.sideCardIcon} /><h3>Top Exploradores</h3><Link to="/ranking" className={styles.sideCardLink}>Ver Ranking</Link></div>
              <div className={styles.miniRanking}>
                {topPlayers.map((p, i) => (
                  <div key={p.player_id} className={styles.miniRankRow}>
                    <span className={styles.miniRankPos}>{i + 1}</span>
                    <div className={styles.miniRankAvatar}>{p.avatar_url ? <img src={p.avatar_url} /> : <span>{p.username?.charAt(0) || '?'}</span>}</div>
                    <span className={styles.miniRankName}>{p.username || 'Explorador'}</span>
                    <span className={styles.miniRankXp}>{p.galactic_xp} XP</span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.sideCard}>
              <div className={styles.sideCardHeader}><Star size={15} className={styles.sideCardIcon} /><h3>Atalhos</h3></div>
              <div className={styles.quickLinks}>
                <Link to="/ranking" className={styles.quickLink}><Trophy size={18} /> Ranking Galáctico <ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
                <Link to="/trofeus" className={styles.quickLink}><Medal size={18} /> Sala de Troféus <ChevronRight size={14} className={styles.quickLinkArrow} /></Link>
                <Link to="/capitulos" className={styles.quickLink}><BookOpen size={15} /> Capítulos <ChevronRight size={13} className={styles.quickLinkArrow} /></Link>
              </div>
            </div>

            <div className={`${styles.sideCard} ${styles.shareCard}`}>
              <div className={styles.sideCardHeader}>
                <div className={styles.xpBadge}>+50 XP</div>
                <h3>Convide Amigos</h3>
              </div>
              <p className={styles.shareText}>Ajude o Théo a levar o conhecimento para mais crianças!</p>
              <ShareButton 
                title="Venha explorar o Universo com o Théo!"
                text="O Théo no Mundo da Lua é incrível para aprender sobre o espaço! 🚀🌕"
                onShare={() => saveExploration('share-platform-bonus', 50)}
              />
            </div>
          </aside>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Théo no Mundo da Lua</span>
        <span className={styles.footerStatus}><div className={styles.statusDot} /> Sistema Estável</span>
      </footer>

      {showLockModal.show && (
        <div className={styles.modalOverlay} onClick={() => setShowLockModal({ ...showLockModal, show: false })}>
          <div className={styles.lockModal} onClick={e => e.stopPropagation()}>
            <div className={styles.lockModalIcon}><Lock size={40} /></div>
            <h2>{showLockModal.title}</h2>
            <p>{showLockModal.message}</p>
            <button 
              className={styles.lockModalBtn} 
              onClick={() => setShowLockModal({ ...showLockModal, show: false })}
            >
              ENTENDIDO, CAPITÃO!
            </button>
          </div>
        </div>
      )}

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
