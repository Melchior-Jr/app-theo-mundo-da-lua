import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import { TROPHIES } from '@/data/trophies'

export interface UserTrophy {
  trophy_id: string
  progress: number
  unlocked: boolean
  unlocked_at?: string
}

export function useTrophies() {
  const { user } = useAuth()
  const [userTrophies, setUserTrophies] = useState<UserTrophy[]>([])
  const [loading, setLoading] = useState(false)

  // Busca o progresso do usuário no banco
  const fetchProgress = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('user_trophies')
        .select('*')
        .eq('user_id', user.id)

      if (error) throw error
      setUserTrophies(data || [])
    } catch (err) {
      console.error('Error fetching trophies:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  // Atualiza ou incrementa o progresso de um troféu
  const updateTrophyProgress = useCallback(async (trophyId: string, amountOrValue: number, isDirectValue = false) => {
    if (!user) return

    const trophyDef = TROPHIES.find(t => t.id === trophyId)
    if (!trophyDef) return

    // Busca estado atual localmente para evitar hits excessivos no banco
    const current = userTrophies.find(t => t.trophy_id === trophyId)
    if (current?.unlocked) return // Já desbloqueado, nada a fazer

    const oldProgress = current?.progress || 0
    const newProgress = isDirectValue ? amountOrValue : oldProgress + amountOrValue

    // Verifica se desbloqueou AGORA
    const isNowUnlocked = newProgress >= trophyDef.goal

    try {
      // 1. Atualiza user_trophies
      const { error: upsertError } = await supabase
        .from('user_trophies')
        .upsert({
          user_id: user.id,
          trophy_id: trophyId,
          progress: newProgress,
          unlocked: isNowUnlocked,
          unlocked_at: isNowUnlocked ? new TrophyDate().toISOString() : undefined
        }, { onConflict: 'user_id,trophy_id' })

      if (upsertError) throw upsertError

      // 2. Se desbloqueou, premia com XP e incrementa contador global
      if (isNowUnlocked) {
        // Busca stats atuais
        const { data: stats } = await supabase
          .from('player_global_stats')
          .select('galactic_xp, total_trophies')
          .eq('player_id', user.id)
          .single()

        const currentXp = stats?.galactic_xp || 0
        const currentTotal = stats?.total_trophies || 0

        await supabase
          .from('player_global_stats')
          .update({
            galactic_xp: currentXp + trophyDef.rewardXp,
            total_trophies: currentTotal + 1
          })
          .eq('player_id', user.id)

        // TODO: Disparar evento global de UI para notificação (toast/modal)
        console.log(`🏆 Troféu desbloqueado: ${trophyDef.name}! +${trophyDef.rewardXp} XP`)
      }

      // Atualiza estado local
      await fetchProgress()

      return isNowUnlocked
    } catch (err) {
      console.error('Error updating trophy:', err)
    }
  }, [user, userTrophies, fetchProgress])

  return {
    userTrophies,
    loading,
    fetchProgress,
    updateTrophyProgress
  }
}

// Pequeno hack para lidar com o erro de compilação do TrophyDate (New Date)
const TrophyDate = Date
