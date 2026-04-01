import { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react'

interface SoundContextType {
  isMuted: boolean
  toggleMute: () => void
  setIsMuted: (muted: boolean) => void
  bgVolume: number
  setBgVolume: (vol: number) => void
  sfxVolume: number
  setSfxVolume: (vol: number) => void
  narrationVolume: number
  setNarrationVolume: (vol: number) => void
  playSFX: (sfx: 'correct' | 'wrong' | 'click'| 'success' | 'fail' | 'bonus') => void
  playBGMusic: () => void
  stopBGMusic: () => void
  playTrack: (src: string, volume?: number) => HTMLAudioElement | null
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

const STORAGE_KEY = 'theo-sound-settings'

export function SoundProvider({ children }: { children: ReactNode }) {
  // Carregar configurações iniciais
  const [settings] = useState(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch (e) {
        console.error('Erro ao carregar configurações de som', e)
      }
    }
    return {
      isMuted: false,
      bgVolume: 0.1,
      sfxVolume: 0.5,
      narrationVolume: 0.9
    }
  })

  const [isMuted, setIsMuted] = useState(settings.isMuted)
  const [bgVolumeInternal, setBgVolumeInternal] = useState(Math.min(settings.bgVolume, 0.5))
  const [sfxVolume, setSfxVolume] = useState(settings.sfxVolume)

  const setBgVolume = useCallback((vol: number) => {
    setBgVolumeInternal(Math.min(vol, 0.5))
  }, [])
  const [narrationVolume, setNarrationVolume] = useState(settings.narrationVolume)

  const bgAudioRef = useRef<HTMLAudioElement | null>(null)

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isMuted,
      bgVolume: bgVolumeInternal,
      sfxVolume,
      narrationVolume
    }))
  }, [isMuted, bgVolumeInternal, sfxVolume, narrationVolume])

  // Inicializar/Atualizar som ambiente
  useEffect(() => {
    if (!bgAudioRef.current) {
      const audio = new Audio('/audio/sfx/BG-Sound.mp3?v=2')
      audio.loop = true
      bgAudioRef.current = audio
    }
    
    bgAudioRef.current.volume = isMuted ? 0 : bgVolumeInternal
  }, [bgVolumeInternal, isMuted])

  const playBGMusic = useCallback(() => {
    if (bgAudioRef.current && !isMuted) {
      bgAudioRef.current.play().catch(err => console.warn('[SoundContext] Erro ao tocar BG Music:', err))
    }
  }, [isMuted])

  const stopBGMusic = useCallback(() => {
    if (bgAudioRef.current) {
      bgAudioRef.current.pause()
      bgAudioRef.current.currentTime = 0
    }
  }, [])

  // Sincronizar play/pause do som ambiente com o mute
  useEffect(() => {
    if (bgAudioRef.current) {
      if (isMuted) {
        bgAudioRef.current.pause()
      } else if (!bgAudioRef.current.paused) {
        bgAudioRef.current.play().catch(() => {})
      }
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev)
  }, [])

  const playSFX = useCallback((sfx: string) => {
    if (isMuted) return

    const audioMap: Record<string, string> = {
      correct: '/audio/sfx/correct.mp3',
      wrong: '/audio/sfx/wrong.mp3',
      click: '/audio/sfx/click.mp3',
      success: '/audio/sfx/success.mp3',
      fail: '/audio/sfx/fail.mp3',
      bonus: '/audio/sfx/bonus.mp3',
    }

    const src = audioMap[sfx]
    if (src) {
      const encodedSrc = encodeURI(src)
      const audio = new Audio(encodedSrc)
      audio.volume = sfxVolume
      audio.play().catch(err => console.warn('[SoundContext] Erro ao tocar SFX:', err))
    }
  }, [isMuted, sfxVolume])
  
  const playTrack = useCallback((src: string, overrideVolume?: number) => {
    if (isMuted || !src) return null
    const encodedSrc = encodeURI(src)
    const audio = new Audio(encodedSrc)
    // Se passar um volume específico usamos ele pro rata de narrationVolume
    // ou se não passar usamos o narrationVolume base
    audio.volume = overrideVolume !== undefined ? (overrideVolume * narrationVolume) : narrationVolume
    audio.play().catch(err => console.warn('[SoundContext] Erro ao tocar Track:', err))
    return audio
  }, [isMuted, narrationVolume])

  return (
    <SoundContext.Provider value={{ 
      isMuted, toggleMute, setIsMuted, 
      bgVolume: bgVolumeInternal, setBgVolume,
      sfxVolume, setSfxVolume,
      narrationVolume, setNarrationVolume,
      playSFX, playBGMusic, stopBGMusic, playTrack 
    }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    return {
      isMuted: true,
      toggleMute: () => {},
      setIsMuted: () => {},
      bgVolume: 0,
      setBgVolume: () => {},
      sfxVolume: 0,
      setSfxVolume: () => {},
      narrationVolume: 0,
      setNarrationVolume: () => {},
      playSFX: () => {},
      playBGMusic: () => {},
      stopBGMusic: () => {},
      playTrack: () => null
    }
  }
  return context
}
