import { supabase } from '@/lib/supabase'
import { TROPHIES } from '@/data/trophies'

/**
 * Service to handle trophy progression from any context (Game Engine, Hooks, etc.)
 */
export const TrophyService = {
  /**
   * Updates trophy progress and handles unlocking logic
   */
  async updateProgress(userId: string, trophyId: string, amount: number, isDirect = false) {
    if (!userId) return

    const trophyDef = TROPHIES.find(t => t.id === trophyId)
    if (!trophyDef) return

    try {
      // 1. Fetch current progress
      const { data: current } = await supabase
        .from('user_trophies')
        .select('*')
        .match({ user_id: userId, trophy_id: trophyId })
        .maybeSingle()

      if (current?.unlocked) return

      const oldProgress = current?.progress || 0
      const newProgress = isDirect ? amount : oldProgress + amount
      const isNowUnlocked = newProgress >= trophyDef.goal

      // 2. Save progress
      const { error: upsertError } = await supabase
        .from('user_trophies')
        .upsert({
          user_id: userId,
          trophy_id: trophyId,
          progress: newProgress,
          unlocked: isNowUnlocked,
          unlocked_at: isNowUnlocked ? new Date().toISOString() : undefined
        }, { onConflict: 'user_id,trophy_id' })

      if (upsertError) throw upsertError

      // 3. Handle Unlock Rewards
      if (isNowUnlocked) {
        await this.awardUnlockRewards(userId, trophyDef)
      }

      return { unlocked: isNowUnlocked, progress: newProgress }
    } catch (err) {
      console.error(`[TrophyService] Error updating ${trophyId}:`, err)
    }
  },

  /**
   * Internal helper to award XP and update global stats
   */
  async awardUnlockRewards(userId: string, trophy: any) {
    try {
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('galactic_xp, total_trophies')
        .eq('player_id', userId)
        .single()

      const currentXp = stats?.galactic_xp || 0
      const currentTotal = stats?.total_trophies || 0

      await supabase
        .from('player_global_stats')
        .update({
          galactic_xp: currentXp + trophy.rewardXp + 250, // Added requested 250 XP per trophy
          total_trophies: currentTotal + 1
        })
        .eq('player_id', userId)

      // Event for UI notification could be dispatched here
      window.dispatchEvent(new CustomEvent('TROPHY_UNLOCKED', { 
        detail: { trophy } 
      }))
    } catch (err) {
      console.error('[TrophyService] Reward error:', err)
    }
  }
}
