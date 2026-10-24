import React from 'react'
import ReactDOM from 'react-dom/client'
import { AuthProvider } from '@/contexts/AuthContext'
import { VideoCacheProvider } from '@/contexts/VideoCacheContext'
import App from '@/App'
import './index.css'
import i18n from '@/i18n'
import { I18nextProvider } from 'react-i18next'

// Unregister any existing service workers to prevent stale cache issues
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister()
      console.log('Service Worker unregistered')
    })
  })
  // Clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      names.forEach((name) => {
        caches.delete(name)
        console.log('Cache deleted:', name)
      })
    })
  }
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
