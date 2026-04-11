import { useState, useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { NarrationSequenceProvider, useNarrationSequence } from '@/context/NarrationSequenceContext'
import NarrationPlayer from '@/components/NarrationPlayer'
import SplashLoader from '@/components/SplashLoader'
import { usePlayer } from '@/context/PlayerContext'
import { useAuth } from '@/context/AuthContext'
import { unlockAudio } from '@/hooks/useNarration'
import ProfileCompletionModal from '@/components/ProfileCompletionModal'
import styles from './AppShell.module.css'

/**
  * AppShell — estrutura base da aplicação.
  * Gerencia o roteamento e a Splash Screen inicial.
  */
export default function AppShell() {
   const location = useLocation()
   const { user } = useAuth()
   const { loading: playerLoading } = usePlayer()
   
   // List of routes that SHOULD show the splash (heavy pages: games/lessons)
   const isHeavyPage = [
     '/quiz',
     '/jogos/invasores',
     '/jogos/memoria-astral',
     '/jogos/arena-duelos'
   ].includes(location.pathname) || (location.pathname.startsWith('/capitulos/') && location.pathname !== '/capitulos')
 
   // List of routes that NEVER show the splash (hubs/public)
   const isSimplePage = ['/', '/login', '/reset-password', '/jogos', '/ranking', '/perfil', '/capitulos', '/trofeus', '/install'].includes(location.pathname) || location.pathname.startsWith('/admin') || location.pathname.startsWith('/prof')
 
   const [isLoaded, setIsLoaded] = useState(false)
   const prevIsHeavy = useRef(false)

   // Determina se a aplicação está "pronta" para ser exibida
   const appIsReady = !playerLoading || !user

   // Auto-load if we are on a simple page AND data is ready
   useEffect(() => {
     if (isSimplePage && appIsReady) {
       setIsLoaded(true)
       prevIsHeavy.current = false
     } else if (isHeavyPage) {
       // Only trigger splash if we were NOT already in a heavy context
       if (!prevIsHeavy.current) {
         setIsLoaded(false)
       }
       prevIsHeavy.current = true
     }
   }, [location.pathname, isHeavyPage, isSimplePage, appIsReady])
 
   // Desbloqueia o áudio — chamado pelo SplashLoader ao decolar
   const handleAppStart = (setIsGlobalLoading?: (l: boolean) => void) => {
     if (window.speechSynthesis) {
       const u = new SpeechSynthesisUtterance('')
       window.speechSynthesis.cancel() 
       window.speechSynthesis.speak(u)
     }
     unlockAudio()
     setIsLoaded(true)
     if (setIsGlobalLoading) setIsGlobalLoading(false)
   }
 
   // Show splash if not loaded AND it's a heavy page
   const showSplash = !isLoaded && isHeavyPage
 
   return (
     <NarrationSequenceProvider>
       <AppShellInner 
         showSplash={showSplash} 
         onAppStart={handleAppStart}
         isLoaded={isLoaded || isSimplePage}
         playerLoading={playerLoading}
       />
     </NarrationSequenceProvider>
   )
 }
 
 function AppShellInner({ 
   showSplash, 
   onAppStart, 
   isLoaded,
   playerLoading
 }: { 
   showSplash: boolean, 
   onAppStart: (fn: (l: boolean) => void) => void,
   isLoaded: boolean,
   playerLoading: boolean
 }) {
   const { setIsGlobalLoading } = useNarrationSequence()
   const { user } = useAuth()
 
   useEffect(() => {
     setIsGlobalLoading(showSplash)
   }, [showSplash, setIsGlobalLoading])
 
   return (
     <>
       {showSplash && (
         <SplashLoader 
           onReady={() => onAppStart(setIsGlobalLoading)} 
           loading={playerLoading && !!user} 
         />
       )}
        <div style={{ 
          visibility: isLoaded ? 'visible' : 'hidden',
          minHeight: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'visible'
        }}>
          <AppShellContent />
        </div>
     </>
   )
 }
 
 function AppShellContent() {
   const { activeNarration, themeColor, onNarrationFinish, funFact, canStartLocal, isGlobalLoading } = useNarrationSequence()
   const { playerData, refreshData, loading: playerLoading } = usePlayer()
   const [showCompletionModal, setShowCompletionModal] = useState(false)
   const location = useLocation()
   const isHomeOrLogin = ['/', '/login', '/reset-password'].includes(location.pathname)
   
   // Lógica para verificar dados faltantes e exibir modal uma vez por dia
   useEffect(() => {
     if (!playerLoading && playerData && !isHomeOrLogin) {
       const isIncomplete = !playerData.full_name || 
                           !playerData.username || 
                           !playerData.school || 
                           !playerData.class_name || 
                           !playerData.birth_date

       if (isIncomplete) {
         const lastShown = localStorage.getItem('theo_last_profile_reminder')
         const today = new Date().toDateString()
         
         if (lastShown !== today) {
           const timer = setTimeout(() => {
             setShowCompletionModal(true)
           }, 2000)
           return () => clearTimeout(timer)
         }
       }
     }
   }, [playerLoading, playerData, isHomeOrLogin])

   const handleCloseCompletionModal = () => {
     setShowCompletionModal(false)
     localStorage.setItem('theo_last_profile_reminder', new Date().toDateString())
   }

   const isEarthIntro = location.pathname.includes('movimentos-da-terra') && !canStartLocal

   return (
     <div className={styles.shell}>
       <main className={styles.main}>
         <Outlet />
       </main>

       {/* Modal de Conclusão de Perfil */}
       {showCompletionModal && playerData && (
         <ProfileCompletionModal 
           player={playerData}
           onClose={handleCloseCompletionModal}
           onUpdate={refreshData}
         />
       )}

       {/* Théo Flutuante — Guia Global para todas as páginas exceto a Home/Login */}
       {!isHomeOrLogin && activeNarration && !isGlobalLoading && (
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
