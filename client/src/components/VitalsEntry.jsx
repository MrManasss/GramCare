import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { handleEnterJump } from '../utils/keyboard'

function getVitalsConfig(age, t) {
  const a = Number(age) || 30

  let pulseNormal = '60–100', pulseMin = 40, pulseMax = 120, pulseCritMin = 40, pulseCritMax = 120
  let rrNormal = '12–20', rrMin = 12, rrMax = 20, rrCritMax = 30
  let weightMin = 40, weightMax = 100, weightCritMin = 30, weightCritMax = 200
  let bpNormal = '120/80', sysMin = 90, sysMax = 140, sysCritMin = 70, sysCritMax = 180

  if (a < 3) {
    pulseNormal = '100–160'; pulseMin = 80; pulseMax = 160; pulseCritMin = 80; pulseCritMax = 160;
    rrNormal = '24–40'; rrMin = 24; rrMax = 50; rrCritMax = 60;
    weightMin = 2; weightMax = 20; weightCritMin = 0.5; weightCritMax = 40;
    bpNormal = '90/60'; sysMin = 70; sysMax = 110; sysCritMin = 50; sysCritMax = 130;
  } else if (a < 12) {
    pulseNormal = '70–120'; pulseMin = 60; pulseMax = 130; pulseCritMin = 60; pulseCritMax = 130;
    rrNormal = '18–30'; rrMin = 18; rrMax = 35; rrCritMax = 45;
    weightMin = 10; weightMax = 60; weightCritMin = 5; weightCritMax = 100;
    bpNormal = '110/70'; sysMin = 80; sysMax = 120; sysCritMin = 60; sysCritMax = 140;
  }

  return [
    { key: 'temp', label: `🌡️ ${t('temperature')}`, normal: `97–99°F`, min: 95, max: 104, critMin: 90, critMax: 104 },
    { key: 'pulse', label: `💓 ${t('pulse')}`, normal: pulseNormal, min: pulseMin, max: pulseMax, critMin: pulseCritMin, critMax: pulseCritMax },
    { key: 'bp', label: `🩸 ${t('bp')} (mmHg)`, normal: bpNormal, isBP: true, min: sysMin, max: sysMax, critMin: sysCritMin, critMax: sysCritMax },
    { key: 'spo2', label: `🫁 ${t('spo2')}`, normal: '95–100%', min: 90, max: 100, critMin: 90, critMax: null },
    { key: 'weight', label: `⚖️ ${t('weight')}`, normal: t('varies'), min: weightMin, max: weightMax, critMin: weightCritMin, critMax: weightCritMax },
    { key: 'rr', label: `🌬️ ${t('rr')}`, normal: rrNormal, min: rrMin, max: rrMax, critMin: null, critMax: rrCritMax }
  ]
}

function getColor(vital, value) {
  if (!value) return 'var(--card-bg)'
  const v = Number(value)
  
  // IF NOT A NUMBER (like "abc") -> RED
  if (isNaN(v)) return 'var(--bg-red-subtle)'
  
  if (vital.critMin && v < vital.critMin) return 'var(--bg-red-subtle)'
  if (vital.critMax && v > vital.critMax) return 'var(--bg-red-subtle)'
  if (vital.min && v < vital.min) return 'var(--bg-yellow-subtle)'
  if (vital.max && v > vital.max) return 'var(--bg-yellow-subtle)'
  return 'var(--bg-subtle)'
}

function getBorderColor(vital, value, hasError) {
  if (hasError) return '#ff6b6b' // Validation error
  if (!value) return 'var(--input-border)'
  const v = Number(value)
  
  // IF NOT A NUMBER -> RED BORDER
  if (isNaN(v)) return '#ff6b6b'
  
  if (vital.critMin && v < vital.critMin) return '#ff5252'
  if (vital.critMax && v > vital.critMax) return '#ff5252'
  if (vital.min && v < vital.min) return '#ffb300'
  if (vital.max && v > vital.max) return '#ffb300'
  return 'var(--nav-btn-color)'
}

export default function VitalsEntry({ age, onNext, onBack }) {
  const { t } = useTranslation()
  const [vitals, setVitals] = useState({})
  const [errors, setErrors] = useState([])
  const currentVitals = getVitalsConfig(age, t)

  const handleSubmit = () => {
    const newErrors = []
    currentVitals.forEach(v => {
      if (v.isBP) {
        if (!vitals.systolic || !vitals.diastolic) newErrors.push('bp')
      } else {
        if (!vitals[v.key]) newErrors.push(v.key)
      }
    })

    if (newErrors.length > 0) {
      setErrors(newErrors)
      alert(t('vitals_alert'))
      return
    }

    setErrors([])
    onNext(vitals)
  }

  return (
    <div className="screen" onKeyDown={handleEnterJump}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--nav-btn-color)', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '8px 16px', marginBottom: 20, fontSize: 13, color: 'var(--bg-subtle-text)', fontWeight: 700 }}>{t('step')} 2 {t('of')} 5</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>📊 {t('vitals_title')}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {currentVitals.map((v, i) => (
          <motion.div key={v.key} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.07 }}
            style={{ 
              background: v.isBP ? getColor(v, vitals.systolic) : getColor(v, vitals[v.key]), 
              border: `2px solid ${getBorderColor(v, v.isBP ? vitals.systolic : vitals[v.key], errors.includes(v.key) || (v.isBP && (errors.includes('bp'))))}`, 
              boxShadow: (vitals[v.key] || (v.isBP && vitals.systolic)) ? `0 4px 12px ${getBorderColor(v, v.isBP ? vitals.systolic : vitals[v.key], false)}44` : 'none',
              borderRadius: 12, padding: 14, transition: 'all 0.3s' 
            }}>
            <div style={{ fontWeight: 700, marginBottom: 6, fontSize: 15, color: 'var(--text-main)' }}>{v.label}</div>
            {v.normal && <div style={{ fontSize: 12, color: 'var(--text-sub)', marginBottom: 8 }}>{t('normal')}: {v.normal}</div>}
            
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              {v.isBP ? (
                <>
                  <input
                    type="text" inputMode="decimal" placeholder={t('sys')}
                    value={vitals.systolic || ''}
                    onChange={e => setVitals({ ...vitals, systolic: e.target.value })}
                    style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--input-border)', fontSize: 20, fontWeight: 700, fontFamily: 'Nunito', background: 'var(--input-bg)', color: 'var(--text-main)', textAlign: 'center' }}
                  />
                  <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-sub)' }}>/</span>
                  <input
                    type="text" inputMode="decimal" placeholder={t('dia')}
                    value={vitals.diastolic || ''}
                    onChange={e => setVitals({ ...vitals, diastolic: e.target.value })}
                    style={{ flex: 1, minWidth: 0, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--input-border)', fontSize: 20, fontWeight: 700, fontFamily: 'Nunito', background: 'var(--input-bg)', color: 'var(--text-main)', textAlign: 'center' }}
                  />
                </>
              ) : (
                <input
                  type="text" inputMode="decimal" placeholder={t('enter_value')}
                  value={vitals[v.key] || ''}
                  onChange={e => setVitals({ ...vitals, [v.key]: e.target.value })}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--input-border)', fontSize: 20, fontWeight: 700, fontFamily: 'Nunito', background: 'var(--input-bg)', color: 'var(--text-main)' }}
                />
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.button className="btn-primary" onClick={handleSubmit} whileTap={{ scale: 0.97 }} style={{ marginTop: 24 }}>
        {t('next')}
      </motion.button>
    </div>
  )
}
