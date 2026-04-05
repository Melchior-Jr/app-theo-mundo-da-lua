import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X, LogOut, Trophy, Medal, BookOpen, Lock, ChevronRight, Star, LayoutGrid, Bell } from 'lucide-react'
import { calcLevel, getLevelTitle, calcLevelProgress } from '@/utils/playerUtils'
import StarField from '@/components/StarField'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { supabase } from '@/lib/supabase'
import { NotificationDropdown } from '@/components/NotificationDropdown'
import { NotificationService } from '@/services/notificationService'
import FeaturedBanner from '@/components/FeaturedBanner'
import styles from './GamesPage.module.css'

// ─── SVGs ────────────────────────────────────────────────────────
function QuizArt() {
  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="280" height="160" fill="#0d0d2b" />
      <circle cx="140" cy="80" r="40" fill="rgba(79,172,254,0.1)" stroke="#4facfe" strokeWidth="2" strokeDasharray="4 4" />
      <text x="140" y="95" textAnchor="middle" fontSize="48" fill="#4facfe" fontWeight="900" className={styles.qFloat1}>?</text>
      <text x="80" y="60" textAnchor="middle" fontSize="24" fill="#4facfe" opacity="0.4" fontWeight="900" className={styles.qFloat2}>?</text>
      <text x="200" y="60" textAnchor="middle" fontSize="24" fill="#4facfe" opacity="0.4" fontWeight="900" className={styles.qFloat3}>?</text>
    </svg>
  )
}

function InvasoresArt() {
  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="280" height="160" fill="#050515" />
      <g className={styles.ufoFloat}>
        <ellipse cx="140" cy="60" rx="30" ry="10" fill="#00e5ff" opacity="0.8" />
        <circle cx="140" cy="55" r="12" fill="#00e5ff" opacity="0.4" />
      </g>
      <path d="M 120 130 L 160 130 L 140 100 Z" fill="#ff0055" className={styles.shipFloat} />
      <rect x="138" y="80" width="4" height="20" fill="#00e5ff" opacity="0.6" className={styles.laserBeam} />
    </svg>
  )
}

function DuelArt() {
  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="280" height="160" fill="#120520" />
      <circle cx="140" cy="80" r="50" fill="rgba(181,23,158,0.1)" stroke="#b5179e" strokeWidth="1" />
      <path d="M 80 80 L 120 80" stroke="#ef476f" strokeWidth="4" strokeLinecap="round" className={styles.fighterLeft} />
      <path d="M 160 80 L 200 80" stroke="#4facfe" strokeWidth="4" strokeLinecap="round" className={styles.fighterRight} />
      <g className={styles.vsBurst}>
        <circle cx="140" cy="80" r="15" fill="#f7c762" />
        <text x="140" y="85" textAnchor="middle" fontSize="14" fontWeight="900" fill="#000">VS</text>
      </g>
    </svg>
  )
}

function HuntArt() {
  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="280" height="160" fill="#0a0a1a" />
      <circle cx="140" cy="80" r="30" fill="#f7c762" className={styles.pulseMoon} />
      <path d="M 140 20 L 140 140 M 80 80 L 200 80" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
      <circle cx="140" cy="80" r="60" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
    </svg>
  )
}

function MemoryArt() {
  return (
    <svg viewBox="0 0 280 160" xmlns="http://www.w3.org/2000/svg" className={styles.gameArt}>
      <rect width="280" height="160" fill="#0f172a" />
      <rect x="85" y="45" width="50" height="70" rx="6" fill="rgba(239,71,111,0.15)" stroke="#ef476f" strokeWidth="1.5" />
      <rect x="145" y="45" width="50" height="70" rx="6" fill="rgba(239,71,111,0.05)" stroke="rgba(239,71,111,0.3)" strokeWidth="1" strokeDasharray="3 2" />
      <circle cx="110" cy="80" r="10" fill="#ef476f" opacity="0.8" />
    </svg>
  )
}

function ProgressArt() {
  return (
    <div className={styles.journeyGallery}>
      <div className={styles.nebulaCloud} />
      <div className={styles.starClusterSmall} />

      <div className={styles.mainGroup}>
        <div className={styles.heroPlanetEarth} />
        <div className={styles.heroSaturn} />
        <div className={styles.heroMoon} />
        <div className={styles.heroRocketShip} />
      </div>
    </div>
  )
}

