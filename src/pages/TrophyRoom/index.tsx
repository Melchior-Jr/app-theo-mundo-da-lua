import { useState, useEffect, useMemo } from 'react'
import {
  Trophy as TrophyIcon, Star, Zap, Medal, Crown, Lock,
  CheckCircle2, Target, Rocket, Compass, Brain,
  Heart, Search, HelpCircle
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTrophies } from '@/hooks/useTrophies'
import { TROPHIES, TrophyCategory } from '@/data/trophies'
import StarField from '@/components/StarField'
import { Navbar } from '@/components/Navbar'
import styles from './TrophyRoom.module.css'

// Mapeamento de Ícones
const ICON_MAP: Record<string, any> = {
  Rocket, Moon: Compass, Compass, MilkyWay: Crown,
  CheckCircle: CheckCircle2, Zap, Brain, Star,
  Target, Heart, User: Rocket, Medal, Crown, Search
}

const CATEGORY_LABELS: Record<TrophyCategory, string> = {
  exploracao: 'Exploração',
  quiz: 'Desafios Quiz',
  minigame: 'Mini Games',
  progresso: 'Carreira',
  desafio: 'Missões',
  secreto: 'Arquivos Secretos'
}

export default function TrophyRoom() {
  const { user } = useAuth()
  const { userTrophies, loading, fetchProgress } = useTrophies()
  const [activeTab, setActiveTab] = useState<'all' | TrophyCategory>('all')
  useEffect(() => {
    if (user?.id) fetchProgress()
  }, [user, fetchProgress])

  const stats = useMemo(() => {
    const total = TROPHIES.length
    const unlocked = userTrophies.filter(ut => ut.unlocked).length
    const progressText = `${unlocked} de ${total}`
    const percent = total > 0 ? Math.round((unlocked / total) * 100) : 0
    return { total, unlocked, progressText, percent }
  }, [userTrophies])

  const filteredTrophies = useMemo(() => {
    return TROPHIES.filter(t => {
      if (activeTab === 'all') return true
      return t.category === activeTab
    }).sort((a, b) => a.order - b.order)
  }, [activeTab])

  return (
    <div className={styles.page}>
      <div className={styles.decorContainer}>
        <StarField />
        {/* Nebulae */}
        <div className={styles.nebula1} aria-hidden="true" />
        <div className={styles.nebula2} aria-hidden="true" />
      </div>

      <Navbar />


      <div className={styles.content}>
        
        {/* ── HERO ──────────────────────────────────────── */}
        <section className={styles.hero}>
          <div className={styles.heroBadge}>
            <Star size={14} />
            <span>Suas Conquistas</span>
          </div>
          <h1 className={styles.heroTitle}>
            Galeria de<br /><span>Troféus</span>
          </h1>
          <p className={styles.heroSub}>
            Bem-vindo à sua prateleira de glória galáctica. Cada emblema aqui conta uma parte da sua história no universo do Théo.
          </p>

          <div className={styles.progressContainer}>
            <div className={styles.progressText}>
              <span>{stats.progressText} troféus</span>
              <span>{stats.percent}%</span>
            </div>
            <div className={styles.progressBar}>
              <div className={styles.progressFill} style={{ width: `${stats.percent}%` }} />
            </div>
          </div>
        </section>

        {/* ── CATEGORIES ────────────────────────────────── */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tabBtn} ${activeTab === 'all' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Todos
          </button>
          {(Object.entries(CATEGORY_LABELS) as [TrophyCategory, string][]).map(([key, label]) => (
            <button
              key={key}
              className={`${styles.tabBtn} ${activeTab === key ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(key)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* ── GRID ──────────────────────────────────────── */}
        {loading && userTrophies.length === 0 ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            Sincronizando prateleiras...
          </div>
        ) : (
          <div className={styles.trophyGrid}>
            {filteredTrophies.map((item, idx) => {
              const ut = userTrophies.find(t => t.trophy_id === item.id)
              const isUnlocked = !!ut?.unlocked
              const isSecret = item.category === 'secreto' && !isUnlocked
              const progressPct = Math.min(100, Math.round(((ut?.progress || 0) / item.goal) * 100))

              const Icon = isSecret ? HelpCircle : (ICON_MAP[item.icon] || TrophyIcon)

              return (
                <div 
                  key={item.id} 
                  className={`${styles.trophyCard} ${!isUnlocked ? styles.locked : ''} ${isSecret ? styles.secret : ''}`}
                  style={{ animationDelay: `${idx * 0.05}s` } as React.CSSProperties}
                >
                  <div className={styles.trophyIconWrap} style={{ '--rarity-color': getRarityColor(item.rarity) } as React.CSSProperties}>
                    <Icon size={32} className={styles.itemIcon} />
                    {!isUnlocked && !isSecret && (
                      <div className={styles.lockOverlay}>
                        <Lock size={16} />
                      </div>
                    )}
                  </div>
                  
                  <div className={styles.trophyBody}>
                    <div className={styles.trophyHeader}>
                      <h3 className={styles.trophyTitle}>{isSecret ? '???' : item.name}</h3>
                      {isUnlocked && <CheckCircle2 size={16} className={styles.unlockedIcon} />}
                      <span className={styles.rarityTag} style={{ color: getRarityColor(item.rarity) }}>
                        {item.rarity}
                      </span>
                    </div>
                    
                    <p className={styles.trophyDesc}>
                      {isSecret ? 'Um mistério escondido nas estrelas... continue explorando para descobrir!' : item.description}
                    </p>
                    
                    {!isUnlocked && !isSecret && item.progressType === 'contador' && (
                      <div className={styles.trophyProgress}>
                        <div className={styles.miniBar}><div className={styles.miniFill} style={{ width: `${progressPct}%` }} /></div>
                        <span className={styles.progressLabel}>{ut?.progress || 0} / {item.goal}</span>
                      </div>
                    )}

                    <div className={styles.trophyFooter}>
                      <span className={styles.rewardTag}>+{item.rewardXp} XP</span>
                      <span className={styles.categoryTag}>{CATEGORY_LABELS[item.category]}</span>
                    </div>
                  </div>

                  {/* Glass highlight effect */}
                  <div className={styles.glassReflection} />
                </div>
              )
            })}
          </div>
        )}
      </div>
      
      {/* ── FOOTER STATUS ────────────────────────────────── */}
      <footer className={styles.footer}>
        <div className={styles.footerStatus}>
          <div className={styles.statusDot} /> Explorador: {user?.user_metadata?.username || user?.user_metadata?.full_name || 'Anônimo'}
        </div>
        <p>© 2026 Théo no Mundo da Lua • Jornada Galáctica</p>
      </footer>
    </div>
  )
}

function getRarityColor(rarity: string) {
  switch (rarity) {
    case 'comum': return '#rgba(255,255,255,0.4)'
    case 'raro': return '#4b7bed'
    case 'epico': return '#8bf9ff'
    case 'lendario': return '#FFD166'
    default: return '#fff'
  }
}
