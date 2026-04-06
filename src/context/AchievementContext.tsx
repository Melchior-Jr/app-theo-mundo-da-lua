import React, { createContext, useContext, useState, useCallback } from 'react'
import AchievementModal, { Achievement } from '@/components/AchievementModal'

interface AchievementContextType {
  showAchievement: (achievement: Achievement) => void
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined)

export function AchievementProvider({ children }: { children: React.ReactNode }) {
  const [currentAchievement, setCurrentAchievement] = useState<Achievement | null>(null)

  const showAchievement = useCallback((achievement: Achievement) => {
    setCurrentAchievement(achievement)
  }, [])

  const closeAchievement = useCallback(() => {
    setCurrentAchievement(null)
  }, [])

  return (
    <AchievementContext.Provider value={{ showAchievement }}>
      {children}
      {currentAchievement && (
        <AchievementModal 
          achievement={currentAchievement} 
          onClose={closeAchievement} 
        />
      )}
    </AchievementContext.Provider>
  )
}

export function useAchievement() {
  const context = useContext(AchievementContext)
  if (context === undefined) {
    throw new Error('useAchievement must be used within an AchievementProvider')
  }
  return context
}