function JourneyArt() {
  return (
    <svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%', height: '100%' }}>
      <defs>
        <radialGradient id="jbg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#0d1b3e" />
          <stop offset="100%" stopColor="#02040a" />
        </radialGradient>
      </defs>
      <rect width="300" height="200" fill="url(#jbg)" />
      <path d="M 30 160 Q 100 60 180 100 Q 240 130 270 60" fill="none" stroke="rgba(139,249,255,0.2)" strokeWidth="1.5" strokeDasharray="5 4" />
      <circle cx="30" cy="160" r="14" fill="#f7c762" />
      <circle cx="150" cy="105" r="14" fill="#4facfe" opacity="0.85" />
      <circle cx="270" cy="60" r="10" fill="#8bf9ff" opacity="0.8" />
    </svg>
  )
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
    type: 'jogo'
  },
]

const CATEGORIES = ['Tudo', 'Aulas', 'Jogos']
const DIFF_COLOR = { Fácil: '#06d6a0', Médio: '#FFD166', Difícil: '#ef476f' }

export default function GamesPage() {
  const { session, user } = useAuth()
  const { setIsMuted } = useSound()
  const [showAuth, setShowAuth] = useState(false)
  const [playerData, setPlayerData] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [topPlayers, setTopPlayers] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState('Tudo')
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)

  const toggleMenu = () => setIsMenuOpen(prev => !prev)
  const closeMenu = () => setIsMenuOpen(false)

  useEffect(() => { setIsMuted(true); return () => setIsMuted(false) }, [setIsMuted])

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
        { event: 'UPDATE', scheme: 'public', table: 'quiz_challenges', filter: `challenger_id=eq.${user.id}` },
        () => NotificationService.countUnread(user.id).then(setUnreadCount)
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) fetchPlayerData()
    else { setPlayerData(null); setPlayerStats(null) }
  }, [user])

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

  const fetchPlayerData = async () => {
    try {
      // Perfil básico
      const { data: profile } = await supabase.from('players').select('*').eq('id', user?.id).single()

      // Estatísticas globais (XP, Score)
      const { data: stats } = await supabase.from('player_global_stats').select('*').eq('player_id', user?.id).single()

      // Contagem REAL de troféus da tabela de conquistas
      const { count: trophyCount } = await supabase
        .from('user_trophies')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)

      // Mesclamos os dados para garantir que o count de troféus seja o real da tabela
      setPlayerData(profile)
      setPlayerStats({
        ...stats,
        total_trophies: trophyCount || 0,
        galactic_xp: stats?.galactic_xp || 0,
        total_score: stats?.total_score || 0
      })
    } catch (e) {
      console.error(e)
    }
  }

  const handleGameClick = (e: React.MouseEvent, item: typeof ACTIVITIES[0]) => {
    if (item.locked) { e.preventDefault(); return }
    if (!session) { e.preventDefault(); setShowAuth(true) }
  }

  const filteredActivities = useMemo(() => {
    if (activeCategory === 'Tudo') return ACTIVITIES
    if (activeCategory === 'Aulas') return ACTIVITIES.filter(a => a.type === 'aula')
    if (activeCategory === 'Jogos') return ACTIVITIES.filter(a => a.type === 'jogo')
    return ACTIVITIES
  }, [activeCategory])

  const level = calcLevel(playerStats?.galactic_xp)
  const title = getLevelTitle(level)
  const progress = calcLevelProgress(playerStats?.galactic_xp)

  return (
    <div className={styles.page} onScroll={handleScroll}>
      <StarField />
      <div className={styles.nebula1} />
      <div className={styles.nebula2} />

      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={styles.navbarContainer}>
          <Link to="/" className={styles.logo} onClick={closeMenu}>
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

            <button className={styles.menuToggle} onClick={toggleMenu} aria-label="Menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

          <div className={`${styles.navLinks} ${isMenuOpen ? styles.menuOpen : ''}`}>
            <Link to="/jogos" className={`${styles.navLink} ${activeCategory === 'Tudo' ? styles.navLinkActive : ''}`} onClick={() => { setActiveCategory('Tudo'); closeMenu(); }}>ESTAÇÃO</Link>
            <button className={`${styles.navLink} ${activeCategory === 'Aulas' ? styles.navLinkActive : ''}`} onClick={() => { setActiveCategory('Aulas'); closeMenu(); }}>AULAS</button>
            <button className={`${styles.navLink} ${activeCategory === 'Jogos' ? styles.navLinkActive : ''}`} onClick={() => { setActiveCategory('Jogos'); closeMenu(); }}>JOGOS</button>
            <Link to="/ranking" className={styles.navLink} onClick={closeMenu}>RANKING</Link>
            <Link to="/trofeus" className={styles.navLink} onClick={closeMenu}>TROFÉUS</Link>

            {session ? (
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
                <Link to="/perfil" className={styles.userCard}>
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
                <button onClick={() => supabase.auth.signOut()} className={styles.logoutBtn} title="Sair"><LogOut size={16} /></button>
              </div>
            ) : (
              <Link to="/login" className={styles.loginBtn}>ENTRAR</Link>
            )}
          </div>
        </div>
      </nav>

      <div className={styles.content}>
        <header className={styles.pageHeader}>
          <div className={styles.titleWrapper}>
            <h1 className={styles.pageTitle}>Estação <span>Espacial</span></h1>
            <div className={styles.scannerLine} />
          </div>

          <div className={styles.subWrapper}>
            <p className={styles.pageSub}>
              Bem-vindo ao seu hub central de comando. Explore o universo através de missões educativas e desafios intergalácticos.
            </p>
          </div>
        </header>

        <FeaturedBanner
          badgeText="MISSÃO PRINCIPAL"
          BadgeIcon={Star}
          title="Jornada do Conhecimento"
          subtitle="Embarque na aventura de Théo e descubra os segredos do universo em 4 capítulos épicos!"
          ctaText="CONTINUAR MISSÃO"
          ctaPath="/capitulos"
          Art={ProgressArt}
        >
          <div className={styles.bannerProgression}>
            <div className={styles.progressionHeader}>
              <span className={styles.progressionCount}>0/4 CAPÍTULOS</span>
            </div>
            <div className={styles.progressionFooter}>
              <div className={styles.progressionBarWrap}>
                <div className={styles.progressionBar}>
                  <div className={styles.progressionFill} style={{ width: '0%' }} />
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
              <Link to="/perfil" className={styles.playerProfileBtn}>Ver Perfil <ChevronRight size={15} /></Link>
            </div>
          </section>
        )}

        <div className={styles.categoriesRow}>
          <h2 className={styles.sectionTitle}><LayoutGrid size={18} /> Missões Disponíveis</h2>
          <div className={styles.categoryPills}>
            {CATEGORIES.map(cat => (
              <button key={cat} className={`${styles.pill} ${activeCategory === cat ? styles.pillActive : ''}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
            ))}
          </div>
        </div>

        <div className={styles.mainLayout}>
          <div className={styles.gamesGrid}>
            {filteredActivities.map((item, idx) => (
              <Link
                key={item.id}
                to={item.path}
                className={`${styles.gameCard} ${item.locked ? styles.gameCardLocked : ''}`}
                onClick={(e) => handleGameClick(e, item)}
                style={{ '--c': item.color, animationDelay: `${idx * 0.06}s` } as React.CSSProperties}
              >
                <div className={styles.gameCardImage}>
                  <item.Art />
                  {item.locked && <div className={styles.lockOverlay}><Lock size={20} /><span>Em breve</span></div>}
                </div>
                <div className={styles.gameCardBody}>
                  <div className={styles.gameCardMeta}>
                    <span className={styles.gameCardSub}>{item.type === 'aula' ? 'Caminho do Conhecimento' : item.sub}</span>
                    <span className={styles.gameCardDiff} style={{ color: DIFF_COLOR[item.difficulty as keyof typeof DIFF_COLOR] }}>{item.difficulty}</span>
                  </div>
                  <h3 className={styles.gameCardTitle}>{item.title}</h3>
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
          </aside>
        </div>
      </div>

      <footer className={styles.footer}>
        <span>© 2026 Théo no Mundo da Lua</span>
        <span className={styles.footerStatus}><div className={styles.statusDot} /> Sistema Estável</span>
      </footer>

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
