import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function SplashScreen({ onDone }) {
  useEffect(() => { setTimeout(onDone, 2800) }, [])

  return (
    <div style={{ background: '#00796b', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        style={{ fontSize: 80, marginBottom: 16 }}
      >
        🏥
      </motion.div>
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{ fontSize: 40, fontWeight: 800, margin: 0, letterSpacing: -1 }}
      >
        TriageAid
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        style={{ fontSize: 16, opacity: 0.85, marginTop: 8, textAlign: 'center', padding: '0 32px' }}
      >
        Rural Telemedicine Triage System
      </motion.p>
      <motion.div
        initial={{ scaleX: 0 }}
        animate={{ scaleX: 1 }}
        transition={{ delay: 1.2, duration: 1.2 }}
        style={{ width: 200, height: 3, background: 'rgba(255,255,255,0.5)', borderRadius: 4, marginTop: 48 }}
      />
      <motion.div className="heartbeat" style={{ marginTop: 24, fontSize: 32 }}>❤️</motion.div>
    </div>
  )
}
