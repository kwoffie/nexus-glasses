import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import { VideoCacheProvider } from '@/contexts/VideoCacheContext'
import App from '@/App'
import './index.css'
import i18n from '@/i18n'
import { I18nextProvider } from 'react-i18next'

// Register service worker for caching
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((registration) => {
      console.log('Service Worker registered:', registration)
    }).catch((error) => {
      console.log('Service Worker registration failed:', error)
    })
  })
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <VideoCacheProvider>
          <App />
        </VideoCacheProvider>
      </AuthProvider>
    </I18nextProvider>
  </React.StrictMode>
)
