import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { useAchievement } from '@/context/AchievementContext'
import { TROPHIES } from '@/data/trophies'
import { calcLevel } from '@/utils/playerUtils'

export interface ChapterProgress {
  chapter_id: string
  sub_step: string
  completed: boolean
}

export interface ExplorationLog {
  exploration_id: string
  xp_awarded: number
}

interface PlayerContextType {
  playerData: any
  playerStats: any
  progress: any[]
  explorationLogs: any[]
  userTrophies: any[]
  gameStats: any[]
  loading: boolean
  refreshData: () => Promise<void>
  saveProgress: (chapter_id: string, sub_step: string, completed?: boolean) => Promise<void>
  saveExploration: (exploration_id: string, xp_to_award?: number) => Promise<void>
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined)

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { showAchievement } = useAchievement()
  
  const [playerData, setPlayerData] = useState<any>(null)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [progress, setProgress] = useState<any[]>([])
  const [explorationLogs, setExplorationLogs] = useState<any[]>([])
  const [userTrophies, setUserTrophies] = useState<any[]>([])
  const [gameStats, setGameStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPlayerData = useCallback(async () => {
    if (!user?.id) return

    try {
      // 1. Perfil e Estatísticas Globais
      const [profileRes, statsRes, progressRes, logsRes, trophiesRes, gamesRes] = await Promise.all([
        supabase.from('players').select('*').eq('id', user.id).single(),
        supabase.from('player_global_stats').select('*').eq('player_id', user.id).single(),
        supabase.from('player_chapter_progress').select('*').eq('player_id', user.id),
        supabase.from('player_exploration_logs').select('*').eq('player_id', user.id).order('created_at', { ascending: false }).limit(20),
        supabase.from('user_trophies').select('*').eq('user_id', user.id),
        supabase.from('player_game_stats').select('*, games(*)').eq('player_id', user.id)
      ])

      if (profileRes.data) setPlayerData(profileRes.data)
      if (statsRes.data) setPlayerStats(statsRes.data)
      if (progressRes.data) setProgress(progressRes.data)
      if (logsRes.data) setExplorationLogs(logsRes.data)
      if (trophiesRes.data) setUserTrophies(trophiesRes.data)
      if (gamesRes.data) setGameStats(gamesRes.data)

    } catch (e) {
      console.error('Error fetching player data:', e)
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (user?.id) {
      fetchPlayerData()
    } else {
      setPlayerData(null)
      setPlayerStats(null)
      setProgress([])
      setExplorationLogs([])
      setUserTrophies([])
      setGameStats([])
      setLoading(false)
    }
  }, [user?.id, fetchPlayerData])

  const saveProgress = async (chapter_id: string, sub_step: string, completed = false) => {
    if (!user?.id) return

    try {
      // 1. Update local state immediately (Optimistic)
      // Note: Logic adapted for new schema structure
      
      // 2. Persist to DB
      await supabase
        .from('player_chapter_progress')
        .upsert({
          player_id: user.id,
          chapter_id,
          sub_step,
          completed: completed,
          updated_at: new Date().toISOString()
        })

      // 3. Rewards if just completed
      if (completed) {
        await awardChapterRewards(chapter_id)
      }
    } catch (e) {
      console.error('Error saving progress:', e)
    }
  }

  const awardChapterRewards = async (chapterId: string) => {
    if (!user?.id) return

    const rewards: Record<string, { xp: number, trophyId: string }> = {
      'sistema-solar':        { xp: 500, trophyId: 'exp_first_chapter' },
      'movimentos-da-terra': { xp: 500, trophyId: 'exp_moon_module' },
      'constelaçoes':        { xp: 500, trophyId: 'exp_five_chapters' },
      'fases-da-lua':        { xp: 1000, trophyId: 'exp_all_chapters' }, 
    }

    const reward = rewards[chapterId]
    if (!reward) return

    try {
      // 1. Update Trophy
      await supabase.from('user_trophies').upsert({
        user_id: user.id,
        trophy_id: reward.trophyId,
        progress: 1,
        unlocked: true,
        unlocked_at: new Date().toISOString()
      }, { onConflict: 'user_id,trophy_id' })

      // 2. Atomic XP increment
      await supabase.rpc('increment_player_xp', {
        p_id: user.id,
        p_amount: reward.xp
      })

      // 3. Level Up and Trophy notification
      const oldXP = playerStats?.galactic_xp || 0
      const newXP = oldXP + reward.xp
      const oldLevel = calcLevel(oldXP)
      const newLevel = calcLevel(newXP)

      if (newLevel > oldLevel) {
        showAchievement({
          id: `level-up-${newLevel}`,
          type: 'level',
          title: `Nível ${newLevel}!`,
          description: `Parabéns! Você alcançou o nível ${newLevel}. Théo está impressionado! 🚀`,
          icon: '✨'
        })
      }

      const trophy = TROPHIES.find(t => t.id === reward.trophyId)
      if (trophy) {
        showAchievement({
          id: trophy.id,
          type: 'trophy',
          title: trophy.name,
          description: trophy.description,
          icon: trophy.icon,
          xpBonus: reward.xp
        })
      }

      fetchPlayerData()
    } catch (e) {
      console.error('Error awarding chapter rewards:', e)
    }
  }

  const saveExploration = async (exploration_id: string, xp_to_award: number = 10) => {
    if (!user?.id) return
    if (explorationLogs.some(e => e.exploration_id === exploration_id)) return

    try {
      // 1. Persist
      await supabase.from('player_exploration_logs').insert({
        player_id: user.id,
        exploration_id,
        xp_awarded: xp_to_award,
        created_at: new Date().toISOString()
      })

      // 2. Atomic XP
      await supabase.rpc('increment_player_xp', {
        p_id: user.id,
        p_amount: xp_to_award
      })

      // 3. Level Up detection
      const oldXP = playerStats?.galactic_xp || 0
      const newXP = oldXP + xp_to_award
      if (calcLevel(newXP) > calcLevel(oldXP)) {
        showAchievement({
          id: `level-up-${calcLevel(newXP)}`,
          type: 'level',
          title: `Nível ${calcLevel(newXP)}!`,
          description: `Nível ${calcLevel(newXP)} alcançado! Você está se tornando um mestre do espaço.`,
          icon: '🚀',
        })
      }

      fetchPlayerData()
    } catch (e) {
      console.error('Error saving exploration:', e)
    }
  }

  return (
    <PlayerContext.Provider value={{ 
      playerData, 
      playerStats, 
      progress, 
      explorationLogs, 
      userTrophies,
      gameStats,
      loading,
      refreshData: fetchPlayerData,
      saveProgress,
      saveExploration
    }}>
      {children}
    </PlayerContext.Provider>
  )
}

export const usePlayer = () => {
  const context = useContext(PlayerContext)
  if (context === undefined) {
    throw new Error('usePlayer must be used within a PlayerProvider')
  }
  return context
}
