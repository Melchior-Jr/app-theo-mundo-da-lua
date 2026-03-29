import { createBrowserRouter } from 'react-router-dom'
import AppShell from '@/components/AppShell'
import HomePage from '@/pages/HomePage'
import ChaptersPage from '@/pages/ChaptersPage'
import ChapterPage from '@/pages/ChapterPage'
import QuizPage from '@/pages/QuizPage'
import GamesPage from '@/pages/GamesPage'
import NotFoundPage from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
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
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
