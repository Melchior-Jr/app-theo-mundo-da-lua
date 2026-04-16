import { useState, useEffect, useCallback } from 'react';
import { FaLock, FaTrophy, FaUserFriends, FaMedal, FaStar, FaChevronDown, FaGlobeAmericas, FaLocationArrow } from 'react-icons/fa'
import { IoSettings, IoPlanetOutline } from 'react-icons/io5'
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

// Temas carregados dinamicamente do banco
interface QuizSubject {
  id: string;
  label: string;
  icon: string;
  title: string;
}

const LEVELS_BY_SUBJECT: Record<string, LevelInfo[]> = {
  astronomy: [
    { id: 1, title: 'Sistema Solar', icon: '☀️', desc: 'Conheça o Sol e a vizinhança espacial onde vivemos!', color: '#ffcc00' },
    { id: 2, title: 'Planetas', icon: '🪐', desc: 'Gigantes gasosos, rochosos e todos os curiosos vizinhos da Terra.', color: '#ff6b6b' },
    { id: 3, title: 'Terra', icon: '🌍', desc: 'Descubra como nosso planeta gira e dança pelo espaço!', color: '#4facfe' },
    { id: 4, title: 'Lua', icon: '🌙', desc: 'As fases da Lua e por que ela brilha tanto no céu à noite.', color: '#a8edea' },
    { id: 5, title: 'Constelações', icon: '✨', desc: 'Aprenda a ler o mapa das estrelas e descobrir desenhos no céu!', color: '#f093fb' },
  ],
  geosciences: [
    { id: 1, title: 'Camadas da Terra', icon: '🌍', desc: 'Viaje até o coração do nosso planeta e conheça o que existe lá embaixo!', color: '#4facfe' },
    { id: 2, title: 'Rochas e Minerais', icon: '🪨', desc: 'Explore os tesouros escondidos e aprenda a diferenciar pedras de minerais.', color: '#9b59b6' },
    { id: 3, title: 'Formação do Solo', icon: '🌄', desc: 'Descubra como a terra onde pisamos e plantamos é criada pela natureza.', color: '#e67e22' },
    { id: 4, title: 'Erosão e relevo', icon: '🌧️', desc: 'Entenda como o vento e a chuva esculpem as montanhas e vales.', color: '#2ecc71' },
    { id: 5, title: 'Vulcões e terremotos', icon: '🌋', desc: 'Sinta a força das placas tectônicas e o calor do magma em ação!', color: '#e74c3c' },
    { id: 6, title: 'Fenômenos naturais', icon: '🌪️', desc: 'Furacões, tsunamis e outros eventos poderosos do nosso planeta.', color: '#f1c40f' },
    { id: 7, title: 'Ação humana no relevo', icon: '🏙️', desc: 'Como nossas cidades e atividades transformam a paisagem da Terra.', color: '#34495e' },
    { id: 8, title: 'Sustentabilidade', icon: '🌱', desc: 'Aprenda a cuidar dos recursos naturais para um futuro brilhante!', color: '#27ae60' },
    { id: 9, title: 'Missão final', icon: '🧠', desc: 'O desafio supremo: prove que você é um mestre das Geociências!', color: '#f39c12' },
  ]
}

interface QuizStartScreenProps {
  mode?: string
  defaultDuelMode?: 'classic' | 'speedrun' | 'training'
  onStart: (level: number, challenge: number, subject: 'astronomy' | 'geosciences') => void
  onExit: () => void
  onStartDuel: (config: any) => void
}

