import { useState, useEffect } from 'react'
import { FaSearch, FaStar, FaChevronRight, FaRocket } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import { calcLevel } from '@/utils/playerUtils'
import styles from './QuizSystem.module.css'

interface ChallengeModalProps {
  onClose: () => void
  onChallenge: (config: { challengedId: string, levelId: number, betAmount: number }) => void
  isTraining?: boolean
}

const BET_OPTIONS = [10, 25, 50, 100, 250, 500]

export default function ChallengeModal({ onClose, onChallenge, isTraining = false }: ChallengeModalProps) {
  const { user } = useAuth()
  const { playSFX } = useSound()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [targetPlayer, setTargetPlayer] = useState<any>(null)
  const [betAmount, setBetAmount] = useState(10)
  const [loading, setLoading] = useState(false)

  // Busca de usuários em tempo real
  useEffect(() => {
    async function searchPlayers() {
      if (searchTerm.length < 3) {
        setSearchResults([])
        return
      }

      setLoading(true)
      try {
        // 1. Busca básica de jogadores por nome
        const { data: players, error: pError } = await supabase
          .from('players')
          .select('id, full_name, username, avatar_url')
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .neq('id', user?.id)
          .limit(5)

        if (pError) throw pError
        if (!players) { setSearchResults([]); return }

        // 2. Busca o XP (galactic_xp) de cada um na tabela player_global_stats
        const ids = players.map(p => p.id)
        const { data: stats, error: sError } = await supabase
          .from('player_global_stats')
          .select('player_id, galactic_xp')
          .in('player_id', ids)

        if (sError) console.warn('Erro ao buscar stats, continuando sem XP:', sError)

        // 3. Une os dados
        const combinedResults = players.map(p => ({
          ...p,
          stats: {
            galactic_xp: stats?.find(s => s.player_id === p.id)?.galactic_xp || 0
          }
        }))

        setSearchResults(combinedResults)
      } catch (err) {
        console.error('Erro na busca galáctica:', err)
      } finally {
        setLoading(false)
      }
    }

    const timer = setTimeout(searchPlayers, 500)
    return () => clearTimeout(timer)
  }, [searchTerm, user?.id])

  const handleCreateChallenge = () => {
    if (!targetPlayer) return
    playSFX('bonus')

    // Sorteia uma missão aleatória entre 1 e 5
    const randomLevel = Math.floor(Math.random() * 5) + 1

    onChallenge({
      challengedId: targetPlayer.id,
      levelId: randomLevel,
      betAmount: isTraining ? 0 : betAmount
    })
  }

  const handleClose = () => {
    onClose()
  }

  return (
    <div className={styles.modalOverlay} onClick={handleClose}>
      <div className={`${styles.challengeModal} ${styles.dueloModal}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeModal} onClick={handleClose}>×</button>

        <div className={styles.modalHeader}>
          <div className={styles.modalIcon} style={{ background: 'linear-gradient(135deg, #ff3d71, #f093fb)' }}>
            ⚔️
          </div>
          <h2>Duelo Estelar </h2>
          <p>Desafie um colega e conquiste o dobro de XP!</p>
        </div>

        <div className={styles.challengeStep}>
          {!targetPlayer ? (
            <div className={styles.searchSection}>
              <label>1. Encontre seu Oponente</label>
              <div className={styles.searchInputWrapper}>
                <FaSearch className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Username ou Nome do amigo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>

              <div className={styles.resultsList}>
                {loading && <div className={styles.searchLoading}>Escaneando radar espacial...</div>}
                {searchResults.map(p => (
                  <button key={p.id} className={styles.resultItem} onClick={() => { playSFX('click'); setTargetPlayer(p); }}>
                    <div className={styles.avatarMini}>
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt={p.username} className={styles.miniAvatarImg} />
                      ) : (
                        '👨‍🚀'
                      )}
                    </div>
                    <div className={styles.resultInfo} style={{ color: '#fff' }}>
                      <span className={styles.resultName} style={{ color: '#fff' }}>{p.full_name || p.username}</span>
                      <span className={styles.resultUser} style={{ opacity: 0.7, color: '#fff' }}>@{p.username}</span>
                    </div>
                    <FaChevronRight className={styles.resultArrow} />
                  </button>
                ))}
                {searchTerm.length >= 3 && searchResults.length === 0 && !loading && (
                  <div className={styles.noResults}>Nenhum astronauta encontrado com esse nome... 🛸</div>
                )}
              </div>
            </div>
          ) : (
            <div className={styles.configSection}>
              <div className={styles.selectedPlayer}>
                <div className={styles.cardHeader}>
                  <span>Astronauta Selecionado:</span>
                  <button className={styles.changeBtn} onClick={() => setTargetPlayer(null)}>Trocar</button>
                </div>

                <div className={styles.playerSelectionCard}>
                  <div className={styles.playerCardAvatar}>
                    {targetPlayer.avatar_url ? (
                      <img src={targetPlayer.avatar_url} alt={targetPlayer.username} />
                    ) : (
                      <div className={styles.avatarPlaceholder}>👨‍🚀</div>
                    )}
                  </div>
                  <div className={styles.playerCardInfo}>
                    <h3 className={styles.playerCardName}>{targetPlayer.full_name || targetPlayer.username}</h3>
                    <div className={styles.playerCardStats}>
                      <span className={styles.playerCardLevel}>NIV. {calcLevel(targetPlayer.stats?.galactic_xp || 0)}</span>
                      <span className={styles.playerCardXP}>{targetPlayer.stats?.galactic_xp || 0} XP</span>
                    </div>
                  </div>
                </div>
              </div>

              {!isTraining ? (
                <div className={styles.betSection}>
                  <label>2. Valor da Aposta (XP)</label>
                  <div className={styles.betGrid}>
                    {BET_OPTIONS.map(val => (
                      <button
                        key={val}
                        className={`${styles.betBtn} ${betAmount === val ? styles.betSelected : ''}`}
                        onClick={() => { playSFX('click'); setBetAmount(val); }}
                      >
                        <FaStar /> {val}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className={styles.trainingInfoSection}>
                  <label>2. Modo Amigável</label>
                  <div className={styles.trainingInfo}>
                    Sem apostas! Apenas treinamento de conhecimentos galácticos.
                  </div>
                </div>
              )}

              {!isTraining && (
                <div className={styles.potPreview}>
                  <div className={styles.potLabel}>Pote Total do Vencedor 💰</div>
                  <div className={styles.potValue}>{betAmount * 2} <span className={styles.potXP}>XP</span></div>
                </div>
              )}

              <button className={styles.startDuelBtn} onClick={handleCreateChallenge}>
                <FaRocket /> LANÇAR DESAFIO!
              </button>
            </div>
          )}
        </div>

        <div className={styles.modalTip}>
          ⚠️ Lembre-se: Boa sorte em sua jornada espacial!
        </div>
      </div>
    </div>
  )
}
