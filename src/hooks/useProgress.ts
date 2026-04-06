import { useState, useEffect } from 'react'
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
  exploration_id: string // e.g. 'planet-mercurio-viewed'
  xp_awarded: number
}

export function useProgress() {
  const { user } = useAuth()
  const { showAchievement } = useAchievement()
  const [progress, setProgress] = useState<ChapterProgress[]>([])
  const [exploration, setExploration] = useState<ExplorationLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user?.id) {
      fetchProgress()
    } else {
      setLoading(false)
    }
  }, [user])

  const fetchProgress = async () => {
    try {
      const { data: pData } = await supabase
        .from('player_chapter_progress')
        .select('*')
        .eq('player_id', user?.id)

      if (pData) setProgress(pData)

      const { data: eData } = await supabase
        .from('player_exploration_logs')
        .select('exploration_id, xp_awarded')
        .eq('player_id', user?.id)

      if (eData) setExploration(eData)
    } catch (e) {
      console.error('Error fetching progress:', e)
    } finally {
      setLoading(false)
    }
  }

  const saveProgress = async (chapter_id: string, sub_step: string, completed = false) => {
    if (!user?.id) return

    try {
      // 1. Update local state
      const existing = progress.find(p => p.chapter_id === chapter_id)
      if (existing) {
        if (existing.completed && !completed) {
           // Don't downgrade from completed to not completed usually
        } else {
           setProgress(prev => prev.map(p => p.chapter_id === chapter_id ? { ...p, sub_step, completed: p.completed || completed } : p))
        }
      } else {
        setProgress(prev => [...prev, { chapter_id, sub_step, completed }])
      }

      // 2. Persist to DB
      await supabase
        .from('player_chapter_progress')
        .upsert({
          player_id: user.id,
          chapter_id,
          sub_step,
          completed: (existing?.completed || completed),
          updated_at: new Date().toISOString()
        })

      // 3. Rewards if just completed
      if (completed && (!existing || !existing.completed)) {
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
      // 1. Update Trophy Progress (or Unlock)
      // For these, we consider one-time unlock (meta: 1)
      await supabase.from('user_trophies').upsert({
        user_id: user.id,
        trophy_id: reward.trophyId,
        progress: 1,
        unlocked: true,
        unlocked_at: new Date().toISOString()
      }, { onConflict: 'user_id,trophy_id' })

      // 2. Increment global XP using atomic RPC
      const { error: rpcError } = await supabase.rpc('increment_player_xp', {
        p_id: user.id,
        p_amount: reward.xp
      })

      if (rpcError) throw rpcError

      // 2.3 Level Up Detection
      const { data: statsBefore } = await supabase
        .from('player_global_stats')
        .select('galactic_xp')
        .eq('player_id', user.id)
        .single()
      
      const currentXP = statsBefore?.galactic_xp || 0
      const oldLevel = calcLevel(currentXP)
      const newLevel = calcLevel(currentXP + reward.xp)

      if (newLevel > oldLevel) {
        showAchievement({
          id: `level-up-${newLevel}`,
          type: 'level',
          title: `Nível ${newLevel}!`,
          description: `Parabéns! Você alcançou o nível ${newLevel}. Théo está impressionado com seu progresso! 🚀✨`,
          icon: '✨',
          xpBonus: 0
        })
      }

      // 2.5 Show Trophy Achievement
      const trophy = TROPHIES.find(t => t.id === reward.trophyId)
      if (trophy) {
        showAchievement({
          id: trophy.id,
          type: 'trophy',
          title: trophy.name,
          description: trophy.description,
          icon: trophy.icon, // Assumindo que o ícone é compatível com o span.icon do modal
          xpBonus: reward.xp
        })
      }

      // 3. Update total trophies count in stats
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('total_trophies')
        .eq('player_id', user.id)
        .single()

      if (stats) {
        await supabase
          .from('player_global_stats')
          .update({
            total_trophies: (stats.total_trophies || 0) + 1
          })
          .eq('player_id', user.id)
      }

      console.log(`✨ Recompensa de capítulo concedida: +${reward.xp} XP e Troféu!`)
    } catch (e) {
      console.error('Error awarding chapter rewards:', e)
    }
  }

  const saveExploration = async (exploration_id: string, xp_to_award: number = 10) => {
    if (!user?.id) return

    // 1. Check if already explored
    const exists = exploration.some(e => e.exploration_id === exploration_id)
    if (exists) return

    try {
      // 2. Persist to DB
      const { error } = await supabase
        .from('player_exploration_logs')
        .insert({
          player_id: user.id,
          exploration_id,
          xp_awarded: xp_to_award,
          created_at: new Date().toISOString()
        })

      if (error) throw error

      // 3. Update local state
      setExploration(prev => [...prev, { exploration_id, xp_awarded: xp_to_award }])

      // 4. Update global XP using atomic RPC
      const { error: rpcError } = await supabase.rpc('increment_player_xp', {
        p_id: user.id,
        p_amount: xp_to_award
      })

      if (rpcError) throw rpcError

      // 4.5 Level Up Detection (for exploration)
      const { data: statsBefore } = await supabase
        .from('player_global_stats')
        .select('galactic_xp')
        .eq('player_id', user.id)
        .single()
      
      const currentXP = statsBefore?.galactic_xp || 0
      const oldLevel = calcLevel(currentXP)
      const newLevel = calcLevel(currentXP + xp_to_award)

      if (newLevel > oldLevel) {
        showAchievement({
          id: `level-up-${newLevel}`,
          type: 'level',
          title: `Nível ${newLevel}!`,
          description: `Nível ${newLevel} alcançado! Você está se tornando um mestre do espaço.`,
          icon: '🚀',
        })
      }

      console.log(`🗺️ Exploração descoberta: ${exploration_id} (+${xp_to_award} XP)`)
    } catch (e) {
      console.error('Error saving exploration:', e)
    }
  }

  return { progress, exploration, loading, saveProgress, saveExploration, fetchProgress }
}
