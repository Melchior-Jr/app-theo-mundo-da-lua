import { supabase } from '@/lib/supabase'

/**
 * Service to handle player progression, streaks, and miscellaneous XP rewards (sharing, consistency)
 */
export const ProgressionService = {
  /**
   * Records a sharing action and awards XP
   */
  async recordShare(userId: string, platform: string = 'generic') {
    if (!userId) return

    try {
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('galactic_xp')
        .eq('player_id', userId)
        .single()

      const currentXp = stats?.galactic_xp || 0
      const shareBonus = 100 // XP award for sharing

      await supabase
        .from('player_global_stats')
        .update({
          galactic_xp: currentXp + shareBonus,
          updated_at: new Date().toISOString()
        })
        .eq('player_id', userId)

      console.log(`[ProgressionService] Awarded ${shareBonus} XP for sharing on ${platform}`)
      return { success: true, awardedXp: shareBonus }
    } catch (err) {
      console.error('[ProgressionService] Share reward error:', err)
      return { success: false }
    }
  },

  /**
   * Updates and checks the daily streak, awarding XP if it's a new day
   */
  async updateDailyStreak(userId: string) {
    if (!userId) return

    try {
      const { data: stats } = await supabase
        .from('player_global_stats')
        .select('galactic_xp, streak_days, last_activity_at')
        .eq('player_id', userId)
        .single()

      if (!stats) return

      const now = new Date()
      const lastActivity = stats.last_activity_at ? new Date(stats.last_activity_at) : null
      let newStreak = stats.streak_days || 0
      let xpBonus = 0

      if (!lastActivity) {
        // First activity ever
        newStreak = 1
        xpBonus = 50
      } else {
        const diffInHours = (now.getTime() - lastActivity.getTime()) / (1000 * 60 * 60)
        
        if (diffInHours < 24 && now.getDate() === lastActivity.getDate()) {
          // Already played today, no new streak bonus
          return { alreadyAwarded: true, streak: newStreak }
        } else if (diffInHours < 48) {
          // Played yesterday, increment streak
          newStreak += 1
          // Exponential bonus for streak? Let's keep it simple: 50 * streak (capped)
          xpBonus = Math.min(1000, 50 * newStreak)
        } else {
          // Break streak
          newStreak = 1
          xpBonus = 50
        }
      }

      await supabase
        .from('player_global_stats')
        .update({
          galactic_xp: (stats.galactic_xp || 0) + xpBonus,
          streak_days: newStreak,
          last_activity_at: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('player_id', userId)

      console.log(`[ProgressionService] Streak updated: ${newStreak} days. Awarded ${xpBonus} XP.`)
      return { success: true, streak: newStreak, awardedXp: xpBonus }
    } catch (err) {
      console.error('[ProgressionService] Streak error:', err)
      return { success: false }
    }
  }
}
