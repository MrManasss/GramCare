import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'

export default function ChangePIN({ onBack }) {
  const { t } = useTranslation()
  const [step, setStep] = useState(1) // 1: Old PIN, 2: New PIN, 3: Confirm PIN
  const [pin, setPin] = useState('')
  const [newPin, setNewPin] = useState('')
  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [success, setSuccess] = useState(false)

  const currentPin = localStorage.getItem('triage_pin') || '1234'

  const handleKey = (digit) => {
    if (pin.length >= 4) return
    const updated = pin + digit
    setPin(updated)
    setError(false)

    if (updated.length === 4) {
      setTimeout(() => processStep(updated), 300)
    }
  }

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
  }, [pin, step, newPin]);

  const processStep = (enteredPin) => {
    if (step === 1) {
      if (enteredPin === currentPin) {
        setStep(2)
        setPin('')
      } else {
        triggerError('Wrong current PIN.')
      }
    } else if (step === 2) {
      setNewPin(enteredPin)
      setStep(3)
      setPin('')
    } else if (step === 3) {
      if (enteredPin === newPin) {
        localStorage.setItem('triage_pin', newPin)
        setSuccess(true)
        setTimeout(onBack, 1500)
      } else {
        triggerError("PINs don't match. Try again.")
        setStep(2)
        setNewPin('')
      }
    }
  }

  const triggerError = (msg) => {
    setError(true)
    setErrorMsg(msg)
    setTimeout(() => {
      setPin('')
      setError(false)
    }, 600)
  }

  let title = 'Enter Current PIN'
  if (step === 2) title = 'Enter New PIN'
  if (step === 3) title = 'Confirm New PIN'

  return (
    <div className="screen" style={{ justifyContent: 'center', paddingTop: 40 }}>
      {/* HEADER */}
      <button onClick={onBack} style={{ position: 'absolute', top: 20, left: 16, background: 'none', border: 'none', fontSize: 16, color: '#00796b', cursor: 'pointer', fontWeight: 700 }}>
        ← {t('back')}
      </button>

      {success ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <h2 style={{ color: '#00796b', fontSize: 24, fontWeight: 800 }}>PIN Updated!</h2>
        </motion.div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <div style={{ fontSize: 50, marginBottom: 16 }}>{step === 1 ? '🔐' : '🔑'}</div>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24, textAlign: 'center', color: 'var(--text-main)' }}>{title}</h2>

          {/* PIN dots */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 32 }}>
            {[0, 1, 2, 3].map(i => (
              <motion.div
                key={i}
                animate={{ scale: pin.length > i ? 1.2 : 1, background: error ? '#ff6b6b' : pin.length > i ? '#00796b' : 'var(--input-border)' }}
                style={{ width: 20, height: 20, borderRadius: '50%' }}
              />
            ))}
          </div>

          {/* Number pad */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 280 }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) => (
              <motion.button
                key={i}
                whileTap={{ scale: 0.88 }}
                onClick={() => k === '⌫' ? setPin(p => p.slice(0, -1)) : k && handleKey(k)}
                style={{
                  height: 72, fontSize: 24, fontWeight: 700, borderRadius: 16,
                  background: k === '⌫' ? '#fff0f0' : k === '' ? 'transparent' : 'var(--card-bg)',
                  border: k && k !== '⌫' ? '1.5px solid var(--input-border)' : 'none',
                  color: k === '⌫' ? '#ff6b6b' : 'var(--text-main)',
                  cursor: k ? 'pointer' : 'default',
                  boxShadow: k && k !== '⌫' ? 'var(--card-shadow)' : 'none'
                }}
              >
                {k}
              </motion.button>
            ))}
          </div>
          {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#ff6b6b', marginTop: 16, fontWeight: 700 }}>{errorMsg}</motion.p>}
        </div>
      )}
    </div>
  )
}
