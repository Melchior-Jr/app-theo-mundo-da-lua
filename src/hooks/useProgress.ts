import { usePlayer } from '@/context/PlayerContext'

export interface ChapterProgress {
  chapter_id: string
  sub_step: string
  completed: boolean
}

export interface ExplorationLog {
  exploration_id: string
  xp_awarded: number
}

/**
 * useProgress Hook
 * Agora consome o PlayerContext para garantir cache global e evitar refetch a cada montagem de componente.
 */
export function useProgress() {
  const { 
    progress, 
    explorationLogs, 
    loading, 
    saveProgress, 
    saveExploration, 
    refreshData: fetchProgress 
  } = usePlayer()

  return { progress, explorationLogs, loading, saveProgress, saveExploration, fetchProgress }
}
