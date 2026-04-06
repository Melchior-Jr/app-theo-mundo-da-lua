import { createBrowserRouter, Navigate } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import AppShell from '@/components/AppShell'

// Lazy loading das páginas para melhor performance
// HomePage movida para o projeto Landing. Agora a raiz é apenas o App.
const LoginPage = lazy(() => import('@/pages/LoginPage'))
const ResetPasswordPage = lazy(() => import('@/pages/ResetPasswordPage'))
const ChaptersPage = lazy(() => import('@/pages/ChaptersPage'))
const ChapterPage = lazy(() => import('@/pages/ChapterPage'))
const QuizPage = lazy(() => import('@/pages/QuizPage'))
const GamesPage = lazy(() => import('@/pages/GamesPage'))
const ProfilePage = lazy(() => import('@/pages/ProfilePage'))
const InstallPage = lazy(() => import('@/pages/InstallPage'))
const RankingPage = lazy(() => import('@/pages/RankingPage'))
const InvasoresPage = lazy(() => import('@/pages/InvasoresPage'))
const TrophyRoomPage = lazy(() => import('@/pages/TrophyRoom'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

import PageLoader from '@/components/PageLoader'

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
        element: <Navigate to="/login" replace />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'reset-password',
        element: <ResetPasswordPage />,
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
        path: 'install',
        element: <InstallPage />,
      },
      {
        path: 'ranking',
        element: <RankingPage />,
      },
      {
        path: 'jogos/invasores',
        element: <InvasoresPage />,
      },
      {
        path: 'trofeus',
        element: <TrophyRoomPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
