import { useState, useEffect } from 'react'
import { FaSearch, FaUserFriends, FaStar, FaChevronRight, FaRocket } from 'react-icons/fa'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useSound } from '@/context/SoundContext'
import styles from './QuizSystem.module.css'

interface ChallengeModalProps {
  onClose: () => void
  onChallenge: (config: { challengedId: string, levelId: number, betAmount: number }) => void
}

const BET_OPTIONS = [10, 25, 50, 100, 250, 500]

export default function ChallengeModal({ onClose, onChallenge }: ChallengeModalProps) {
  const { user } = useAuth()
  const { playSFX } = useSound()
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [targetPlayer, setTargetPlayer] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState(1)
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
        const { data, error } = await supabase
          .from('players')
          .select('id, full_name, username')
          .or(`username.ilike.%${searchTerm}%,full_name.ilike.%${searchTerm}%`)
          .neq('id', user?.id) // Não desafiar a si mesmo
          .limit(5)

        if (error) throw error
        setSearchResults(data || [])
      } catch (err) {
        console.error('Erro na busca:', err)
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
    onChallenge({
      challengedId: targetPlayer.id,
      levelId: selectedLevel,
      betAmount
    })
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.challengeModal} ${styles.dueloModal}`} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeModal} onClick={onClose}>×</button>
        
        <div className={styles.modalHeader}>
          <div className={styles.modalIcon} style={{ background: 'linear-gradient(135deg, #ff3d71, #f093fb)' }}>
            <FaUserFriends />
          </div>
          <h2>Duelo Estelar ⚔️</h2>
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
                    <div className={styles.avatarMini}>👨‍🚀</div>
                    <div className={styles.resultInfo}>
                      <span className={styles.resultName}>{p.full_name || p.username}</span>
                      <span className={styles.resultUser}>@{p.username}</span>
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
                <span>Você escolheu desafiar:</span>
                <div className={styles.targetBadge}>
                  <strong>{targetPlayer.full_name || targetPlayer.username}</strong>
                  <button onClick={() => setTargetPlayer(null)}>Trocar</button>
                </div>
              </div>

              <div className={styles.configGrid}>
                <div className={styles.configItem}>
                  <label>2. Missão Orbital</label>
                  <select 
                    value={selectedLevel} 
                    onChange={(e) => setSelectedLevel(Number(e.target.value))}
                    className={styles.levelSelect}
                  >
                    {[1, 2, 3, 4, 5].map(lv => (
                      <option key={lv} value={lv}>Missão {lv}</option>
                    ))}
                  </select>
                </div>

                <div className={styles.configItem}>
                  <label>3. Valor da Aposta (XP)</label>
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
              </div>

              <div className={styles.potPreview}>
                <div className={styles.potLabel}>Pote Total do Vencedor 💰</div>
                <div className={styles.potValue}>{betAmount * 2} <span className={styles.potXP}>XP</span></div>
              </div>

              <button className={styles.startDuelBtn} onClick={handleCreateChallenge}>
                <FaRocket /> LANÇAR DESAFIO!
              </button>
            </div>
          )}
        </div>

        <div className={styles.modalTip}>
          ⚠️ Lembre-se: O duelo termina no primeiro erro! Concentre-se bem!
        </div>
      </div>
    </div>
  )
}
