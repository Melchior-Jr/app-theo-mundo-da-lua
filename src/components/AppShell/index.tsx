import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NarrationSequenceProvider, useNarrationSequence } from '@/context/NarrationSequenceContext'
import NarrationPlayer from '@/components/NarrationPlayer'
import { unlockAudio } from '@/hooks/useNarration'
import styles from './AppShell.module.css'

/**
 * AppShell — estrutura base da aplicação.
 * Envolve todas as páginas com o contexto visual espacial e de narração.
 */
export default function AppShell() {
  return (
    <NarrationSequenceProvider>
      <AppShellContent />
    </NarrationSequenceProvider>
  )
}

function AppShellContent() {
  const { activeNarration, themeColor, onNarrationFinish, funFact, canStartLocal } = useNarrationSequence()
  const location = useLocation()
  const isHome = location.pathname === '/'
  
  // Durante a intro da página Earth Motions, o Théo aparece grande no centro do dashboard.
  // O NarrationPlayer flutuante fica invisível (mas ativo) para não duplicar o personagem.
  const isEarthIntro = location.pathname.includes('movimentos-da-terra') && !canStartLocal

  // Desbloqueia o áudio/voz globalmente na primeira interação
  useEffect(() => {
    const unlock = () => {
      if (window.speechSynthesis) {
        const u = new SpeechSynthesisUtterance('')
        window.speechSynthesis.cancel() // Limpa antes
        window.speechSynthesis.speak(u)
      }
      unlockAudio()
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
    }
    window.addEventListener('click', unlock)
    window.addEventListener('touchstart', unlock)
    return () => {
      window.removeEventListener('click', unlock)
      window.removeEventListener('touchstart', unlock)
    }
  }, [])

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
