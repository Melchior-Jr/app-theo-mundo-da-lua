import React from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { AuthProvider } from '@/context/AuthContext'
import { SoundProvider } from '@/context/SoundContext'
import '@google/model-viewer'
import '@/styles/globals.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <SoundProvider>
        <RouterProvider router={router} />
      </SoundProvider>
    </AuthProvider>
  </React.StrictMode>,
)
