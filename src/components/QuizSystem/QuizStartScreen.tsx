import { useState, useEffect, useCallback } from 'react'
import { FaLock, FaRocket, FaTrophy, FaUserFriends, FaMedal, FaStar } from 'react-icons/fa'
import { IoSettings } from 'react-icons/io5'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import StarField from '@/components/StarField'
import ChallengeModal from './ChallengeModal'
import SettingsModal from './SettingsModal'
import { usePlayer } from '@/context/PlayerContext'
import styles from './QuizSystem.module.css'

interface LevelInfo {
  id: number
  title: string
  icon: string
  desc: string
  color: string
}

const LEVELS: LevelInfo[] = [
  { id: 1, title: 'Sistema Solar', icon: '☀️', desc: 'Conheça o Sol e a vizinhança espacial onde vivemos!', color: '#ffcc00' },
  { id: 2, title: 'Planetas', icon: '🪐', desc: 'Gigantes gasosos, rochosos e todos os curiosos vizinhos da Terra.', color: '#ff6b6b' },
  { id: 3, title: 'Terra', icon: '🌍', desc: 'Descubra como nosso planeta gira e dança pelo espaço!', color: '#4facfe' },
  { id: 4, title: 'Lua', icon: '🌙', desc: 'As fases da Lua e por que ela brilha tanto no céu à noite.', color: '#a8edea' },
  { id: 5, title: 'Constelações', icon: '✨', desc: 'Aprenda a ler o mapa das estrelas e descobrir desenhos no céu!', color: '#f093fb' },
]

interface QuizStartScreenProps {
  mode?: string
  defaultDuelMode?: 'classic' | 'speedrun' | 'training'
  onStart: (level: number, challenge: number) => void
  onExit: () => void
  onStartDuel: (config: any) => void
}

