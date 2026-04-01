import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './i18n/en.json'
import hi from './i18n/hi.json'
import hg from './i18n/hg.json'

i18n.use(initReactI18next).init({
  resources: { 
    en: { translation: en }, 
    hi: { translation: hi },
    hg: { translation: hg }
  },
  lng: localStorage.getItem('lang') || 'en',
  fallbackLng: 'en',
  interpolation: { escapeValue: false }
})

// Unregister service workers and clear caches in development
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    for (let registration of registrations) {
      registration.unregister();
    }
  });
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
)
