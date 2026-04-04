import { useState } from 'react'
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
  const isLandingPage = location.pathname === '/'
  const [isLoaded, setIsLoaded] = useState(isLandingPage)

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

  return (
    <>
      {!isLoaded && !isLandingPage && <SplashLoader onReady={handleAppStart} />}
      <NarrationSequenceProvider>
        <div style={{ visibility: (isLoaded || isLandingPage) ? 'visible' : 'hidden' }}>
          <AppShellContent />
        </div>
      </NarrationSequenceProvider>
    </>
  )
}

function AppShellContent() {
  const { activeNarration, themeColor, onNarrationFinish, funFact, canStartLocal } = useNarrationSequence()
  const location = useLocation()
  const isHome = location.pathname === '/'
  
  const isEarthIntro = location.pathname.includes('movimentos-da-terra') && !canStartLocal

  return (
    <div className={styles.shell}>
      <main className={styles.main}>
        <Outlet />
      </main>

      {/* Théo Flutuante — Guia Global para todas as páginas exceto a Home */}
      {!isHome && activeNarration && (
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
