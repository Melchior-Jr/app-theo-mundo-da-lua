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
  playSFX: (sfx: 'correct' | 'wrong' | 'click'| 'success' | 'fail' | 'bonus' | 'flipCard') => void
  playBGMusic: () => void
  stopBGMusic: () => void
  playTrack: (src: string, volume?: number) => HTMLAudioElement | null
  registerActiveTrack: (audio: HTMLAudioElement) => void
  unregisterActiveTrack: (audio: HTMLAudioElement) => void
  narrationRate: number
  setNarrationRate: (rate: number) => void
  resetSettings: () => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

const STORAGE_KEY = 'theo-sound-settings'

const DEFAULT_SETTINGS = {
  isMuted: false,
  bgVolume: 0.05,
  sfxVolume: 0.5,
  narrationVolume: 0.9,
  narrationRate: 1.0
}

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
    return DEFAULT_SETTINGS
  })

  const [isMuted, setIsMuted] = useState(settings.isMuted)
  const [bgVolumeInternal, setBgVolumeInternal] = useState(Math.min(settings.bgVolume, 0.5))
  const [sfxVolume, setSfxVolume] = useState(settings.sfxVolume)

  const setBgVolume = useCallback((vol: number) => {
    setBgVolumeInternal(Math.min(vol, 0.5))
  }, [])
  const [narrationVolume, setNarrationVolume] = useState(settings.narrationVolume)
  const [narrationRate, setNarrationRate] = useState(settings.narrationRate || 1.0)

  const bgAudioRef = useRef<HTMLAudioElement | null>(null)
  const activeTracksRef = useRef<Set<HTMLAudioElement>>(new Set())
  const isBgPlaying = useRef(false) // Rastreia se a música deve estar ativa
  const isBgPlayingWhenHidden = useRef(false)
  const pausedTracksWhenHidden = useRef<Set<HTMLAudioElement>>(new Set())

  // Visibility Change Detection (Auto-Pause/Resume)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const isHidden = document.hidden
      
      if (isHidden) {
        // Salvar estado atual antes de pausar
        isBgPlayingWhenHidden.current = bgAudioRef.current ? !bgAudioRef.current.paused : false
        
        pausedTracksWhenHidden.current.clear()
        activeTracksRef.current.forEach((audio: HTMLAudioElement) => {
          if (!audio.paused) {
            pausedTracksWhenHidden.current.add(audio)
            audio.pause()
          }
        })

        if (bgAudioRef.current) bgAudioRef.current.pause()
        
        // Também pausar fala sintética
        if (window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.pause()
        }
      } else {
        // Resumar apenas se não estiver mutado
        if (!isMuted) {
          if (isBgPlayingWhenHidden.current && bgAudioRef.current) {
            bgAudioRef.current.play().catch(() => {})
          }
          
          pausedTracksWhenHidden.current.forEach(audio => {
            try {
              audio.play().catch(() => {})
            } catch (e) {}
          })
          pausedTracksWhenHidden.current.clear()

          // Resumar fala sintética
          if (window.speechSynthesis && window.speechSynthesis.paused) {
            window.speechSynthesis.resume()
          }
        }
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isMuted])

  // Salvar no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      isMuted,
      bgVolume: bgVolumeInternal,
      sfxVolume,
      narrationVolume,
      narrationRate
    }))
  }, [isMuted, bgVolumeInternal, sfxVolume, narrationVolume, narrationRate])

  // Inicializar/Atualizar som ambiente
  useEffect(() => {
    if (!bgAudioRef.current) {
      const audio = new Audio('/audio/sfx/bg-Rocklofi.mp3')
      audio.loop = true
      bgAudioRef.current = audio
    }
    
    bgAudioRef.current.volume = isMuted ? 0 : bgVolumeInternal
  }, [bgVolumeInternal, isMuted])

  const playBGMusic = useCallback(() => {
    isBgPlaying.current = true
    if (bgAudioRef.current && !isMuted) {
      bgAudioRef.current.play().catch(err => console.warn('[SoundContext] Erro ao tocar BG Music:', err))
    }
  }, [isMuted])

  const stopBGMusic = useCallback(() => {
    isBgPlaying.current = false
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
      } else if (isBgPlaying.current) {
        bgAudioRef.current.play().catch(() => {})
      }
    }
  }, [isMuted])

  const toggleMute = useCallback(() => {
    setIsMuted((prev: boolean) => !prev)
  }, [])

  const playSFX = useCallback((sfx: string) => {
    if (isMuted || document.hidden) return

    const audioMap: Record<string, string> = {
      correct: '/audio/sfx/correct.mp3',
      wrong: '/audio/sfx/wrong.mp3',
      click: '/audio/sfx/click.mp3',
      success: '/audio/sfx/success.mp3',
      fail: '/audio/sfx/fail.mp3',
      bonus: '/audio/sfx/bonus.mp3',
      flipCard: '/audio/sfx/flipCard.mp3',
    }

    const src = audioMap[sfx]
    if (src) {
      const encodedSrc = encodeURI(src)
      const audio = new Audio(encodedSrc)
      audio.volume = sfxVolume
      
      activeTracksRef.current.add(audio)
      audio.onended = () => activeTracksRef.current.delete(audio)
      
      audio.play().catch(err => {
        console.warn('[SoundContext] Erro ao tocar SFX:', err)
        activeTracksRef.current.delete(audio)
      })
    }
  }, [isMuted, sfxVolume])
  
  const playTrack = useCallback((src: string, overrideVolume?: number) => {
    if (!src || document.hidden) return null
    const encodedSrc = encodeURI(src)
    const audio = new Audio(encodedSrc)
    audio.volume = isMuted ? 0 : (overrideVolume !== undefined ? (overrideVolume * narrationVolume) : narrationVolume)
    
    // Adicionar aos tracks ativos para controle de visibilidade
    activeTracksRef.current.add(audio)
    audio.onended = () => activeTracksRef.current.delete(audio)

    if (!isMuted) {
      audio.play().catch(err => {
        console.warn('[SoundContext] Erro ao tocar Track:', err)
        activeTracksRef.current.delete(audio)
      })
    }
    
    return audio
  }, [isMuted, narrationVolume])

  const registerActiveTrack = useCallback((audio: HTMLAudioElement) => {
    activeTracksRef.current.add(audio)
  }, [])

  const unregisterActiveTrack = useCallback((audio: HTMLAudioElement) => {
    activeTracksRef.current.delete(audio)
  }, [])
  
  const resetSettings = useCallback(() => {
    setIsMuted(DEFAULT_SETTINGS.isMuted)
    setBgVolumeInternal(DEFAULT_SETTINGS.bgVolume)
    setSfxVolume(DEFAULT_SETTINGS.sfxVolume)
    setNarrationVolume(DEFAULT_SETTINGS.narrationVolume)
    setNarrationRate(DEFAULT_SETTINGS.narrationRate)
  }, [])

  return (
    <SoundContext.Provider value={{ 
      isMuted, toggleMute, setIsMuted, 
      bgVolume: bgVolumeInternal, setBgVolume,
      sfxVolume, setSfxVolume,
      narrationVolume, setNarrationVolume,
      playSFX, playBGMusic, stopBGMusic, playTrack,
      registerActiveTrack, unregisterActiveTrack,
      narrationRate, setNarrationRate, resetSettings
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
      playTrack: () => null,
      registerActiveTrack: () => {},
      unregisterActiveTrack: () => {},
      narrationRate: 1.0,
      setNarrationRate: () => {},
      resetSettings: () => {}
    }
  }
  return context
}
