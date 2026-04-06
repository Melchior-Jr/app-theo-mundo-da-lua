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
  </React.StrictMode>
);

// 🛠️ Registro do Coração da Estação (Service Worker)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('🚀 Estação de Comunicação (SW) Operacional:', reg.scope))
      .catch(err => console.error('💥 Falha no sistema de propulsão SW:', err));
  });
}
