import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NarrationSequenceProvider, useNarrationSequence } from '@/context/NarrationSequenceContext'
import NarrationPlayer from '@/components/NarrationPlayer'
import SplashLoader from '@/components/SplashLoader'
import { unlockAudio } from '@/hooks/useNarration'
import styles from './AppShell.module.css'

/**
 * AppShell — estrutura base da aplicação.
 * Gerencia o roteamento e a Splash Screen inicial.
 */
export default function AppShell() {
  const location = useLocation()
  
  // List of routes that SHOULD show the splash (heavy pages: games/lessons)
  const isHeavyPage = [
    '/quiz',
    '/jogos/invasores'
  ].includes(location.pathname) || (location.pathname.startsWith('/capitulos/') && location.pathname !== '/capitulos')

  // List of routes that NEVER show the splash (hubs/public)
  const isSimplePage = ['/', '/login', '/reset-password', '/jogos', '/ranking', '/perfil', '/capitulos', '/trofeus'].includes(location.pathname)

  const [isLoaded, setIsLoaded] = useState(isSimplePage && !isHeavyPage)

  // Auto-load if we are on a simple page
  useEffect(() => {
    if (isSimplePage) {
      setIsLoaded(true)
    } else if (isHeavyPage) {
       // Reset loaded state when entering a heavy page to trigger splash again if desired
       // OR keep it true if already loaded once? User said "when entering", so let's reset it.
       // Actually, we probably only want it on initial entry to the app or direct navigation.
       // But if they navigation from /jogos to /quiz, it should show.
       // To trigger splash again, we flip isLoaded back to false.
       setIsLoaded(false)
    }
  }, [location.pathname, isHeavyPage, isSimplePage])

  // Desbloqueia o áudio — chamado pelo SplashLoader ao decolar
  const handleAppStart = () => {
    if (window.speechSynthesis) {
      const u = new SpeechSynthesisUtterance('')
      window.speechSynthesis.cancel() 
      window.speechSynthesis.speak(u)
    }
    unlockAudio()
    setIsLoaded(true)
  }

  // Show splash if not loaded AND it's a heavy page
  const showSplash = !isLoaded && isHeavyPage

  return (
    <>
      {showSplash && <SplashLoader onReady={handleAppStart} />}
      <NarrationSequenceProvider>
        <div style={{ 
          visibility: (isLoaded || isSimplePage) ? 'visible' : 'hidden',
          height: '100%',
          width: '100%'
        }}>
          <AppShellContent />
        </div>
      </NarrationSequenceProvider>
    </>
  )
}

function AppShellContent() {
  const { activeNarration, themeColor, onNarrationFinish, funFact, canStartLocal } = useNarrationSequence()
  const location = useLocation()
  const isHomeOrLogin = ['/', '/login', '/reset-password'].includes(location.pathname)
  
  const isEarthIntro = location.pathname.includes('movimentos-da-terra') && !canStartLocal

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Théo Flutuante — Guia Global para todas as páginas exceto a Home/Login */}
      {!isHomeOrLogin && activeNarration && (
        <NarrationPlayer 
          narration={activeNarration} 
          curiosity={funFact || undefined}
          themeColor={themeColor}
          floating={true}
          autoPlay={true}
          onFinish={onNarrationFinish}
          hidden={isEarthIntro}
        />
      )}
    </div>
  )
}
