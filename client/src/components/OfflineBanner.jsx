import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine)
  const { t } = useTranslation()

  useEffect(() => {
    const on = () => setOnline(true)
    const off = () => setOnline(false)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off) }
  }, [])

  return (
    <AnimatePresence>
      <motion.div
        key={online ? 'online' : 'offline'}
        initial={{ y: -40 }}
        animate={{ y: 0 }}
        style={{
          background: online ? '#00796b' : '#ffb300',
          color: online ? 'white' : '#1a1a1a',
          textAlign: 'center', padding: '8px 16px',
          fontSize: 13, fontWeight: 700, position: 'sticky', top: 0, zIndex: 100
        }}
      >
        {online ? `🟢 ${t('online_msg')}` : `🔴 ${t('offline_msg')}`}
      </motion.div>
    </AnimatePresence>
  )
}
