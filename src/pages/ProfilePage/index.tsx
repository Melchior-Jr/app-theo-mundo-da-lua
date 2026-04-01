import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import StarField from '@/components/StarField'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { session, user } = useAuth()
  const navigate = useNavigate()
  
  const [player, setPlayer] = useState<any>(null)
  const [globalStats, setGlobalStats] = useState<any>(null)
  const [allTrophies, setAllTrophies] = useState<any[]>([])
  const [unlockedTrophyIds, setUnlockedTrophyIds] = useState<Set<string>>(new Set())
  const [gameProgress, setGameProgress] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    username: '',
    school: '',
    class_name: '',
    birth_date: ''
  })
  const [message, setMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    if (!session) {
      navigate('/jogos')
      return
    }
    fetchProfileData()
  }, [session])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      // 1. Fetch Player Data
      const { data: profile } = await supabase
        .from('players')
        .select('*')
        .eq('id', user?.id)
        .single()
      
      if (profile) {
        setPlayer(profile)
        setFormData({
          full_name: profile.full_name || '',
          username: profile.username || '',
          school: profile.school || '',
          class_name: profile.class_name || '',
          birth_date: profile.birth_date || ''
        })
      }

      // 2. Fetch Global Stats
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('*')
        .eq('player_id', user?.id)
        .single()
      
      if (stats) setGlobalStats(stats)

      // 3. Fetch All Trophies & Unlocked ones
      const [trophiesRes, unlockedRes] = await Promise.all([
        supabase.from('trophies').select('*'),
        supabase.from('player_trophies').select('trophy_id').eq('player_id', user?.id)
      ])

      if (trophiesRes.data) setAllTrophies(trophiesRes.data)
      if (unlockedRes.data) {
        setUnlockedTrophyIds(new Set(unlockedRes.data.map(t => t.trophy_id)))
      }

      // 4. Fetch Game Stats
      const { data: progress } = await supabase
        .from('player_game_stats')
        .select('*, games(*)')
        .eq('player_id', user?.id)
      
      if (progress) setGameProgress(progress)
    } catch (err) {
      console.error('Erro ao carregar perfil:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage({ type: '', text: '' })
    
    try {
      const { error } = await supabase
        .from('players')
        .update({
          full_name: formData.full_name,
          username: formData.username,
          school: formData.school,
          class_name: formData.class_name,
          birth_date: formData.birth_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (error) throw error

      setMessage({ type: 'success', text: 'Dados atualizados! Missão cumprida. 🚀' })
      fetchProfileData()
      setTimeout(() => {
        setIsEditing(false)
        setMessage({ type: '', text: '' })
      }, 2000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao sincronizar dados com a base lunar.' })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('Você deve selecionar uma imagem para o seu traje.')
      }

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`
      const filePath = `${user?.id}/${fileName}`

      // 1. Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      // 3. Update Player Profile
      const { error: updateError } = await supabase
        .from('players')
        .update({ 
          avatar_url: publicUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id)

      if (updateError) throw updateError

      setMessage({ type: 'success', text: 'Sua foto de astronauta foi atualizada! 🚀' })
      fetchProfileData()
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro ao carregar sua imagem na estação.' })
    } finally {
      setUploading(false)
    }
  }

  const calculateAge = (birthDate: string) => {
    if (!birthDate) return null
    const birth = new Date(birthDate)
    const today = new Date()
    let age = today.getFullYear() - birth.getFullYear()
    const month = today.getMonth() - birth.getMonth()
    if (month < 0 || (month === 0 && today.getDate() < birth.getDate())) {
      age--
    }
    return age
  }

  if (loading && !player) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loader}></div>
        <p>Sincronizando com a Estação Espacial...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <StarField />
      
      <div className={styles.container}>
        <header className={styles.header}>
          <Link to="/jogos" className={styles.backLink}>
            <span className={styles.backIcon}>←</span> Voltar para a Central
          </Link>
          <div className={styles.headerTitle}>
            <h1>Painel do Astronauta</h1>
            <p>Sua jornada pela Galáxia Théo em um só lugar</p>
          </div>
        </header>

        <div className={styles.layout}>
          {/* Sidebar: Identidade */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatarLarge}>
                <div className={styles.avatarWrapper}>
                  {player?.avatar_url ? (
                    <img src={player.avatar_url} alt="Avatar" className={styles.profileImg} />
                  ) : (
                    <div className={styles.avatarEmojiPlaceholder}>
                      <span className={styles.avatarEmoji}>👨‍🚀</span>
                    </div>
                  )}
                  
                  <label className={styles.avatarUploadOverlay} htmlFor="avatar-upload">
                    {uploading ? (
                      <div className={styles.miniLoader} />
                    ) : (
                      <>
                        <span className={styles.cameraIcon}>📸</span>
                        <span className={styles.uploadText}>Trocar Traje</span>
                      </>
                    )}
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      accept="image/*" 
                      onChange={handleAvatarUpload} 
                      disabled={uploading}
                      className={styles.hiddenInput}
                    />
                  </label>
                </div>
                <div className={styles.rankBadge}>Nível {Math.floor((globalStats?.galactic_xp || 0) / 1000) + 1}</div>
              </div>
              
              {!isEditing ? (
                <div className={styles.playerInfo}>
                  <h2 className={styles.playerName}>{player?.full_name || 'Explorador'}</h2>
                  <p className={styles.playerNick}>@{player?.username || 'astronauta'}</p>
                  
                  <div className={styles.metaData}>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Escola</span>
                      <span className={styles.metaValue}>{player?.school || '--'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Turma</span>
                      <span className={styles.metaValue}>{player?.class_name || '--'}</span>
                    </div>
                    <div className={styles.metaItem}>
                      <span className={styles.metaLabel}>Idade</span>
                      <span className={styles.metaValue}>{player?.birth_date ? `${calculateAge(player.birth_date)} anos` : '--'}</span>
                    </div>
                  </div>

                  <button 
                    className={styles.editBtn}
                    onClick={() => setIsEditing(true)}
                  >
                    ✏️ Editar Traje (Perfil)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleUpdateProfile} className={styles.editForm}>
                  <div className={styles.inputGroup}>
                    <label>Nome</label>
                    <input 
                      type="text" 
                      value={formData.full_name}
                      onChange={e => setFormData({...formData, full_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Nick</label>
                    <input 
                      type="text" 
                      value={formData.username}
                      onChange={e => setFormData({...formData, username: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Escola</label>
                    <input 
                      type="text" 
                      value={formData.school}
                      onChange={e => setFormData({...formData, school: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Turma</label>
                    <input 
                      type="text" 
                      value={formData.class_name}
                      onChange={e => setFormData({...formData, class_name: e.target.value})}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Data de Nascimento</label>
                    <input 
                      type="date" 
                      value={formData.birth_date}
                      onChange={e => setFormData({...formData, birth_date: e.target.value})}
                    />
                  </div>
                  
                  {message.text && (
                    <div className={`${styles.message} ${styles[message.type]}`}>
                      {message.text}
                    </div>
                  )}

                  <div className={styles.formActions}>
                    <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancelar</button>
                    <button type="submit" className={styles.saveBtn}>Salvar</button>
                  </div>
                </form>
              )}
            </div>
          </aside>

          {/* Main Content: Conquistas e Progresso */}
          <main className={styles.content}>
            {/* Stats Row */}
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>✨</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{globalStats?.galactic_xp || 0}</span>
                  <span className={styles.statLabel}>Galactic XP</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🏆</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{globalStats?.total_score || 0}</span>
                  <span className={styles.statLabel}>Pontos Totais</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🥇</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{globalStats?.total_trophies || 0}</span>
                  <span className={styles.statLabel}>Troféus</span>
                </div>
              </div>
              <div className={styles.statCard}>
                <span className={styles.statIcon}>🎯</span>
                <div className={styles.statInfo}>
                  <span className={styles.statValue}>{globalStats?.total_challenges_completed || 0}</span>
                  <span className={styles.statLabel}>Desafios</span>
                </div>
              </div>
            </div>

            {/* Achievements Section */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Galeria de Troféus</h2>
                <p>Suas conquistas épicas na exploração espacial</p>
              </div>
              <div className={styles.achievementsGrid}>
                {allTrophies.length > 0 ? (
                  allTrophies.map((trophy) => {
                    const isUnlocked = unlockedTrophyIds.has(trophy.id)
                    return (
                      <div key={trophy.id} className={`${styles.achievementCard} ${!isUnlocked ? styles.locked : ''}`}>
                        <div className={styles.achievementIcon}>
                          {trophy.slug === 'primeiros_passos' ? '🌟' : 
                           trophy.slug === 'mestre_do_quiz' ? '🌒' : 
                           trophy.slug === 'explorador_nato' ? '🔭' : '🏆'}
                        </div>
                        <div className={styles.achievementInfo}>
                          <h3>{trophy.title}</h3>
                          <p>{trophy.description || 'Uma conquista espacial épica!'}</p>
                        </div>
                        {!isUnlocked && <div className={styles.lockOverlay}>🔒</div>}
                      </div>
                    )
                  })
                ) : (
                  <p>Aguardando radar de troféus... 🛰️</p>
                )}
              </div>
            </section>

            {/* Game Progress */}
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Diário de Bordo</h2>
                <p>Seu progresso em cada missão</p>
              </div>
              <div className={styles.progressList}>
                {gameProgress.length > 0 ? (
                  gameProgress.map((stat) => (
                    <div key={stat.game_id} className={styles.progressItem}>
                      <div className={styles.gameBrand}>
                        <span className={styles.gameIcon}>
                          {stat.games?.slug === 'quiz' ? '🚀' : 
                           stat.games?.slug === 'pulo_da_lua' ? '🌑' : '🎮'}
                        </span>
                        <div className={styles.gameNames}>
                          <h3>{stat.games?.title || 'Missão Desconhecida'}</h3>
                          <p>{stat.sessions_count || 0} missões completadas</p>
                        </div>
                      </div>
                      <div className={styles.unlockedStatus}>
                        <div className={styles.bestScoreCard}>
                          <span className={styles.statusLabel}>Melhor Pontuação</span>
                          <span className={styles.bestValue}>{stat.best_score || 0}</span>
                        </div>
                        <Link to="/jogos" className={styles.playLink}>Jogar</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyProgress}>
                    <p>O seu diário de bordo ainda está em branco.</p>
                    <Link to="/jogos" className={styles.startAdBtn}>Iniciar Primeira Missão 🚀</Link>
                  </div>
                )}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
