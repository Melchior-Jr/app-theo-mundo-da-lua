import { useState, useCallback, useRef, useEffect } from 'react'
import { Narration } from '@/data/narration'

// Instância global para aproveitar o desbloqueio do AutoPlay em mobiles/safari
const globalAudio = new Audio()
globalAudio.preload = 'auto'

export function unlockAudio() {
  globalAudio.play().catch(() => {})
  globalAudio.pause()
  globalAudio.src = ''
}

export function useNarration(
  narration: Narration | null, 
  onFinish?: () => void
) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  
  const activeAudioRef = useRef<HTMLAudioElement | null>(null)
  const activeUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Limpeza profunda de qualquer áudio ou voz ativa
  const stop = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      activeAudioRef.current.currentTime = 0
      activeAudioRef.current = null
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setIsPlaying(false)
    setIsPaused(false)
  }, [])

  const play = useCallback(() => {
    if (!narration) return

    // Para tudo antes de começar a nova fala
    stop()

    // Feedback visual imediato
    setIsPlaying(true)
    setIsPaused(false)

    // Opção 1: Arquivo MP3 físico
    if (narration.audioPath) {
      const audio = globalAudio
      
      // Limpeza de listeners antigos para evitar que disparem para componentes desmontados
      audio.onended = null
      audio.ontimeupdate = null
      audio.onerror = null

      // Evita recarregar se for exatamente o mesmo arquivo
      const newSrc = encodeURI(narration.audioPath)
      // Se não for o mesmo link exato (verificando o final do src atual), trocamos
      if (!audio.src.endsWith(newSrc)) {
        audio.src = newSrc
      }

      activeAudioRef.current = audio
      
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        onFinish?.()
      }

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime)
      }

      audio.onerror = (e) => {
        console.error('Erro crítico ao carregar áudio:', narration.audioPath, e)
        setIsPlaying(false)
        setCurrentTime(0)
      }

      audio.play().then(() => {
        setIsPlaying(true)
      }).catch(err => {
        console.warn('Bloqueio de autoplay pelo navegador:', err)
        // Corrigindo a dessincronização visual onde o layout acha que tá tocando
        setIsPlaying(false)
        setIsPaused(true)
      })
    } 
    // Opção 2: Web Speech API (Voz Sintética)
    else if (window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(narration.text)
      activeUtteranceRef.current = utterance
      
      utterance.lang = 'pt-BR'
      utterance.rate = 1.0
      utterance.pitch = 1.2 // Voz levemente mais aguda para o Théo

      utterance.onend = () => {
        setIsPlaying(false)
        setCurrentTime(0)
        onFinish?.()
      }

      utterance.onerror = () => {
        setIsPlaying(false)
        setCurrentTime(0)
      }

      // IMPORTANTE: Pequeno hack para "acordar" o sintetizador no Chrome
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
  }, [narration, stop, onFinish])

  const pause = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.pause()
      setIsPaused(true)
    } else if (window.speechSynthesis) {
      window.speechSynthesis.pause()
      setIsPaused(true)
    }
  }, [])

  const resume = useCallback(() => {
    if (activeAudioRef.current) {
      activeAudioRef.current.play()
      setIsPaused(false)
    } else if (window.speechSynthesis) {
      window.speechSynthesis.resume()
      setIsPaused(false)
    }
  }, [])

  // Limpa tudo ao mudar de narração ou desmontar
  useEffect(() => {
    return () => {
      stop()
    }
  }, [stop, narration?.id])

  return {
    isPlaying,
    isPaused,
    currentTime,
    play,
    pause,
    resume,
    stop
  }
}
