import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Star, Zap, Medal, ArrowLeft, Crown } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { calcLevel, getLevelTitle } from '@/utils/playerUtils'
import { useAuth } from '@/context/AuthContext'
import StarField from '@/components/StarField'
import styles from './RankingPage.module.css'

// ─── Types ───────────────────────────────────────────────────────
interface RankedPlayer {
  rank:      number
  playerId:  string
  name:      string
  username:  string
  avatarUrl: string | null
  xp:        number
  level:     number
  levelTitle: string
  trophies:  number
  isCurrentUser: boolean
}

type FilterKey = 'xp' | 'trophies'

// ─── Helpers ─────────────────────────────────────────────────────
const calcProgress = (xp = 0) => (xp % 1000) / 10

const PODIUM_COLORS = ['#FFD166', '#C0C0C0', '#CD7F32']
const PODIUM_LABELS = ['🥇', '🥈', '🥉']

// ─── Component ───────────────────────────────────────────────────
export default function RankingPage() {
  const { user } = useAuth()
  const [players, setPlayers]   = useState<RankedPlayer[]>([])
  const [loading, setLoading]   = useState(true)
  const [filter, setFilter]     = useState<FilterKey>('xp')
  const [userRank, setUserRank] = useState<RankedPlayer | null>(null)

  useEffect(() => { fetchRanking() }, [filter])

  const fetchRanking = async () => {
    setLoading(true)
    try {
      const orderCol = filter === 'xp' ? 'galactic_xp' : 'total_trophies'

      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('player_id, galactic_xp, total_trophies')
        .order(orderCol, { ascending: false })
        .limit(50)

      if (!stats || stats.length === 0) { setPlayers([]); setLoading(false); return }

      const ids = stats.map(s => s.player_id)
      const { data: profiles } = await supabase
        .from('players')
        .select('id, full_name, username, avatar_url')
        .in('id', ids)

      const ranked: RankedPlayer[] = stats.map((s, i) => {
        const p = profiles?.find(p => p.id === s.player_id)
        const lvl = calcLevel(s.galactic_xp)
        return {
          rank:          i + 1,
          playerId:      s.player_id,
          name:          p?.full_name || p?.username || 'Astronauta',
          username:      p?.username  || '',
          avatarUrl:     p?.avatar_url || null,
          xp:            s.galactic_xp    || 0,
          level:         lvl,
          levelTitle:    getLevelTitle(lvl),
          trophies:      s.total_trophies || 0,
          isCurrentUser: !!user && s.player_id === user.id,
        }
      })

      setPlayers(ranked)
      setUserRank(ranked.find(p => p.isCurrentUser) ?? null)
    } catch (err) {
      console.error('Ranking fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  const podium = players.slice(0, 3)
  const rest   = players.slice(3)

  return (
    <div className={styles.page}>
      <StarField />

      {/* Nebulae */}
      <div className={styles.nebula1} aria-hidden="true" />
      <div className={styles.nebula2} aria-hidden="true" />

      {/* ── NAV ───────────────────────────────────────────── */}
      <header className={styles.nav}>
        <Link to="/jogos" className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>Estação Espacial</span>
        </Link>
        <div className={styles.navTitle}>
          <Trophy size={20} className={styles.navIcon} />
          <span>Ranking Galáctico</span>
        </div>
        <div style={{ width: 140 }} /> {/* spacer */}
      </header>

      <div className={styles.content}>

        {/* ── HERO ──────────────────────────────────────── */}
        <div className={styles.hero}>
          <div className={styles.heroBadge}>
            <Crown size={14} />
            <span>Hall da Fama</span>
          </div>
          <h1 className={styles.heroTitle}>
            Ranking<br /><span>Galáctico</span>
          </h1>
          <p className={styles.heroSub}>
            Os melhores exploradores do cosmos. Quem vai chegar ao topo?
          </p>
        </div>

        {/* ── FILTERS ───────────────────────────────────── */}
        <div className={styles.filters}>
          {(['xp', 'trophies'] as FilterKey[]).map(f => (
            <button
              key={f}
              className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
              onClick={() => setFilter(f)}
            >
              {f === 'xp'      ? <><Zap    size={14} /> XP Galáctico</>   : null}
              {f === 'trophies' ? <><Medal  size={14} /> Troféus</>         : null}
            </button>
          ))}
        </div>

        {loading ? (
          <div className={styles.loadingWrap}>
            <div className={styles.loadingSpinner} />
            <p>Calculando rankings…</p>
          </div>
        ) : players.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyIcon}>🌌</p>
            <p>Nenhum explorador encontrado ainda.</p>
            <p className={styles.emptyHint}>Jogue para aparecer aqui!</p>
          </div>
        ) : (
          <>
            {/* ── PÓDIO ─────────────────────────────────── */}
            {podium.length >= 1 && (
              <div className={styles.podium}>
                {/* Reorder para visualização: 2º, 1º, 3º */}
                {[podium[1], podium[0], podium[2]].filter(Boolean).map((p, visualIdx) => {
                  const realIdx = visualIdx === 0 ? 1 : visualIdx === 1 ? 0 : 2
                  const isFirst = realIdx === 0
                  return (
                    <div
                      key={p.playerId}
                      className={`${styles.podiumItem} ${isFirst ? styles.podiumFirst : ''} ${p.isCurrentUser ? styles.podiumMe : ''}`}
                      style={{ '--pod-color': PODIUM_COLORS[realIdx] } as React.CSSProperties}
                    >
                      {isFirst && <div className={styles.crownIcon}><Crown size={22} /></div>}
                      <div className={styles.podiumAvatar}>
                        {p.avatarUrl
                          ? <img src={p.avatarUrl} alt={p.name} />
                          : <span>{p.name.charAt(0).toUpperCase()}</span>
                        }
                        <div className={styles.podiumBadge}>{PODIUM_LABELS[realIdx]}</div>
                      </div>
                      <p className={styles.podiumName}>
                        {p.name.split(' ')[0]}
                        {p.isCurrentUser && <span className={styles.youTag}>você</span>}
                      </p>
                      <p className={styles.podiumLevel}><span className={styles.accentTit}>{p.levelTitle}</span> • NIV. {p.level}</p>
                      <div className={styles.podiumScore}>
                        {filter === 'xp'
                          ? <><Zap  size={12} /> {p.xp.toLocaleString()} XP</>
                          : <><Medal size={12} /> {p.trophies} troféus</>
                        }
                      </div>
                      <div
                        className={styles.podiumBar}
                        style={{ height: `${60 + (realIdx === 0 ? 80 : 40)}px` }}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            {/* ── LISTA (4º em diante) ───────────────────── */}
            {rest.length > 0 && (
              <div className={styles.listWrapper}>
                <div className={styles.list}>
                  {rest.map((p, idx) => (
                    <div
                      key={p.playerId}
                      className={`${styles.listRow} ${p.isCurrentUser ? styles.listRowMe : ''}`}
                      style={{ animationDelay: `${idx * 0.04}s` }}
                    >
                      <span className={styles.listRank}>#{p.rank}</span>

                      <div className={styles.listAvatar}>
                        {p.avatarUrl
                          ? <img src={p.avatarUrl} alt={p.name} />
                          : <span>{p.name.charAt(0).toUpperCase()}</span>
                        }
                      </div>

                      <div className={styles.listInfo}>
                        <span className={styles.listName}>
                          {p.name.split(' ')[0]}
                          {p.isCurrentUser && <span className={styles.youTag}>você</span>}
                        </span>
                        <span className={styles.listTitle}>{p.levelTitle}</span>
                        <div className={styles.listXpBar}>
                          <div
                            className={styles.listXpFill}
                            style={{ width: `${calcProgress(p.xp)}%` }}
                          />
                        </div>
                      </div>

                      <div className={styles.listStats}>
                        <span className={styles.listLevel}>NIV. {p.level}</span>
                        <span className={styles.listScore}>
                          {filter === 'xp'
                            ? `${p.xp.toLocaleString()} XP`
                            : `${p.trophies} 🏆`
                          }
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── MINHA POSIÇÃO (sticky, se fora do top 50 visível) ── */}
            {userRank && userRank.rank > 3 && (
              <div className={styles.myPositionCard}>
                <p className={styles.myPositionLabel}>
                  <Star size={14} /> Sua posição
                </p>
                <div className={`${styles.listRow} ${styles.listRowMe}`} style={{ margin: 0 }}>
                  <span className={styles.listRank}>#{userRank.rank}</span>
                  <div className={styles.listAvatar}>
                    {userRank.avatarUrl
                      ? <img src={userRank.avatarUrl} alt={userRank.name} />
                      : <span>{userRank.name.charAt(0).toUpperCase()}</span>
                    }
                  </div>
                  <div className={styles.listInfo}>
                    <span className={styles.listName}>{userRank.name.split(' ')[0]}</span>
                    <span className={styles.listTitleSmall}>{userRank.levelTitle}</span>
                    <div className={styles.listXpBar}>
                      <div className={styles.listXpFill} style={{ width: `${calcProgress(userRank.xp)}%` }} />
                    </div>
                  </div>
                  <div className={styles.listStats}>
                    <span className={styles.listLevel}>NIV. {userRank.level}</span>
                    <span className={styles.listScore}>
                      {filter === 'xp' ? `${userRank.xp.toLocaleString()} XP` : `${userRank.trophies} 🏆`}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
