import { createBrowserRouter } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from '@/components/AppShell'

// Lazy loading das páginas para melhor performance
const HomePage = lazy(() => import('@/pages/HomePage'))
const ChaptersPage = lazy(() => import('@/pages/ChaptersPage'))
const ChapterPage = lazy(() => import('@/pages/ChapterPage'))
const QuizPage = lazy(() => import('@/pages/QuizPage'))
const GamesPage = lazy(() => import('@/pages/GamesPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const InvasoresPage = lazy(() => import('@/pages/InvasoresPage'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Fallback de carregamento simples para o Suspense
const PageLoader = () => (
  <div style={{ 
    height: '100vh', 
    width: '100vw', 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center',
    background: '#0A0E1A',
    color: '#fff',
    fontFamily: 'Poppins, sans-serif'
  }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ 
        width: '40px', 
        height: '40px', 
        border: '3px solid rgba(255,255,255,0.1)', 
        borderTopColor: '#4b7bed', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite',
        margin: '0 auto 15px'
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p>Decolando...</p>
    </div>
  </div>
)

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <AppShell />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'capitulos',
        element: <ChaptersPage />,
      },
      {
        path: 'capitulos/:chapterId/:subStep?',
        element: <ChapterPage />,
      },
      {
        path: 'quiz',
        element: <QuizPage />,
      },
      {
        path: 'jogos',
        element: <GamesPage />,
      },
      {
        path: 'perfil',
        element: <ProfilePage />,
      },
      {
        path: 'jogos/invasores',
        element: <InvasoresPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