export default function QuizStartScreen({ mode, defaultDuelMode, onStart, onExit, onStartDuel }: QuizStartScreenProps) {
  const { user } = useAuth()
  const { playSFX } = useSound()
  const { playerStats } = usePlayer()

  const [unlockedLevel, setUnlockedLevel] = useState(1)
  const [unlockedChallenge, setUnlockedChallenge] = useState(1)
  const [xp, setXp] = useState(playerStats?.galactic_xp || 0)
  const [rankingData, setRankingData] = useState<any[]>([])
  const [realTrophies, setRealTrophies] = useState<any[]>([])
  const [challengeData, setChallengeData] = useState<Record<string, any>>({})
  const [showDueloModal, setShowDueloModal] = useState(mode === 'challenge')
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const [selectedLevel, setSelectedLevel] = useState<number | null>(null)
  const [showTrophies, setShowTrophies] = useState(false)
  const [showRanking, setShowRanking] = useState(false)
  const [activeToast, setActiveToast] = useState<any | null>(null)
  const [lastProcessedIds, setLastProcessedIds] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)

  const fetchQuizProgress = useCallback(async () => {
    if (!user) return
    
    try {
      const QUIZ_GAME_ID = '316b90f3-c395-42b7-b857-be80d6628253'

      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('galactic_xp')
        .eq('player_id', user.id)
        .maybeSingle()
      
      if (stats) setXp(stats.galactic_xp)

      const { data: gameStats } = await supabase
        .from('player_game_stats')
        .select('metadata')
        .match({ player_id: user.id, game_id: QUIZ_GAME_ID })
        .maybeSingle()
      
      if (gameStats?.metadata?.unlocked_level) {
        setUnlockedLevel(gameStats.metadata.unlocked_level)
      }
      if (gameStats?.metadata?.unlocked_challenge) {
        setUnlockedChallenge(gameStats.metadata.unlocked_challenge)
      }
      if (gameStats?.metadata?.challenge_data) {
        setChallengeData(gameStats.metadata.challenge_data)
      }

      const { data: trophies } = await supabase
        .from('player_trophies')
        .select('*, trophies(*)')
        .eq('player_id', user.id)
      
      if (trophies) setRealTrophies(trophies)

      const { data: topPlayers } = await supabase
        .from('player_global_stats')
        .select('galactic_xp, players(full_name, username)')
        .order('galactic_xp', { ascending: false })
        .limit(5)
      
      if (topPlayers) {
        const formattedRanking = topPlayers.map((tp: any, idx: number) => ({
           id: idx + 1,
           name: tp.players?.full_name || tp.players?.username || 'Astronauta',
           score: tp.galactic_xp,
           avatar: idx === 0 ? '🥇' : '👨‍🚀',
           isMe: tp.players?.username === user.email?.split('@')[0]
        }))
        setRankingData(formattedRanking)
      }

      const { data: pending } = await supabase
        .from('quiz_challenges')
        .select('*')
        .eq('challenged_id', user.id)
        .eq('status', 'pending')
      
      const { data: results } = await supabase
        .from('quiz_challenges')
        .select('*')
        .eq('challenger_id', user.id)
        .eq('status', 'completed')
        .eq('challenger_seen', false)

      const allNotifs = [...(pending || []), ...(results || [])]
      
      if (allNotifs.length > 0) {
        const enriched = await Promise.all(allNotifs.map(async (n) => {
          const targetId = n.status === 'pending' ? n.challenger_id : n.challenged_id
          const { data: pData } = await supabase.from('players').select('full_name, username').eq('id', targetId).single()
          return { 
            ...n, 
            opponent: pData || { full_name: 'Astronauta', username: 'astronauta' },
            type: n.status === 'pending' ? 'invitation' : 'result'
          }
        }))
        setNotifications(enriched)
        setUnreadCount(enriched.length)

        const newInvitations = enriched.filter(n => n.type === 'invitation' && !lastProcessedIds.has(n.id))
        if (newInvitations.length > 0) {
          const newest = newInvitations[0]
          setActiveToast(newest)
          playSFX('bonus')
          
          setLastProcessedIds(prev => new Set([...Array.from(prev), ...newInvitations.map(i => i.id)]))
          
          setTimeout(() => setActiveToast(null), 8000)
        }
      } else {
        setNotifications([])
        setUnreadCount(0)
      }

    } catch (err) {
      console.error('Erro ao buscar progresso do quiz:', err)
    }
  }, [user, lastProcessedIds, playSFX])

  useEffect(() => {
    if (playerStats?.galactic_xp) {
      setXp(playerStats.galactic_xp)
    }
  }, [playerStats?.galactic_xp])

  useEffect(() => {
    fetchQuizProgress()
    
    const duelInterval = setInterval(fetchQuizProgress, 10000)
    return () => clearInterval(duelInterval)
  }, [user, fetchQuizProgress])

  const handleLevelClick = (id: number) => {
    playSFX('click')
    setSelectedLevel(prev => prev === id ? null : id)
  }

  const handleAcceptChallenge = async (challenge: any) => {
    playSFX('click')
    onStartDuel({
      targetUserId: challenge.challenger_id,
      targetUserName: challenge.opponent?.full_name || challenge.opponent?.username || 'Oponente',
      levelId: challenge.level_id,
      stake: challenge.stake,
      challengeId: challenge.id,
      challengerScore: challenge.challenger_score,
      challengerTime: challenge.challenger_time,
      mode: challenge.mode || 'classic',
      questionIds: challenge.question_ids 
    })
  }

  const handleDeclineChallenge = async (challengeId: string) => {
    playSFX('click')
    try {
      await supabase
        .from('quiz_challenges')
        .update({ status: 'declined' })
        .eq('id', challengeId)
      
      setNotifications(prev => prev.filter(c => c.id !== challengeId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erro ao recusar desafio:', err)
    }
  }

  const markAsRead = async (challengeId: string) => {
    playSFX('click')
    try {
      await supabase
        .from('quiz_challenges')
        .update({ challenger_seen: true })
        .eq('id', challengeId)
      
      setNotifications(prev => prev.filter(c => c.id !== challengeId))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (err) {
      console.error('Erro ao marcar como lido:', err)
    }
  }

  return (
    <div className={styles.startScreen} onClick={() => setSelectedLevel(null)}>
      <StarField />
      <div className={styles.nebulaBackground} />

      {activeToast && (
        <div className={styles.duelToast} onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}>
          <div className={styles.toastIcon}>⚔️</div>
          <div className={styles.toastBody}>
            <strong>NOVO DESAFIO!</strong>
            <span>{activeToast.opponent.full_name} te chamou para um duelo.</span>
            <small>Aposta: {activeToast.stake} XP</small>
          </div>
          <div className={styles.toastActions}>
            <button className={styles.toastAccept} onClick={(e) => {
              e.stopPropagation();
              handleAcceptChallenge(activeToast);
              setActiveToast(null);
            }}>
              ACEITAR
            </button>
            <button className={styles.toastClose} onClick={(e) => { e.stopPropagation(); setActiveToast(null); }}>×</button>
          </div>
        </div>
      )}
      
      <div className={styles.quizNavbar}>
        <div className={styles.navLeft}>
          <button className={styles.navBackBtn} onClick={onExit}>×</button>
        </div>
        <div className={styles.navCenter} />
        <div className={styles.navRight}>
          <div className={styles.userNavStats}>
            <div className={styles.notificationsWrapper}>
              <button 
                className={`${styles.navIconBtn} ${unreadCount > 0 ? styles.hasNotif : ''}`}
                onClick={(e) => { e.stopPropagation(); setShowNotifications(!showNotifications); }}
                title="Atividades Espaciais"
              >
                🔔 {unreadCount > 0 && <span className={styles.notifBadge}>{unreadCount}</span>}
              </button>

              {showNotifications && (
                <div className={styles.notifDropdown} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.notifHeader}>ATIVIDADES ESPACIAIS 🛰️</div>
                  <div className={styles.notifList}>
                    {notifications.length === 0 ? (
                      <div className={styles.emptyNotifs}>Silêncio profundo na galáxia...</div>
                    ) : (
                      notifications.map(n => (
                        <div key={n.id} className={styles.notifItem}>
                          {n.type === 'invitation' ? (
                            <div className={styles.notifContent}>
                              <div className={styles.notifIcon}>⚔️</div>
                              <div className={styles.notifText}>
                                <strong>{n.opponent.full_name}</strong> te desafiou!
                                <small>Aposta: {n.stake} XP</small>
                              </div>
                              <div className={styles.notifActions}>
                                <button className={styles.notifAccept} onClick={() => handleAcceptChallenge(n)}>ACEITAR</button>
                                <button className={styles.notifDecline} onClick={() => handleDeclineChallenge(n.id)}>×</button>
                              </div>
                            </div>
                          ) : (
                            <div className={styles.notifContent}>
                              <div className={styles.notifIcon}>{n.challenger_score > n.challenged_score ? '🏆' : '💀'}</div>
                              <div className={styles.notifText}>
                                <strong>Duelo Finalizado!</strong>
                                <span>{n.challenger_score > n.challenged_score ? 'Você venceu' : 'Você perdeu de'} {n.opponent.full_name}!</span>
                                <small>Placar: {n.challenger_score} x {n.challenged_score}</small>
                              </div>
                              <button className={styles.notifCheck} onClick={() => markAsRead(n.id)}>OK</button>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                  <div className={styles.notifFooter}>
                    <button className={styles.newDuelNavBtn} onClick={() => { setShowNotifications(false); setShowDueloModal(true); }}>
                      Lançar Novo Desafio 🚀
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className={styles.statDivider} />
            <div className={styles.statBox}>
              <span className={styles.statLabel}>XP</span>
              <span className={styles.statValue}>{xp.toLocaleString()}</span>
            </div>
            <div className={styles.statDivider} />
            <button 
              className={styles.navMuteBtn} 
              onClick={(e) => {
                e.stopPropagation()
                playSFX('click')
                setShowSettings(true)
              }}
              title="Configurações"
            >
              <IoSettings />
            </button>
          </div>
        </div>
      </div>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}

      <div className={styles.startHeader}>
        <h2 className={styles.heroTitle}>Quiz Intergaláctico</h2>
        <div className={styles.badgeRow}>
          <span className={styles.missionBadge}><FaRocket /> 15 DESAFIOS</span>
          <span className={styles.xpBadge}>⭐ 5 MISSÕES</span>
        </div>
      </div>

      <div className={styles.journeyPathway}>
        <svg className={styles.pathLine} viewBox="0 0 400 1200">
          <path d="M200,0 C350,150 50,300 200,450 C350,600 50,750 200,900 C350,1050 50,1200 200,1350" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="12" strokeLinecap="round" strokeDasharray="20,25" />
        </svg>

        {LEVELS.map((level, idx) => {
          const isEven = idx % 2 === 0
          const isSelected = selectedLevel === level.id
          const isUnlocked = level.id <= unlockedLevel

          return (
            <div 
              key={level.id} 
              className={`${styles.pathNode} ${isEven ? styles.nodeLeft : styles.nodeRight} ${isSelected ? styles.nodeSelected : ''} ${!isUnlocked ? styles.nodeLocked : ''}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
              onClick={(e) => {
                e.stopPropagation()
                if (isUnlocked) handleLevelClick(level.id)
              }}
            >
              {isSelected && (
                <div className={`${styles.nodeTooltip} ${isEven ? styles.tooltipLeft : styles.tooltipRight} ${idx === 0 ? styles.tooltipBelow : ''}`} onClick={(e) => e.stopPropagation()}>
                  <div className={styles.tooltipArrow} />
                  <div className={styles.tooltipHeader}>
                    <span className={styles.tooltipIcon}>{level.icon}</span>
                    <h4>{level.title}</h4>
                  </div>
                  <p className={styles.tooltipDesc}>{level.desc}</p>
                  
                  <div className={styles.tooltipActions}>
                    <div className={styles.challengeGrid}>
                      {[1, 2, 3].map(ch => {
                        const isChUnlocked = level.id < unlockedLevel || (level.id === unlockedLevel && ch <= unlockedChallenge)
                        const chKey = `L${level.id}C${ch}`
                        const chInfo = challengeData[chKey]
                        const statusClass = chInfo?.status === 'success' ? styles.btnSuccess : 
                                           chInfo?.status === 'partial' ? styles.btnPartial : 
                                           chInfo?.status === 'failed' ? styles.btnFailed : ''
                        
                        return (
                          <button 
                            key={ch}
                            className={`${styles.challengeBtn} ${!isChUnlocked ? styles.btnLocked : ''} ${statusClass}`}
                            disabled={!isChUnlocked}
                            onClick={(e) => {
                              e.stopPropagation();
                              playSFX('click');
                              onStart(level.id, ch);
                            }}
                          >
                            <span className={styles.chNumber}>{ch}</span>
                            <span className={styles.chLabel}>DESAFIO</span>
                            {!isChUnlocked && <FaLock className={styles.chLockIcon} />}
                          </button>
                        )
                      })}
                    </div>

                    {((unlockedLevel === level.id + 1 && unlockedChallenge >= 3) || (unlockedLevel > level.id + 1)) && level.id < 5 && (
                      <div className={styles.bonusSection}>
                        <div className={styles.bonusDivider}>
                          <span>DESAFIO ESPECIAL</span>
                        </div>
                        <button 
                          className={styles.bonusBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            playSFX('bonus');
                            onStart(level.id, 4);
                          }}
                        >
                          <div className={styles.bonusBtnIcon}>
                            <FaStar />
                          </div>
                          <div className={styles.bonusBtnText}>
                            <strong>REVISÃO GALÁCTICA</strong>
                            <span>Gere mais XP revisitando o que aprendeu!</span>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className={styles.nodeCard}>
                <div className={styles.nodeCircleWrapper}>
                  <div className={styles.nodeCircle} style={{ 
                    background: isSelected 
                      ? (isUnlocked ? `linear-gradient(135deg, ${level.color}, #ffffff55)` : 'rgba(100,100,100,0.3)')
                      : (isUnlocked ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.02)'),
                    boxShadow: isSelected && isUnlocked ? `0 0 30px ${level.color}44` : 'none',
                    borderColor: isSelected ? '#fff' : (isUnlocked ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.05)')
                  }}>
                    <span className={styles.nodeEmoji} style={{ filter: isUnlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                      {level.icon}
                    </span>
                    {!isUnlocked && <FaLock className={styles.nodeLock} />}
                    {isUnlocked && <div className={styles.activePulse} style={{ borderColor: level.color }} />}
                  </div>
                </div>
                
                <div className={styles.nodeText} style={{ opacity: isUnlocked ? 1 : 0.5 }}>
                  <span className={styles.levelTag} style={{ background: isUnlocked ? level.color : '#444' }}>Missão {level.id}</span>
                  <h3 className={styles.levelName}>{level.title}</h3>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className={styles.startFooter}>
        <div className={styles.discreteMenu}>
          <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setShowRanking(true); }}>
            <FaTrophy className={styles.menuIcon} />
            <span>Ranking</span>
          </button>
          
          <div className={styles.menuDivider} />
          
          <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setShowTrophies(true); }}>
            <FaMedal className={styles.menuIcon} />
            <span>Troféus</span>
          </button>
          
          <div className={styles.menuDivider} />
          
          <button className={styles.menuItem} onClick={(e) => { e.stopPropagation(); setShowDueloModal(true); }}>
            <FaUserFriends className={styles.menuIcon} />
            <span>Duelo</span>
          </button>
        </div>
      </div>

      {showDueloModal && (
        <ChallengeModal 
          onClose={() => {
            setShowDueloModal(false);
            if (mode === 'challenge') onExit();
          }}
          isTraining={defaultDuelMode === 'training'}
          onChallenge={(config) => {
            setShowDueloModal(false)
            onStartDuel({
              targetUserId: config.challengedId,
              targetUserName: 'Astronauta',
              levelId: config.levelId,
              stake: config.betAmount,
              mode: defaultDuelMode
            })
          }}
        />
      )}

      {showTrophies && (
        <div className={styles.modalOverlay} onClick={() => setShowTrophies(false)}>
          <div className={`${styles.challengeModal} ${styles.trophyModal}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowTrophies(false)}>×</button>
            <div className={styles.modalIcon} style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)' }}><FaMedal /></div>
            <h2>Sua Galeria de Conquistas</h2>
            <p>Continue explorando para desbloquear todas as medalhas!</p>
            
            <div className={styles.trophyGrid}>
              {realTrophies.length > 0 ? (
                realTrophies.map((entry: any) => (
                  <div key={entry.trophy_id} className={styles.trophyCard}>
                    <div className={styles.trophyVisual}>🌟</div>
                    <div className={styles.trophyInfo}>
                      <h4>{entry.trophies?.title || 'Conquista'}</h4>
                      <p>{entry.trophies?.description}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ textAlign: 'center', opacity: 0.7 }}>Você ainda não conquistou troféus. Complete missões para ganhar!</p>
              )}
            </div>
            
            <div className={styles.modalTip}>
              🚀 Você já possui {realTrophies.length} medalhas!
            </div>
          </div>
        </div>
      )}

      {showRanking && (
        <div className={styles.modalOverlay} onClick={() => setShowRanking(false)}>
          <div className={`${styles.challengeModal} ${styles.rankingModal}`} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeModal} onClick={() => setShowRanking(false)}>×</button>
            <div className={styles.modalIcon} style={{ background: 'linear-gradient(135deg, #4facfe, #00f2fe)' }}><FaTrophy /></div>
            <h2>Placar de Líderes</h2>
            <p>Os maiores exploradores da galáxia!</p>
            
            <div className={styles.rankingList}>
              {rankingData.map((item, idx) => (
                <div key={item.id} className={`${styles.rankingItem} ${item.isMe ? styles.rankingMe : ''}`}>
                  <div className={styles.rankPosition}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}º`}
                  </div>
                  <div className={styles.rankAvatar}>{item.avatar}</div>
                  <div className={styles.rankName}>{item.name}</div>
                  <div className={styles.rankScore}>{item.score.toLocaleString()} <span>XP</span></div>
                </div>
              ))}
            </div>
            
            <div className={styles.modalTip}>
              🔭 Continue jogando para subir no ranking e ganhar novos títulos!
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
