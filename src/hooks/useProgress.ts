import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'

export interface ChapterProgress {
  chapter_id: string
  sub_step: string
  completed: boolean
}

export function useProgress() {
  const { user } = useAuth()
  const [progress, setProgress] = useState<ChapterProgress[]>([])
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
      const { data } = await supabase
        .from('player_chapter_progress')
        .select('*')
        .eq('player_id', user?.id)

      if (data) setProgress(data)
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
      'sistema-solar':        { xp: 100, trophyId: 'exp_first_chapter' },
      'movimentos-da-terra': { xp: 150, trophyId: 'exp_moon_module' },
      'constelaçoes':        { xp: 200, trophyId: 'exp_five_chapters' },
      'fases-da-lua':        { xp: 250, trophyId: 'exp_all_chapters' }, // Just an example mapping
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

      // 2. Fetch current stats
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('galactic_xp, total_trophies')
        .eq('player_id', user.id)
        .single()

      if (stats) {
        await supabase
          .from('player_global_stats')
          .update({
            galactic_xp: (stats.galactic_xp || 0) + reward.xp,
            total_trophies: (stats.total_trophies || 0) + 1
          })
          .eq('player_id', user.id)
      }

      console.log(`✨ Recompensa de capítulo concedida: +${reward.xp} XP e Troféu!`)
    } catch (e) {
      console.error('Error awarding chapter rewards:', e)
    }
  }

  return { progress, loading, saveProgress, fetchProgress }
}
