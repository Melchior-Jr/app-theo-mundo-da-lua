import { createContext, useContext, useState, useLayoutEffect, useCallback, ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { Narration } from '@/data/narration'

export type FloatingPosition = 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft'

interface NarrationSequenceContextType {
  canStartLocal: boolean
  setCanStartLocal: (can: boolean) => void
  activeNarration: Narration | null
  setActiveNarration: (n: Narration | null) => void
  narrationKey: number
  themeColor: string
  setThemeColor: (c: string) => void
  onNarrationFinish?: () => void
  setOnNarrationFinish: (fn: (() => void) | undefined) => void
  floatingPosition: FloatingPosition
  setFloatingPosition: (pos: FloatingPosition) => void
  funFact: string | null
  setFunFact: (fact: string | null) => void
  narrationPhase: 'main' | 'curiosity'
  setNarrationPhase: (phase: 'main' | 'curiosity') => void
  isCuriosityPlaying: boolean
  setIsCuriosityPlaying: (playing: boolean) => void
  currentTime: number
  setCurrentTime: (time: number) => void
  viewedPlanets: string[]
  addViewedPlanet: (id: string) => void
  skipAttempts: number
  setSkipAttempts: (n: number) => void
  nextButtonEffect: boolean
  setNextButtonEffect: (val: boolean) => void
  isGlobalLoading: boolean
  setIsGlobalLoading: (loading: boolean) => void
}

const NarrationSequenceContext = createContext<NarrationSequenceContextType | undefined>(undefined)

export function NarrationSequenceProvider({ children }: { children: ReactNode }) {
  const [canStartLocal, setCanStartLocal] = useState(false)
  const [activeNarration, setActiveNarrationState] = useState<Narration | null>(null)
  const [narrationKey, setNarrationKey] = useState(0)
  const [themeColor, setThemeColor] = useState('#FFD166')
  const [onNarrationFinish, setOnNarrationFinish] = useState<(() => void) | undefined>(undefined)
  const [floatingPosition, setFloatingPosition] = useState<FloatingPosition>('bottomRight')
  const [funFact, setFunFact] = useState<string | null>(null)
  const [narrationPhase, setNarrationPhase] = useState<'main' | 'curiosity'>('main')
  const [isCuriosityPlaying, setIsCuriosityPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [viewedPlanets, setViewedPlanets] = useState<string[]>([])
  const [skipAttempts, setSkipAttempts] = useState(0)
  const [nextButtonEffect, setNextButtonEffect] = useState(false)
  const [isGlobalLoading, setIsGlobalLoading] = useState(true)

  const location = useLocation()

  // Resetar o estado toda vez que o destino mudar na URL
  useLayoutEffect(() => {
    setCanStartLocal(false)
    setActiveNarrationState(null)
    setOnNarrationFinish(undefined)
    setFunFact(null)
    setNarrationPhase('main')
    setIsCuriosityPlaying(false)
    setCurrentTime(0)
    setViewedPlanets([])
    setSkipAttempts(0)
    setNextButtonEffect(false)
  }, [location.pathname])

  const setActiveNarration = useCallback((n: Narration | null) => {
    setActiveNarrationState(prev => {
      // Se for a mesma narração (mesmo ID), não reseta o áudio
      if (prev?.id === n?.id && n !== null) {
        return prev
      }

      // Se estamos mudando para uma nova narração ou limpando (null)
      if (n !== null) {
        setNarrationKey(k => k + 1)
        setCurrentTime(0)
      }
      
      return n
    })
  }, [])

  const addViewedPlanet = useCallback((id: string) => {
    setViewedPlanets(prev => prev.includes(id) ? prev : [...prev, id])
  }, [])

  return (
    <NarrationSequenceContext.Provider value={{ 
      canStartLocal, 
      setCanStartLocal,
      activeNarration,
      setActiveNarration,
      narrationKey,
      themeColor,
      setThemeColor,
      onNarrationFinish,
      setOnNarrationFinish,
      floatingPosition,
      setFloatingPosition,
      funFact,
      setFunFact,
      narrationPhase,
      setNarrationPhase,
      isCuriosityPlaying,
      setIsCuriosityPlaying,
      currentTime,
      setCurrentTime,
      viewedPlanets,
      addViewedPlanet,
      skipAttempts,
      setSkipAttempts,
      nextButtonEffect,
      setNextButtonEffect,
      isGlobalLoading,
      setIsGlobalLoading
    }}>
      {children}
    </NarrationSequenceContext.Provider>
  )
}

export function useNarrationSequence() {
  const context = useContext(NarrationSequenceContext)
  if (!context) {
    return { 
      canStartLocal: false, 
      setCanStartLocal: () => {},
      activeNarration: null,
      setActiveNarration: () => {},
      narrationKey: 0,
      themeColor: '#FFD166',
      setThemeColor: () => {},
      onNarrationFinish: undefined,
      setOnNarrationFinish: () => {},
      floatingPosition: 'bottomRight' as FloatingPosition,
      setFloatingPosition: () => {},
      funFact: null as string | null,
      setFunFact: () => {},
      narrationPhase: 'main' as 'main' | 'curiosity',
      setNarrationPhase: () => {},
      isCuriosityPlaying: false,
      setIsCuriosityPlaying: () => {},
      currentTime: 0,
      setCurrentTime: () => {},
      viewedPlanets: [] as string[],
      addViewedPlanet: () => {},
      skipAttempts: 0,
      setSkipAttempts: () => {},
      nextButtonEffect: false,
      setNextButtonEffect: () => {},
      isGlobalLoading: true,
      setIsGlobalLoading: () => {},
    }
  }
  return context
}
