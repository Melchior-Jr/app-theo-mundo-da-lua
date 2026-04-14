import React, { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  Camera, Edit2, Save, X, Trophy, Star, Zap, 
  Target, Calendar, School, User, Hash,
  ChevronRight, LogOut, CheckCircle2, Shield, Bell,
  Volume2, VolumeX, Music, Headphones, MessageSquare, RotateCcw
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { usePlayer } from '@/context/PlayerContext'
import { useSound } from '@/context/SoundContext'
import { calcLevel, getLevelTitle, calcLevelProgress } from '@/utils/playerUtils'
import { TROPHIES } from '@/data/trophies'
import StarField from '@/components/StarField'
import { Navbar } from '@/components/Navbar'
import styles from './ProfilePage.module.css'

export default function ProfilePage() {
  const { session, user, signOut } = useAuth()
  const navigate = useNavigate()
  
  const { 
    playerData: player, 
    playerStats: globalStats, 
    userTrophies, 
    gameStats, 
    loading, 
    refreshData 
  } = usePlayer()
  
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
  const [testMessage, setTestMessage] = useState({ type: '', text: '' })
  
  // -- NOTIFICATION SETTINGS LOGIC --
  const [notifSettings, setNotifSettings] = useState<any>(null)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const { 
    playSFX,
    isMuted, toggleMute, 
    bgVolume, setBgVolume,
    sfxVolume, setSfxVolume,
    narrationVolume, setNarrationVolume,
    narrationRate, setNarrationRate, 
    resetSettings
  } = useSound()

  const fetchNotifSettings = async () => {
    if (!user?.id) return
    try {
      const { data } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', user.id)
        .single()
      if (data) setNotifSettings(data)

      // Verificar subscription no navegador e auto-sincronizar
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.getSubscription()
        if (sub) {
          setIsSubscribed(true)
          
          // Sincroniza ativamente com o Supabase para garantir que o receptor está na base de dados
          const subJSON = JSON.parse(JSON.stringify(sub))
          const { error: upsertErr } = await supabase.from('push_subscriptions').upsert({
            user_id: user.id,
            endpoint: subJSON.endpoint,
            p256dh: subJSON.keys?.p256dh,
            auth: subJSON.keys?.auth,
            user_agent: navigator.userAgent
          }, { onConflict: 'endpoint' })
          
          if (upsertErr) {
            console.error('Erro ao salvar Inscrição no Banco:', upsertErr)
            setTestMessage({ type: 'error', text: `Erro no BD: ${upsertErr.message}` })
          }
        } else {
          setIsSubscribed(false)
        }
      }
    } catch (e) {
      console.error('Erro ao buscar settings de push:', e)
    }
  }

  const toggleCategory = async (cat: string) => {
    const newCategories = { 
      ...notifSettings.categories, 
      [cat]: !notifSettings.categories[cat] 
    }
    const newSettings = { ...notifSettings, categories: newCategories }
    setNotifSettings(newSettings)
    await supabase
      .from('notification_settings')
      .update({ categories: newCategories })
      .eq('user_id', user?.id)
  }

  const toggleTime = async (time: string) => {
    const newTimes = { 
      ...notifSettings.active_hours, 
      [time]: !notifSettings.active_hours[time] 
    }
    const newSettings = { ...notifSettings, active_hours: newTimes }
    setNotifSettings(newSettings)
    await supabase
      .from('notification_settings')
      .update({ active_hours: newTimes })
      .eq('user_id', user?.id)
  }

  const handleSubscribe = async () => {
    if (!user?.id) return
    const { PushService } = await import('@/services/pushService')
    const success = await PushService.register(user.id)
    if (success) setIsSubscribed(true)
  }

  const handleTestPush = async () => {
    if (!user?.id) return
    setTestMessage({ type: 'loading', text: 'Enviando sinal... 📡' })
    try {
      const { data, error } = await supabase.functions.invoke('enviar-push', {
        body: {
          userId: user.id,
          category: 'curiosity', // testando categoria curiosidade
          payload: {
            title: 'Você foi bipado pelo Théo! 📡',
            body: 'O sistema de comunicação intergaláctica está operante e os sinais estão chegando altos e claros na Terra!',
            url: '/perfil'
          }
        }
      })
      if (error) {
        let errMsg = error.message
        if (error.context && error.context.text) {
          try {
             const parsed = JSON.parse(await error.context.text())
             if (parsed.error) errMsg = parsed.error
          } catch(e) {}
        }
        throw new Error(errMsg)
      }
      console.log('Resposta da Edge Function:', data)
      if (data?.detalhes_erro) {
         setTestMessage({ type: 'error', text: `Diagnóstico: ${data.detalhes_erro}` })
      } else {
         setTestMessage({ type: 'success', text: `Sinal Enviado! Transmissores: ${data?.transmissores_alcancados || 0}` })
      }
      setTimeout(() => setTestMessage({ type: '', text: '' }), 8000)
    } catch (e: any) {
      console.error('Erro ao enviar push teste:', e)
      setTestMessage({ type: 'error', text: `Falha no motor: ${e.message}` })
    }
  }


  useEffect(() => {
    if (!session) {
      navigate('/login')
      return
    }
    fetchProfileData()
    fetchNotifSettings()
  }, [session, user])

  const fetchProfileData = async () => {
    // Agora os dados vêm do contexto, mas mantemos a função para compatibilidade
    // e para sincronizar o form ao montar.
    if (player) {
      setFormData({
        full_name: player.full_name || '',
        username: player.username || '',
        school: player.school || '',
        class_name: player.class_name || '',
        birth_date: player.birth_date || ''
      })
    }
  }

  // Sincronizar form quando playerData estiver pronto no contexto
  useEffect(() => {
    if (player) {
      setFormData({
        full_name: player.full_name || '',
        username: player.username || '',
        school: player.school || '',
        class_name: player.class_name || '',
        birth_date: player.birth_date || ''
      })
    }
  }, [player])

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

      setMessage({ type: 'success', text: 'Dados sincronizados com sucesso! 🚀' })
      refreshData()
      setTimeout(() => {
        setIsEditing(false)
        setMessage({ type: '', text: '' })
      }, 2000)
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message || 'Erro na comunicação interstelar.' })
    }
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      if (!event.target.files || event.target.files.length === 0) return

      const file = event.target.files[0]
      const fileExt = file.name.split('.').pop()
      const filePath = `${user?.id}/${user?.id}-${Math.random()}.${fileExt}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      await supabase
        .from('players')
        .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
        .eq('id', user?.id)

      refreshData()
      setMessage({ type: 'success', text: 'Seu visual de astronauta foi atualizado!' })
      setTimeout(() => setMessage({ type: '', text: '' }), 3000)
    } catch (err: any) {
      setMessage({ type: 'error', text: 'Erro ao carregar traje.' })
    } finally {
      setUploading(false)
    }
  }

  // Lógica de Gamificação
  const level = useMemo(() => calcLevel(globalStats?.galactic_xp), [globalStats])
  const title = useMemo(() => getLevelTitle(level), [level])
  const progress = useMemo(() => calcLevelProgress(globalStats?.galactic_xp), [globalStats])

  const unlockedTrophiesCount = userTrophies.filter(t => t.unlocked).length
  const recentAchievements = useMemo(() => {
    return userTrophies
      .filter(ut => ut.unlocked)
      .sort((a, b) => new Date(b.unlocked_at || 0).getTime() - new Date(a.unlocked_at || 0).getTime())
      .slice(0, 3)
      .map(ut => TROPHIES.find(t => t.id === ut.trophy_id))
      .filter(Boolean)
  }, [userTrophies])

  if (loading && !player) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.loaderSpinner} />
        <p>Acessando arquivos confidenciais do astronauta...</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <StarField />
      
      {/* ── NAVBAR (Matching GamesPage) ───────────────────────────── */}
      <Navbar />

      <main className={styles.content}>
        <div className={styles.grid}>
          
          {/* ────── COLUNA ESQUERDA: PERFIL ────── */}
          <aside className={styles.sidebar}>
            <div className={styles.profileCard}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrap}>
                  {player?.avatar_url ? (
                    <img src={player.avatar_url} className={styles.avatarImg} alt="Perfil" />
                  ) : (
                    <div className={styles.avatarFallback}>{player?.username?.charAt(0) || 'A'}</div>
                  )}
                  
                  <label className={styles.cameraBtn}>
                    <input type="file" onChange={handleAvatarUpload} hidden accept="image/*" />
                    {uploading ? <div className={styles.btnLoader} /> : <Camera size={14} />}
                  </label>
                </div>
                
                <div className={styles.identity}>
                  <h1 className={styles.name}>{player?.full_name || 'Explorador Espacial'}</h1>
                  <span className={styles.username}>@{player?.username || 'astronauta'}</span>
                  <div className={styles.rankBadge}>
                    <Shield size={12} className={styles.shieldIcon} />
                    {title}
                  </div>
                </div>
              </div>

              <div className={styles.levelDashboard}>
                <div className={styles.levelHeader}>
                  <span className={styles.levelNum}>NÍVEL {level}</span>
                  <span className={styles.xpTotal}>{globalStats?.galactic_xp || 0} XP</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: `${progress}%` }} />
                </div>
                <p className={styles.levelTip}>Faltam {1000 - ((globalStats?.galactic_xp || 0) % 1000)} XP para o nível {level + 1}</p>
              </div>

              <div className={styles.divider} />

              <div className={styles.infoList}>
                <div className={styles.infoItem}>
                  <School size={16} />
                  <div className={styles.infoContent}>
                    <label>Escola</label>
                    <span>{player?.school || 'Não informada'}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Hash size={16} />
                  <div className={styles.infoContent}>
                    <label>Turma / Ano</label>
                    <span>{player?.class_name || 'Não informada'}</span>
                  </div>
                </div>
                <div className={styles.infoItem}>
                  <Calendar size={16} />
                  <div className={styles.infoContent}>
                    <label>Nascimento</label>
                    <span>{player?.birth_date ? new Date(player.birth_date).toLocaleDateString() : 'Não informada'}</span>
                  </div>
                </div>
              </div>

              <button className={styles.editProfileBtn} onClick={() => setIsEditing(true)}>
                <Edit2 size={14} />
                Editar Informações
              </button>

              <button 
                className={styles.logoutBtn} 
                onClick={() => { playSFX('click'); signOut(); }}
              >
                <LogOut size={16} />
                Encerrar Missão (Sair)
              </button>
            </div>

            {/* Widgets Rápidos */}
            <div className={styles.miniStats}>
              <div className={styles.mStat}>
                <Trophy size={20} className={styles.mIconTrophy} />
                <div className={styles.mLabel}>Troféus</div>
                <div className={styles.mValue}>{unlockedTrophiesCount}</div>
              </div>
              <div className={styles.mStat}>
                <Target size={20} className={styles.mIconTarget} />
                <div className={styles.mLabel}>Missões</div>
                <div className={styles.mValue}>{gameStats.length}</div>
              </div>
              <button 
                onClick={() => { playSFX('click'); signOut(); }} 
                className={styles.logoutFooterBtn}
              >
                <LogOut size={14} />
                Encerrar Missão (Sair)
              </button>
            </div>
          </aside>

          {/* ────── COLUNA DIREITA: CONQUISTAS ────── */}
          <section className={styles.mainContent}>
            
            {/* Resumo de Atividades */}
            <div className={styles.summaryGrid}>
              <div className={styles.sumCard}>
                <div className={styles.sumLabel}>Pontuação Total</div>
                <div className={styles.sumValue}>{globalStats?.total_score || 0}</div>
                <Star size={14} className={styles.sumIcon} />
              </div>
              <div className={styles.sumCard}>
                <div className={styles.sumLabel}>Melhor Streak</div>
                <div className={styles.sumValue}>12</div>
                <Zap size={14} className={styles.sumIconZap} />
              </div>
            </div>

            {/* Troféus Recentes */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Conquistas Pró-Max 🏆</h2>
                <Link to="/trofeus" className={styles.viewMore}>Ver Galeria <ChevronRight size={14} /></Link>
              </div>
              
              <div className={styles.recentAchievements}>
                {recentAchievements.length > 0 ? (
                  recentAchievements.map((t: any) => (
                    <div key={t.id} className={styles.achCard}>
                      <div className={styles.achIcon}>✨</div>
                      <div className={styles.achInfo}>
                        <h3>{t.name}</h3>
                        <p>{t.description}</p>
                      </div>
                      <div className={styles.achReward}>+{t.rewardXp} XP</div>
                    </div>
                  ))
                ) : (
                  <div className={styles.emptyState}>
                    Ainda não há troféus na sua prateleira. Que tal começar um desafio agora? 🚀
                  </div>
                )}
              </div>
            </div>

            {/* Diário de Missões */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Diário de Bordo 📒</h2>
              </div>
              <div className={styles.missionList}>
                {gameStats.map((gs) => (
                  <div key={gs.id} className={styles.missionItem}>
                    <div className={styles.missionBrand}>
                      <div className={styles.missionIcon}>🌀</div>
                      <div className={styles.missionDetail}>
                        <h3>{gs.games?.title || 'Missão Desconhecida'}</h3>
                        <span>{gs.sessions_count} expedições realizadas</span>
                      </div>
                    </div>
                    <div className={styles.missionStats}>
                      <div className={styles.mPoint}>
                        <span className={styles.mPointLabel}>Recorde</span>
                        <span className={styles.mPointVal}>{gs.best_score || 0}</span>
                      </div>
                      <Link to="/jogos" className={styles.missionPlayBtn}>Lançar</Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* ────── AJUSTES DE ÁUDIO & EXPERIÊNCIA ────── */}
            <div className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2>Ajustes de Áudio & Experiência ⚙️</h2>
                <button className={styles.resetBtn} onClick={() => { playSFX('click'); resetSettings(); }}>
                  <RotateCcw size={14} /> Restaurar Padrão
                </button>
              </div>

              <div className={styles.settingsGrid}>
                {/* Mute Toggle */}
                <div className={`${styles.soundCard} ${isMuted ? styles.soundCardMuted : ''}`} onClick={toggleMute}>
                  <div className={styles.soundIcon}>
                    {isMuted ? <VolumeX /> : <Volume2 />}
                  </div>
                  <div className={styles.soundInfo}>
                    <span className={styles.soundTitle}>{isMuted ? 'Sons Desativados' : 'Sons Ativados'}</span>
                    <span className={styles.soundSub}>Toque para alternar silêncio total</span>
                  </div>
                  <div className={`${styles.toggle} ${!isMuted ? styles.active : ''}`}>
                    <div className={styles.toggleKnob} />
                  </div>
                </div>

                <div className={styles.slidersContainer}>
                  <div className={styles.controlGroup}>
                    <div className={styles.labelRow}>
                      <div className={styles.labelIcon}><Music size={16} /> Música de Fundo</div>
                      <span className={styles.percent}>{Math.round(bgVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="0.5" step="0.05"
                      value={bgVolume} disabled={isMuted}
                      onChange={(e) => setBgVolume(parseFloat(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.controlGroup}>
                    <div className={styles.labelRow}>
                      <div className={styles.labelIcon}><Headphones size={16} /> Efeitos Sonoros</div>
                      <span className={styles.percent}>{Math.round(sfxVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={sfxVolume} disabled={isMuted}
                      onChange={(e) => setSfxVolume(parseFloat(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.controlGroup}>
                    <div className={styles.labelRow}>
                      <div className={styles.labelIcon}><MessageSquare size={16} /> Narração</div>
                      <span className={styles.percent}>{Math.round(narrationVolume * 100)}%</span>
                    </div>
                    <input 
                      type="range" min="0" max="1" step="0.05"
                      value={narrationVolume} disabled={isMuted}
                      onChange={(e) => setNarrationVolume(parseFloat(e.target.value))}
                      className={styles.slider}
                    />
                  </div>

                  <div className={styles.controlGroup}>
                    <div className={styles.labelRow}>
                      <div className={styles.labelIcon}><Zap size={16} /> Velocidade da Voz</div>
                      <span className={styles.percent}>{narrationRate.toFixed(1)}x</span>
                    </div>
                    <input 
                      type="range" min="0.5" max="2" step="0.1"
                      value={narrationRate} disabled={isMuted}
                      onChange={(e) => setNarrationRate(parseFloat(e.target.value))}
                      className={styles.slider}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ────── CENTRO DE COMUNICAÇÕES ────── */}
            <div className={styles.section}>
              <div className={styles.commCenter}>
                <div className={styles.commHeader}>
                  <Bell className={styles.commIcon} size={24} />
                  <h3>Centro de Comunicações 🛰️</h3>
                </div>

                <div className={styles.categorySection}>
                  <h4>Missões & Aventuras</h4>
                  <div className={styles.categoryGrid}>
                    <div className={styles.catItem}>
                      <div className={styles.catInfo}>
                        <span className={styles.catLabel}>Retenção</span>
                        <span className={styles.catDesc}>Convites para voltar à jornada</span>
                      </div>
                      <button 
                        className={`${styles.pushToggle} ${notifSettings?.categories?.retention ? styles.pushToggleActive : ''}`}
                        onClick={() => toggleCategory('retention')}
                      >
                        <div className={styles.toggleCircle} />
                      </button>
                    </div>

                    <div className={styles.catItem}>
                      <div className={styles.catInfo}>
                        <span className={styles.catLabel}>Conquistas</span>
                        <span className={styles.catDesc}>Alertas de troféus e medalhas</span>
                      </div>
                      <button 
                        className={`${styles.pushToggle} ${notifSettings?.categories?.trophy ? styles.pushToggleActive : ''}`}
                        onClick={() => toggleCategory('trophy')}
                      >
                        <div className={styles.toggleCircle} />
                      </button>
                    </div>

                    <div className={styles.catItem}>
                      <div className={styles.catInfo}>
                        <span className={styles.catLabel}>Curiosidades</span>
                        <span className={styles.catDesc}>Fatos espaciais diários</span>
                      </div>
                      <button 
                        className={`${styles.pushToggle} ${notifSettings?.categories?.curiosity ? styles.pushToggleActive : ''}`}
                        onClick={() => toggleCategory('curiosity')}
                      >
                        <div className={styles.toggleCircle} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className={styles.categorySection}>
                  <h4>Janela de Lançamento (Horários)</h4>
                  <div className={styles.timeGrid}>
                    <div 
                      className={`${styles.timeItem} ${notifSettings?.active_hours?.morning ? styles.timeItemActive : ''}`}
                      onClick={() => toggleTime('morning')}
                    >
                      <span className={styles.timeLabel}>Manhã</span>
                      <span className={styles.timeRange}>09:00 - 11:00</span>
                    </div>
                    <div 
                      className={`${styles.timeItem} ${notifSettings?.active_hours?.afternoon ? styles.timeItemActive : ''}`}
                      onClick={() => toggleTime('afternoon')}
                    >
                      <span className={styles.timeLabel}>Tarde</span>
                      <span className={styles.timeRange}>14:00 - 18:00</span>
                    </div>
                    <div 
                      className={`${styles.timeItem} ${notifSettings?.active_hours?.evening ? styles.timeItemActive : ''}`}
                      onClick={() => toggleTime('evening')}
                    >
                      <span className={styles.timeLabel}>Noite</span>
                      <span className={styles.timeRange}>Até as 19:30</span>
                    </div>
                  </div>
                </div>

                <div className={styles.commFooter}>
                  <div className={styles.regStatus}>
                    <div className={`${styles.statusIcon} ${isSubscribed ? styles.statusIconActive : ''}`} />
                    <span>{isSubscribed ? 'Sinal Estelar Ativo' : 'Sinal Desconectado'}</span>
                  </div>
                  {!isSubscribed ? (
                    <button className={styles.regBtn} onClick={handleSubscribe}>
                      ATIVAR NOTIFICAÇÕES 🚀
                    </button>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
                      <button className={styles.regBtn} onClick={handleTestPush}>
                        TESTAR SINAL 📡
                      </button>
                      {testMessage.text && (
                        <span style={{ fontSize: '0.8rem', color: testMessage.type === 'error' ? '#f87171' : testMessage.type === 'success' ? '#34d399' : '#00f3ff' }}>
                          {testMessage.text}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* ── MODAL DE EDIÇÃO ────────────────────────────────── */}
      {isEditing && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h2>Atualizar Dados do Astronauta</h2>
              <button onClick={() => setIsEditing(false)} className={styles.closeBtn}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className={styles.modalForm}>
              <div className={styles.inputGrid}>
                <div className={styles.field}>
                  <label><User size={14} /> Nome Completo</label>
                  <input value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} placeholder="Seu nome" />
                </div>
                <div className={styles.field}>
                  <label><Hash size={14} /> Nick/Username</label>
                  <input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} placeholder="@nickname" />
                </div>
                <div className={styles.field}>
                  <label><School size={14} /> Escola</label>
                  <input value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} placeholder="Nome da instituição" />
                </div>
                <div className={styles.field}>
                  <label><Hash size={14} /> Turma</label>
                  <input value={formData.class_name} onChange={e => setFormData({...formData, class_name: e.target.value})} placeholder="Ex: 5º Ano A" />
                </div>
                <div className={styles.field}>
                  <label><Calendar size={14} /> Data de Nascimento</label>
                  <input type="date" value={formData.birth_date} onChange={e => setFormData({...formData, birth_date: e.target.value})} />
                </div>
              </div>

              {message.text && (
                <div className={`${styles.formMsg} ${styles[message.type]}`}>
                  {message.type === 'success' ? <CheckCircle2 size={16} /> : <X size={16} />}
                  {message.text}
                </div>
              )}

              <div className={styles.modalFooter}>
                <button type="button" className={styles.cancelBtn} onClick={() => setIsEditing(false)}>Cancelar</button>
                <button type="submit" className={styles.saveBtn}>
                  <Save size={16} />
                  Sincronizar Dados
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
