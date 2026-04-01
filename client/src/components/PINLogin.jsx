import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'

export default function PINLogin({ onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const { t } = useTranslation()

  // Retrieve custom PIN from storage or default to 1234
  const correctPin = localStorage.getItem('triage_pin') || '1234'

  const handleKey = (digit) => {
    setPin(prev => {
      if (prev.length >= 4) return prev;
      const newPin = prev + digit;
      if (newPin.length === 4) {
        if (newPin === correctPin) {
          setError(false);
          setTimeout(onSuccess, 300);
        } else {
          setError(true);
          setTimeout(() => setPin(''), 600);
        }
      } else {
        setError(false);
      }
      return newPin;
    });
  }

  // Keyboard support natively
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleKey(e.key);
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        setPin(p => p.slice(0, -1));
        setError(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);


  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      
      <div style={{ fontSize: 60, marginBottom: 16 }}>🔐</div>
      <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4, color: '#1a1a1a' }}>{t('pin_title')}</h2>
      <p style={{ color: '#666', marginBottom: 32, fontSize: 15 }}>{t('pin_subtitle')}</p>

      {/* PIN dots */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
        {[0,1,2,3].map(i => (
          <motion.div
            key={i}
            animate={{ scale: pin.length > i ? 1.2 : 1, background: error ? '#ff6b6b' : pin.length > i ? '#00796b' : '#ddd' }}
            style={{ width: 20, height: 20, borderRadius: '50%' }}
          />
        ))}
      </div>

      {/* Number pad */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
        {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((k, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.88 }}
            onClick={() => k === '⌫' ? setPin(p => p.slice(0,-1)) : k && handleKey(k)}
            style={{
              height: 72, fontSize: 24, fontWeight: 700, borderRadius: 16,
              background: k === '⌫' ? '#fff0f0' : k === '' ? 'transparent' : 'white',
              border: k ? '1.5px solid #e0e0e0' : 'none',
              color: k === '⌫' ? '#ff6b6b' : '#1a1a1a',
              cursor: k ? 'pointer' : 'default',
              boxShadow: k && k !== '⌫' ? '0 2px 8px rgba(0,0,0,0.07)' : 'none'
            }}
          >
            {k}
          </motion.button>
        ))}
      </div>
      {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ff6b6b', marginTop: 16, fontWeight: 700 }}>{t('wrong_pin') || 'Wrong PIN. Try again.'}</motion.p>}
    </div>
  )
}
