import { motion } from 'framer-motion'

export default function RedFlagAlert({ flags, onContinue, onBack }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ minHeight: '100vh', background: '#c62828', color: 'white', padding: 24, display: 'flex', flexDirection: 'column' }}
    >
      <motion.div
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ repeat: Infinity, duration: 1.5 }}
        style={{ fontSize: 80, textAlign: 'center', marginTop: 32 }}
      >
        🚨
      </motion.div>

      <h1 style={{ fontSize: 32, fontWeight: 800, textAlign: 'center', margin: '16px 0 8px' }}>EMERGENCY ALERT</h1>
      <p style={{ textAlign: 'center', opacity: 0.85, marginBottom: 24, fontSize: 16 }}>Red flag symptoms detected</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {flags && flags.length > 0 && flags.map((f, i) => (
          <motion.div key={i} initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.15 }}
            style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '12px 16px', fontSize: 14, borderLeft: '4px solid white' }}>
            ⚠️ {f}
          </motion.div>
        ))}
      </div>

      <motion.button
        whileTap={{ scale: 0.95 }}
        className="pulse-red"
        onClick={() => {
          if (navigator.userAgent.match(/Android|iPhone/i)) {
            window.location.href = 'tel:108'
          } else {
            alert('Dial 108 on your phone immediately.')
          }
        }}
        style={{ background: 'white', color: '#c62828', border: 'none', borderRadius: 16, minHeight: 64, fontSize: 22, fontWeight: 800, cursor: 'pointer', marginBottom: 12, fontFamily: 'Nunito' }}
      >
        📞 CALL 108 NOW
      </motion.button>

      <button onClick={() => {
          if (navigator.userAgent.match(/Android|iPhone/i)) {
            window.location.href = 'tel:+911'
          } else {
            alert('Dial ASHA Supervisor on your phone: +911')
          }
        }}
        style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '2px solid white', borderRadius: 16, minHeight: 56, fontSize: 18, fontWeight: 700, cursor: 'pointer', marginBottom: 24, fontFamily: 'Nunito' }}>
        📞 Call ASHA Supervisor
      </button>

      <div style={{ display: 'flex', gap: 10, marginTop: 'auto' }}>
        <button onClick={onBack} style={{ flex: 1, height: 48, background: 'rgba(255,255,255,0.15)', border: '1.5px solid rgba(255,255,255,0.5)', borderRadius: 12, color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito' }}>← Back</button>
        <button onClick={onContinue} style={{ flex: 2, height: 48, background: 'rgba(255,255,255,0.25)', border: '1.5px solid white', borderRadius: 12, color: 'white', fontWeight: 700, cursor: 'pointer', fontFamily: 'Nunito' }}>
          Continue to Summary →
        </button>
      </div>
    </motion.div>
  )
}