export default function QuizStartScreen({ mode, defaultDuelMode, onStart, onExit, onStartDuel }: QuizStartScreenProps) {
  const { user } = useAuth()
  const { playSFX } = useSound()
  const { playerStats } = usePlayer()

  const [dbSubjects, setDbSubjects] = useState<QuizSubject[]>([])
  const [selectedSubject, setSelectedSubject] = useState<string>(() => {
    return localStorage.getItem('theo_quiz_last_subject') || 'astronomy'
  })
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false)
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
      
      const subjectMeta = gameStats?.metadata?.[selectedSubject] || {}
      
      setUnlockedLevel(subjectMeta.unlocked_level || 1)
      setUnlockedChallenge(subjectMeta.unlocked_challenge || 1)
      setChallengeData(subjectMeta.challenge_data || {})

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

      // NOVO: Carregar jornadas e filtrar por visibilidade
      const { data: journeys } = await supabase
        .from('app_subjects')
        .select('*')
        .order('order_index', { ascending: true })

      if (journeys) {
        // Filtro de visibilidade
        const visibleJourneys = journeys.filter(j => {
          const status = j.quiz_status || 'draft';
          const testerIds = j.quiz_tester_ids || [];

          if (status === 'published') return true
          if (status === 'coming_soon') return true
          if (status === 'draft') {
             // Admin e Professores sempre veem
             if (playerStats?.is_admin || playerStats?.is_teacher) return true
             // Testadores veem se estiverem na lista
             if (testerIds.includes(user.id)) return true
             return false
          }
          return false
        })

        const formatted = visibleJourneys.map(j => {
          const rawName = j.name.split('|')[0].trim();
          const cleanName = rawName.charAt(0).toUpperCase() + rawName.slice(1).toLowerCase();
          
          // Mapeia o slug (pt-BR) para o ID esperado pelo sistema de Quiz (en-US)
          let quizId = j.slug;
          if (j.slug === 'astronomia') quizId = 'astronomy';
          if (j.slug === 'geociencias') quizId = 'geosciences';
          
          return {
            id: quizId, 
            label: cleanName,
            icon: j.icon || '🚀',
            title: j.name
          };
        })
        setDbSubjects(formatted)
        
        if (selectedSubject && !formatted.find(s => s.id === selectedSubject)) {
          const newId = formatted[0]?.id || null;
          setSelectedSubject(newId)
          if (newId) localStorage.setItem('theo_quiz_last_subject', newId);
        } else if (!selectedSubject && formatted.length > 0) {
          setSelectedSubject(formatted[0].id)
          localStorage.setItem('theo_quiz_last_subject', formatted[0].id);
        }
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
  }, [user, lastProcessedIds, playSFX, selectedSubject])

  useEffect(() => {
    if (playerStats?.galactic_xp) {
      setXp(playerStats.galactic_xp)
    }
  }, [playerStats?.galactic_xp])

  useEffect(() => {
    fetchQuizProgress();

    // Sincronização global: forçar refresh local quando houver mudanças no sistema de notificações
    const handleNotifUpdate = () => fetchQuizProgress();
    window.addEventListener('notification-updated', handleNotifUpdate);

    const duelInterval = setInterval(fetchQuizProgress, 10000);
    return () => {
      clearInterval(duelInterval);
      window.removeEventListener('notification-updated', handleNotifUpdate);
    };
  }, [user, fetchQuizProgress]);

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
    <div className={styles.startScreen} onClick={() => { setSelectedLevel(null); setShowSubjectDropdown(false); }}>
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
        
        <div className={styles.subjectDropdownWrapper}>
          <button 
            className={`${styles.dropdownTrigger} ${showSubjectDropdown ? styles.triggerActive : ''} ${styles['theme-' + selectedSubject]}`}
            onClick={(e) => {
              e.stopPropagation()
              setShowSubjectDropdown(!showSubjectDropdown)
              playSFX('click')
            }}
          >
            <span className={styles.triggerIcon}>
              {(() => {
                const icon = dbSubjects.find(s => s.id === selectedSubject)?.icon;
                if (icon?.toLowerCase() === 'orbit') return <IoPlanetOutline />;
                if (icon?.toLowerCase() === 'globe') return <FaGlobeAmericas />;
                return icon || '🚀';
              })()}
            </span>
            <span className={styles.triggerLabel}>
              {dbSubjects.find(s => s.id === selectedSubject)?.label || 'Carregando...'}
            </span>
            <FaChevronDown className={styles.chevronIcon} />
          </button>

          {showSubjectDropdown && (
            <div className={styles.dropdownMenu} onClick={(e) => e.stopPropagation()}>
              {dbSubjects.map(subject => (
                <button 
                  key={subject.id}
                  className={`${styles.menuItem} ${selectedSubject === subject.id ? styles.menuItemActive : ''}`}
                  onClick={() => {
                    setSelectedSubject(subject.id)
                    setSelectedLevel(null)
                    localStorage.setItem('theo_quiz_last_subject', subject.id)
                    setShowSubjectDropdown(false)
                    playSFX('click')
                  }}
                >
                  <span className={styles.menuIcon}>
                    {subject.icon?.toLowerCase() === 'orbit' ? <IoPlanetOutline /> : 
                     subject.icon?.toLowerCase() === 'globe' ? <FaGlobeAmericas /> : 
                     subject.icon || '🚀'}
                  </span>
                  <span className={styles.menuLabel}>{subject.label}</span>
                  {selectedSubject === subject.id && <div className={styles.activeDot} />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.journeyPathway}>
        <svg 
          className={styles.pathLine} 
          viewBox={`0 0 400 ${(LEVELS_BY_SUBJECT[selectedSubject] || []).length * 250}`}
          preserveAspectRatio="xMidYMin meet"
        >
          <path 
            d={`M200,0 ${(LEVELS_BY_SUBJECT[selectedSubject] || []).map((_, i) => {
              const y = (i + 1) * 250;
              const cp1y = y - 125;
              const cp2y = y - 125;
              const x = 200;
              const direction = i % 2 === 0 ? 350 : 50;
              return `C${direction},${cp1y} ${400 - direction},${cp2y} ${x},${y}`;
            }).join(' ')}`}
            fill="none" 
            stroke="rgba(255,255,255,0.08)" 
            strokeWidth="12" 
            strokeLinecap="round" 
            strokeDasharray="20,25" 
          />
        </svg>

        {(LEVELS_BY_SUBJECT[selectedSubject] || []).map((level, idx) => {
          const isEven = idx % 2 === 0
          const isSelected = selectedLevel === level.id
          const isUnlocked = level.id <= unlockedLevel

          return (
            <div 
              key={level.id} 
              className={`${styles.pathNode} ${isEven ? styles.nodeLeft : styles.nodeRight} ${isSelected ? styles.nodeSelected : ''} ${!isUnlocked ? styles.nodeLocked : ''}`}
              style={{ 
                animationDelay: `${idx * 0.1}s`,
                zIndex: isSelected ? 100 : (LEVELS_BY_SUBJECT[selectedSubject]?.length || 0) - idx
              }}
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
                              onStart(level.id, ch, selectedSubject);
                            }}
                          >
                            <span className={styles.chNumber}>{ch}</span>
                            <span className={styles.chLabel}>DESAFIO</span>
                            {!isChUnlocked && <FaLock className={styles.chLockIcon} />}
                          </button>
                        )
                      })}
                    </div>

                    {((unlockedLevel === level.id + 1 && unlockedChallenge >= 3) || (unlockedLevel > level.id + 1)) && (
                      <div className={styles.bonusSection}>
                        <div className={styles.bonusDivider}>
                          <span>DESAFIO ESPECIAL</span>
                        </div>
                        <button 
                          className={styles.bonusBtn}
                          onClick={(e) => {
                            e.stopPropagation();
                            playSFX('bonus');
                            onStart(level.id, 4, selectedSubject);
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
