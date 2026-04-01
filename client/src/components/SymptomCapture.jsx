import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { handleEnterJump } from '../utils/keyboard'

const SYMPTOMS = [
  { id: 'fever', emoji: '🌡️' },
  { id: 'cough', emoji: '🤧' },
  { id: 'chest_pain', emoji: '💔' },
  { id: 'nausea', emoji: '🤢' },
  { id: 'headache', emoji: '🤕' },
  { id: 'breathlessness', emoji: '😮‍💨' },
  { id: 'dizziness', emoji: '🤸' },
  { id: 'diarrhea', emoji: '💧' },
  { id: 'pregnancy', emoji: '🤰' },
  { id: 'child_illness', emoji: '👶' },
  { id: 'joint_pain', emoji: '🦴' },
  { id: 'eye_problem', emoji: '👁️' },
  { id: 'ear_pain', emoji: '👂' },
  { id: 'bleeding', emoji: '🩸' },
  { id: 'unconscious', emoji: '😵' },
  { id: 'snake_bite', emoji: '🐍' },
  { id: 'burns', emoji: '🔥' },
  { id: 'vomiting', emoji: '🤮' },
  { id: 'skin_rash', emoji: '🔴' },
  { id: 'back_pain', emoji: '🔙' }
]

const DURATIONS = ['today', 'two_three_days', 'one_week', 'one_month']

export default function SymptomCapture({ onNext, onBack }) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState([])
  const [duration, setDuration] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState(false)

  const toggle = (id) => setSelected(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id])

  const handleSubmit = () => {
    if (selected.length === 0 || !duration) {
      setError(true)
      return
    }
    setError(false)
    onNext({ selected, duration, notes })
  }

  return (
    <div className="screen" onKeyDown={handleEnterJump}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--nav-btn-color)', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '8px 16px', marginBottom: 20, fontSize: 13, color: 'var(--bg-subtle-text)', fontWeight: 700 }}>{t('step')} 3 {t('of')} 5</div>
      <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>{t('symptoms_title')}</h2>
      
      {error && <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 16 }}>{t('symptoms_error')}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24, padding: 4, border: error && selected.length === 0 ? '2px dashed #ff6b6b' : 'none', borderRadius: 16 }}>
        {SYMPTOMS.map((s, i) => (
          <motion.button
            key={s.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => toggle(s.id)}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              height: 100, borderRadius: 16, border: '2px solid', cursor: 'pointer',
              background: selected.includes(s.id) ? 'var(--bg-subtle)' : 'var(--chip-bg)',
              borderColor: selected.includes(s.id) ? 'var(--chip-active)' : 'var(--input-border)',
              boxShadow: selected.includes(s.id) ? '0 0 0 3px rgba(0,121,107,0.2)' : 'none',
              position: 'relative', padding: 4
            }}
          >
            {selected.includes(s.id) && (
              <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--chip-active)', color: 'white', borderRadius: '50%', width: 16, height: 16, fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
            )}
            <span style={{ fontSize: 42 }}>{s.emoji}</span>
            <span style={{ fontSize: 12, fontWeight: 700, textAlign: 'center', color: 'var(--text-main)', marginTop: 6, lineHeight: 1.1 }}>{t(`sym_${s.id}`)}</span>
          </motion.button>
        ))}
      </div>

      {/* Duration */}
      <div style={{ marginBottom: 16, padding: 8, border: error && !duration ? '2px dashed #ff6b6b' : 'none', borderRadius: 16 }}>
        <label style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-main)' }}>⏱️ {t('duration')}</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {DURATIONS.map(d => (
            <button key={d} onClick={() => setDuration(d)}
              style={{ padding: '10px 16px', borderRadius: 20, border: '2px solid', cursor: 'pointer', fontWeight: 700, fontSize: 13,
                background: duration === d ? 'var(--chip-active)' : 'var(--chip-bg)',
                borderColor: duration === d ? 'var(--chip-active)' : 'var(--input-border)',
                color: duration === d ? 'white' : 'var(--text-main)' }}>
              {t(d)}
            </button>
          ))}
        </div>
      </div>

      <textarea placeholder={t('additional_notes')} value={notes} onChange={e => setNotes(e.target.value)}
        style={{ width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid var(--input-border)', fontSize: 15, fontFamily: 'Nunito', minHeight: 80, resize: 'none', background: 'var(--input-bg)', color: 'var(--text-main)' }} />

      <motion.button className="btn-primary" onClick={handleSubmit} whileTap={{ scale: 0.97 }} style={{ marginTop: 16 }}>
        {t('next')}
      </motion.button>
    </div>
  )
}
