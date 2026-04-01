import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { FaRocket, FaUserAstronaut, FaBell, FaBars, FaUserEdit } from 'react-icons/fa'
import StarField from '@/components/StarField'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import AuthModal from '@/components/AuthModal'
import { supabase } from '@/lib/supabase'
import styles from './GamesPage.module.css'

export default function GamesPage() {
  const { session, user } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [playerData, setPlayerData] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [leaderboardData, setLeaderboardData] = useState<any[]>([])

  // Notificações
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { setIsMuted } = useSound()

  // Silenciar página ao entrar
  useEffect(() => {
    setIsMuted(true)
    return () => setIsMuted(false)
  }, [setIsMuted])

  useEffect(() => {
    fetchRanking()
  }, [])

  useEffect(() => {
    if (user?.id) {
      fetchPlayerData()
      fetchNotifications()
      
      const interval = setInterval(fetchNotifications, 15000) // Poll notifications every 15s
      return () => clearInterval(interval)
    } else {
      setPlayerData(null)
      setPlayerStats(null)
      setNotifications([])
    }
  }, [user])

  const fetchPlayerData = async () => {
    if (!user?.id) return
    try {
      const { data: profile } = await supabase.from('players').select('*').eq('id', user.id).single()
      if (profile) setPlayerData(profile)

      const { data: stats } = await supabase.from('player_global_stats').select('*').eq('player_id', user.id).single()
      if (stats) setPlayerStats(stats)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
    }
  }

  const fetchNotifications = async () => {
    if (!user?.id) return
    try {
      // PENDENTES para mim
      const { data: pending } = await supabase
        .from('quiz_challenges')
        .select('*')
        .eq('challenged_id', user.id)
        .eq('status', 'pending')
      
      // RESULTADOS que não vi
      const { data: results } = await supabase
        .from('quiz_challenges')
        .select('*')
        .eq('challenger_id', user.id)
        .eq('status', 'completed')
        .eq('challenger_seen', false)

      const all = [...(pending || []), ...(results || [])]
      
      if (all.length > 0) {
        const enriched = await Promise.all(all.map(async (n) => {
          const targetId = n.status === 'pending' ? n.challenger_id : n.challenged_id
          const { data: pData } = await supabase.from('players').select('full_name').eq('id', targetId).single()
          return { 
            ...n, 
            opponentName: pData?.full_name || 'Explorador',
            type: n.status === 'pending' ? 'invitation' : 'result'
          }
        }))
        setNotifications(enriched)
        setUnreadCount(enriched.length)
      } else {
        setNotifications([])
        setUnreadCount(0)
      }
    } catch (err) {
      console.error('Erro ao buscar notificações:', err)
    }
  }

  const fetchRanking = async () => {
    try {
      // 1. Busca os TOP 5 em estatísticas globais
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('player_id, galactic_xp, total_trophies')
        .order('galactic_xp', { ascending: false })
        .limit(5)
      
      if (stats && stats.length > 0) {
        // 2. Busca os perfis dos jogadores que estão no Top 5
        const pIds = stats.map(s => s.player_id)
        const { data: profiles } = await supabase
          .from('players')
          .select('id, full_name, username, avatar_url')
          .in('id', pIds)

        // 3. Formata os dados mesclando as duas tabelas
        const formatted = stats.map((item: any, index: number) => {
          const profile = profiles?.find(p => p.id === item.player_id)
          return {
            rank: index + 1,
            name: profile?.full_name || profile?.username || 'Astronauta',
            score: item.galactic_xp || 0,
            medals: item.total_trophies || 0,
            emoji: index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '👨‍🚀',
            avatarUrl: profile?.avatar_url
          }
        })
        setLeaderboardData(formatted)
      } else {
        setLeaderboardData([])
      }
    } catch (err) {
      console.error('Erro ao buscar ranking:', err)
      // Ranking carregado
    }
  }

  const calculateLevel = (xp: number = 0) => {
    const level = Math.floor(xp / 1000) + 1
    const progress = (xp % 1000) / 10
    return { level, progress }
  }

  const { level, progress } = calculateLevel(playerStats?.galactic_xp)

  const games = [
    { 
      id: 'quiz', 
      title: 'QUIZ INTERGALÁCTICO', 
      icon: '🚀', 
      category: 'MISSAO MENTAL',
      difficulty: 'Médio',
      howToPlay: 'Responda as perguntas astronômicas para carregar os propulsores da sua nave.',
      path: '/quiz?level=1', 
      featured: true, 
      color: '#4facfe',
      cover: '/game-thumbnails/quiz_solar_cover.jpg',
      stats: { progress: 85, best: '98%', achievements: 12 }
    },
    { 
      id: 'duel', 
      title: 'ARENA DE DUELOS', 
      icon: '⚔️', 
      category: 'ARENA PVP',
      difficulty: 'Difícil',
      howToPlay: 'Desafie um amigo em tempo real e prove quem é o mestre do universo!',
      path: '/quiz?mode=challenge',
      cover: '/game-thumbnails/constellation_match_cover.png',
      stats: { progress: 40, best: '15 Vitórias', achievements: 5 }
    },
    { 
      id: 'invasores', 
      title: 'INVASORES DO CONHECIMENTO', 
      icon: '🛸', 
      category: 'AÇÃO ESPACIAL',
      difficulty: 'Médio',
      howToPlay: 'Defenda a galáxia destruindo aliens e coletando respostas corretas!',
      path: '/jogos/invasores', 
      featured: false, 
      color: '#00e5ff',
      cover: '/game-thumbnails/ship.png',
      stats: { progress: 0, best: '---', achievements: 0 }
    },
    { 
      id: 'hunt', 
      title: 'CAÇA-PLANETAS', 
      icon: '🔭', 
      category: 'BUSCA ESTELAR',
      difficulty: 'Difícil',
      howToPlay: 'Use seu telescópio para encontrar planetas escondidos nas coordenadas certas.',
      path: '#', 
      featured: false, 
      color: '#06d6a0',
      cover: '/game-thumbnails/planet_hunt_cover.png',
      stats: { progress: 0, best: '---', achievements: 0 }
    },
    { 
      id: 'memory', 
      title: 'MEMÓRIA ASTRAL', 
      icon: '🧩', 
      category: 'MEMÓRIA LÚDICA',
      difficulty: 'Fácil',
      howToPlay: 'Combine pares de astros e sistemas solares antes que o tempo se esgote.',
      path: '#', 
      featured: false, 
      color: '#ef476f',
      cover: '/game-thumbnails/memory_game_cover.png',
      stats: { progress: 0, best: '---', achievements: 0 }
    },
    { 
      id: 'orbit', 
      title: 'DESAFIO ORBITAL', 
      icon: '🪐', 
      category: 'FÍSICA CÓSMICA',
      difficulty: 'Médio',
      howToPlay: 'Mantenha os planetas em suas órbitas para não causar um caos galáctico!',
      path: '#', 
      featured: false, 
      color: '#b5179e',
      cover: '/game-thumbnails/orbit.png',
      stats: { progress: 0, best: '---', achievements: 0 }
    },
    { 
      id: 'hidden', 
      title: 'NAVE OCULTA', 
      icon: '🛸', 
      category: 'BUSCA ESPACIAL',
      difficulty: 'Médio',
      howToPlay: 'Use o sonar para detectar naves alienígenas invisíveis através da poeira estelar.',
      path: '#', 
      featured: false, 
      color: '#7209b7',
      cover: '/game-thumbnails/hidden.png',
      stats: { progress: 0, best: '---', achievements: 0 }
    }
  ];

  const handleGameClick = (e: React.MouseEvent, path: string) => {
    if (path === '#') {
      e.preventDefault()
      return
    }
    if (!session) {
      e.preventDefault()
      setShowAuth(true)
    }
  }

  const markAsSeen = async (id: string) => {
    await supabase.from('quiz_challenges').update({ challenger_seen: true }).eq('id', id)
    fetchNotifications()
  }

  const [activeCategory, setActiveCategory] = useState('Todos')

  const categories = ['Todos', 'Quiz', 'Ação', 'Busca', 'Puzzle']

  const filteredGames = useMemo(() => {
    if (activeCategory === 'Todos') return games
    return games.filter(g => g.category.includes(activeCategory.toUpperCase()))
  }, [activeCategory, games])

  const featuredGame = useMemo(() => games.find(g => g.featured) || games[0], [games])

  return (
    <div className={styles.page}>
      <StarField />
      
      {showAuth && (
        <AuthModal 
          onClose={() => setShowAuth(false)} 
          onSuccess={() => {
            setShowAuth(false)
            fetchPlayerData()
          }} 
        />
      )}

      <div className={styles.container}>
        <header className={styles.hud}>
          <div className={styles.hudLeft}>
            <Link to="/capitulos" className={styles.backBtn}>
              <span className={styles.backIcon}>‹</span>
            </Link>
            <div className={styles.headerInfo}>
              <h1 className={styles.mainTitle}>CENTRAL DE JOGOS</h1>
            </div>
          </div>

          <div className={styles.hudRight}>
            {session ? (
              <div className={styles.hudRightContent}>
                <div className={`${styles.notificationsArea} ${styles.hideMobile}`}>
                  <button className={styles.notifBell}>
                    <FaBell />
                    {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
                  </button>
                </div>

                <div className={`${styles.divider} ${styles.hideMobile}`}></div>

                <div className={styles.playerDashboard}>
                  <div className={`${styles.playerDetails} ${styles.hideMobile}`}>
                    <div className={styles.playerMain}>
                      <span className={styles.playerName}>{playerData?.full_name || playerData?.username || 'Explorador'}</span>
                      <div className={styles.playerBadges}>
                        <span className={styles.levelBadge}>LVL {level}</span>
                      </div>
                    </div>
                    <div className={styles.xpProgress}>
                      <div className={styles.xpBar}>
                        <div className={styles.xpInner} style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  </div>

                  <Link to="/perfil" className={`${styles.avatarFrame} ${styles.hideMobile}`}>
                    <div className={styles.avatarInner}>
                      {playerData?.avatar_url ? <img src={playerData.avatar_url} alt="" /> : <FaUserAstronaut />}
                    </div>
                    <div className={styles.onlineStatus} />
                  </Link>

                  <button className={styles.mobileMenuBtn} onClick={() => setShowMobileMenu(true)}>
                    <FaBars />
                  </button>
                </div>
              </div>
            ) : (
              <button className={styles.loginBtn} onClick={() => setShowAuth(true)}>
                ENTRAR <FaRocket />
              </button>
            )}
          </div>
        </header>

        {/* FEATURED BANNER */}
        <section className={styles.heroSection}>
          <Link 
            to={featuredGame.path} 
            className={styles.heroCard}
            onClick={(e) => handleGameClick(e, featuredGame.path)}
          >
            <img src={featuredGame.cover} alt="" className={styles.heroImg} />
            <div className={styles.heroOverlay}>
              <div className={styles.heroContent}>
                <span className={styles.heroTag}>EM DESTAQUE</span>
                <h2>{featuredGame.title}</h2>
                <p>Domine o sistema solar neste desafio épico!</p>
                <div className={styles.playButton}>JOGAR AGORA ✨</div>
              </div>
            </div>
          </Link>
        </section>

        {/* CATEGORIES */}
        <section className={styles.categoryBar}>
          {categories.map(cat => (
            <button
              key={cat}
              className={`${styles.categoryPill} ${activeCategory === cat ? styles.activeCat : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </section>

        <main className={styles.layout}>
          <section className={styles.gameCenter}>
            <div className={styles.grid}>
              {filteredGames.map((game, idx) => (
                <Link
                  key={game.id}
                  to={game.path}
                  className={`${styles.simpleCard} ${game.path === '#' ? styles.lockedCard : ''}`}
                  onClick={(e) => handleGameClick(e, game.path)}
                  style={{ animationDelay: `${idx * 0.05}s` } as any}
                >
                  <div className={styles.cardImageArea}>
                    <img src={game.cover} alt="" className={styles.cardArt} />
                    {game.path === '#' && (
                      <div className={styles.lockOverlay}>
                        <span className={styles.comingSoon}>EM BREVE</span>
                      </div>
                    )}
                  </div>
                  <div className={styles.cardInfo}>
                    <div className={styles.cardMainInfo}>
                      <h3>{game.title}</h3>
                      <span className={styles.cardCat}>{game.category}</span>
                    </div>
                    <div className={styles.cardStats}>
                      <span className={styles.cardScore}>🏆 {game.stats.achievements}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* TRENDING / RANKING MINI */}
          <section className={styles.trendingSection}>
            <div className={styles.sectionHeading}>
              <h3>RANKING GLOBAL</h3>
              <p>Top exploradores</p>
            </div>
            <div className={styles.miniRanking}>
              {leaderboardData.slice(0, 3).map((item, i) => (
                <div key={i} className={styles.miniRankItem}>
                  <div className={styles.miniRankPos}>{item.rank}</div>
                  <img src={item.avatarUrl} className={styles.miniRankAvatar} alt="" />
                  <span className={styles.miniRankName}>{item.name.split(' ')[0]}</span>
                  <span className={styles.miniRankScore}>{item.score}</span>
                </div>
              ))}
            </div>
          </section>
        </main>

        {/* Mobile Drawer Overlay */}
        {showMobileMenu && (
          <div className={styles.drawerOverlay} onClick={() => setShowMobileMenu(false)}>
            <div className={styles.drawerContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.closeDrawer} onClick={() => setShowMobileMenu(false)}>✕</button>
              
              <div className={styles.drawerHeader}>
                <div className={styles.drawerAvatar}>
                  {playerData?.avatar_url ? <img src={playerData.avatar_url} alt="" /> : <FaUserAstronaut />}
                </div>
                <h3>{playerData?.full_name || playerData?.username || 'Explorador'}</h3>
                <span className={styles.drawerLevel}>NÍVEL {level}</span>
              </div>

              <div className={styles.drawerStats}>
                <div className={styles.drawerXpInfo}>
                  <span>XP ATUAL</span>
                  <span>{playerStats?.galactic_xp || 0} / {level * 1000}</span>
                </div>
                <div className={styles.drawerXpBar}>
                  <div className={styles.drawerXpInner} style={{ width: `${progress}%` }} />
                </div>
              </div>

              <nav className={styles.drawerNav}>
                <div className={styles.drawerNotifTitle}>
                  <FaBell /> ALERTAS ESPACIAIS ({unreadCount})
                </div>
                <div className={styles.notifList}>
                  {notifications.length === 0 ? (
                    <p className={styles.emptyNotifs}>Silêncio profundo no espaço...</p>
                  ) : (
                    notifications.map(n => (
                      <div key={n.id} className={styles.notifItem}>
                        <p>{n.opponentName} {n.type === 'invitation' ? 'te desafiou!' : 'terminou o duelo!'}</p>
                        <Link to="/quiz?level=1" className={styles.notifAction} onClick={() => { n.type === 'result' && markAsSeen(n.id); setShowMobileMenu(false); }}>VER</Link>
                      </div>
                    ))
                  )}
                </div>
                <div className={styles.drawerDivider} />
                <Link to="/perfil" className={styles.drawerLink} onClick={() => setShowMobileMenu(false)}>
                  <FaUserEdit /> PERFIL
                </Link>
                <button className={styles.logoutBtn} onClick={() => { supabase.auth.signOut(); setShowMobileMenu(false); }}>
                  SAIR
                </button>
              </nav>
            </div>
          </div>
        )}

        <footer className={styles.bottomBar}>
          <div>© 2026 MISSÃO LUNAR · CENTRAL DE JOGOS</div>
          <div className={styles.status}><span className={styles.dot} /> LINK OPERACIONAL</div>
        </footer>
      </div>
    </div>
  )
}
