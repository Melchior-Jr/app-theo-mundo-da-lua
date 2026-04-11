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
const MemoriaAstralPage = lazy(() => import('@/pages/MemoriaAstralPage'))
const ArenaDuelosPage = lazy(() => import('@/pages/ArenaDuelosPage'))
const TrophyRoomPage = lazy(() => import('@/pages/TrophyRoom'))
const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'))

// Rotas Admin
const AdminLayout = lazy(() => import('@/pages/AdminPage/AdminLayout'))
const AdminOverview = lazy(() => import('@/pages/AdminPage'))
const ChaptersManager = lazy(() => import('@/pages/AdminPage/ChaptersManager'))
const NotificationsManager = lazy(() => import('@/pages/AdminPage/NotificationsManager'))
const UsersManager = lazy(() => import('@/pages/AdminPage/UsersManager'))
const ActivitiesManager = lazy(() => import('@/pages/AdminPage/ActivitiesManager'))
const SubjectsManager = lazy(() => import('@/pages/AdminPage/SubjectsManager'))
const PedagogicalAnalysis = lazy(() => import('@/pages/AdminPage/PedagogicalAnalysis'))

// Rotas Professor
const TeacherLayout = lazy(() => import('@/pages/TeacherPage/TeacherLayout'))

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
        path: 'jornada/:subjectSlug',
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
        path: 'jogos/memoria-astral',
        element: <MemoriaAstralPage />,
      },
      {
        path: 'jogos/arena-duelos',
        element: <ArenaDuelosPage />,
      },
      {
        path: 'trofeus',
        element: <TrophyRoomPage />,
      },
      {
        path: 'admin',
        element: <AdminLayout />,
        children: [
          { index: true, element: <AdminOverview /> },
          { path: 'chapters', element: <ChaptersManager /> },
          { path: 'subjects', element: <SubjectsManager /> },
          { path: 'activities', element: <ActivitiesManager /> },
          { path: 'notifications', element: <NotificationsManager /> },
          { path: 'users', element: <UsersManager /> },
          { path: 'pedagogical', element: <PedagogicalAnalysis /> },
        ]
      },
      {
        path: 'prof',
        element: (
          <Suspense fallback={<PageLoader />}>
            <TeacherLayout />
          </Suspense>
        ),
        children: [
          { index: true, element: <AdminOverview /> },
          { path: 'alunos', element: <UsersManager /> },
          { path: 'analise', element: <PedagogicalAnalysis /> },
        ]
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
