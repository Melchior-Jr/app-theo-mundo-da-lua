import React from 'react'
import { X, CheckCircle2, Circle, Star, Target, Info } from 'lucide-react'
import { ChapterMissions, Mission } from '@/data/missions'
import styles from './MissionsModal.module.css'

interface MissionsModalProps {
  isOpen: boolean
  onClose: () => void
  chapterMissions: ChapterMissions
  explorationLogs: any[]
  isChapterCompleted: boolean
  chapterColor: string
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  isOpen,
  onClose,
  chapterMissions,
  explorationLogs,
  isChapterCompleted,
  chapterColor
}) => {
  if (!isOpen) return null

  // Função para verificar se uma missão específica foi concluída
  const checkMissionStatus = (mission: Mission) => {
    if (mission.id === 'completion') return isChapterCompleted

    const logs = explorationLogs.filter(log => {
      // Normaliza para comparação (remove acentos e caracteres especiais para segurança)
      const id = log.exploration_id.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
      if (chapterMissions.chapterId === 'sistema-solar') {
        if (mission.id === 'view-planet') return id.startsWith('view-planet-')
        if (mission.id === 'interact-3d') return id.startsWith('interact-3d-')
        if (mission.id === 'stat-detail') return id.startsWith('stat-detail-')
        if (mission.id === 'theo-bulb') return id.startsWith('theo-bulb-')
      }
      if (chapterMissions.chapterId === 'movimentos-da-terra') {
        if (mission.id === 'view-motion') return id.startsWith('view-motion-')
        if (mission.id === 'interact-motion-3d') return id.startsWith('interact-motion-3d-')
        if (mission.id === 'motion-detail') return id.startsWith('motion-detail-')
      }
      if (chapterMissions.chapterId === 'constelaçoes') {
        if (mission.id === 'view-constellation') return id.startsWith('view-constellation-')
        if (mission.id === 'reveal-constellation') return id.startsWith('reveal-constellation-')
        if (mission.id === 'const-intro-guide') return id.startsWith('const-intro-guide-')
      }
      if (chapterMissions.chapterId === 'fases-da-lua') {
        if (mission.id === 'view-moon-phase') return id.startsWith('view-moon-phase-')
      }
      return false
    })

    // Lógica de contagem para missões cumulativas
    if (chapterMissions.chapterId === 'sistema-solar') {
      if (mission.id === 'view-planet') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 8, progress: `${count}/8` }
      }
      if (mission.id === 'interact-3d') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 8, progress: `${count}/8` }
      }
      if (mission.id === 'stat-detail') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 32, progress: `${count}/32` }
      }
      if (mission.id === 'share-planet') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 8, progress: `${count}/8` }
      }
    }
    
    if (chapterMissions.chapterId === 'movimentos-da-terra') {
      if (mission.id === 'view-motion') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 2, progress: `${count}/2` }
      }
      if (mission.id === 'interact-motion-3d') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 2, progress: `${count}/2` }
      }
      if (mission.id === 'motion-detail') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 8, progress: `${count}/8` }
      }
    }
    
    if (chapterMissions.chapterId === 'constelaçoes') {
      if (mission.id === 'view-constellation') {
        const count = new Set(logs.map(l => l.exploration_id)).size
        return { completed: count >= 10, progress: `${count}/10` }
      }
    }

    return logs.length > 0
  }

  const getStatus = (mission: Mission) => {
    const result = checkMissionStatus(mission)
    if (typeof result === 'object') return result
    return { completed: result, progress: null }
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={e => e.stopPropagation()}
        style={{ '--accent-color': chapterColor } as React.CSSProperties}
      >
        <header className={styles.header}>
          <div className={styles.titleGroup}>
            <div className={styles.iconBox}>
              <Target className={styles.headerIcon} />
            </div>
            <div>
              <h2 className={styles.title}>Missões de Exploração</h2>
              <p className={styles.subtitle}>Complete as tarefas para ganhar XP total</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={24} />
          </button>
        </header>

        <div className={styles.content}>
          <div className={styles.missionList}>
            {chapterMissions.missions.map((mission) => {
              const { completed, progress } = getStatus(mission)
              return (
                <div 
                  key={mission.id} 
                  className={`${styles.missionItem} ${completed ? styles.completed : ''}`}
                >
                  <div className={styles.statusIcon}>
                    {completed ? (
                      <CheckCircle2 className={styles.checkIcon} />
                    ) : (
                      <Circle className={styles.circleIcon} />
                    )}
                  </div>
                  <div className={styles.missionInfo}>
                    <span className={styles.description}>{mission.description}</span>
                    {progress && <span className={styles.progressText}>{progress}</span>}
                  </div>
                  <div className={styles.xpBadge}>
                    <Star size={12} className={styles.starIcon} />
                    <span>+{mission.xp} XP</span>
                  </div>
                </div>
              )
            })}
          </div>

          <div className={styles.infoBox}>
            <Info size={16} className={styles.infoIcon} />
            <p>Dica: Explore cada detalhe dos cenários para desbloquear todas as recompensas!</p>
          </div>
        </div>
      </div>
    </div>
  )
}
