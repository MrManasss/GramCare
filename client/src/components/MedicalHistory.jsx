import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { handleEnterJump } from '../utils/keyboard'

const CONDITIONS = [
  { id: 'diabetes', emoji: '🩸', label: 'Diabetes' },
  { id: 'heart', emoji: '❤️', label: 'Heart Disease' },
  { id: 'asthma', emoji: '🫁', label: 'Asthma' },
  { id: 'epilepsy', emoji: '🧠', label: 'Epilepsy' },
  { id: 'pregnant', emoji: '🤰', label: 'Pregnant' },
  { id: 'hypertension', emoji: '🍺', label: 'Hypertension' },
  { id: 'kidney', emoji: '🦷', label: 'Kidney Disease' },
  { id: 'none', emoji: '✅', label: 'None' }
]

export default function MedicalHistory({ onNext, onBack }) {
  const { t } = useTranslation()
  const [conditions, setConditions] = useState([])
  const [medications, setMedications] = useState([])
  const [medInput, setMedInput] = useState('')
  const [allergies, setAllergies] = useState('')
  const [hospitalized, setHospitalized] = useState(null)
  const [error, setError] = useState(false)

  const toggleCondition = (id) => {
    if (id === 'none') {
      setConditions(['none'])
    } else {
      setConditions(prev => {
        const filtered = prev.filter(c => c !== 'none')
        return filtered.includes(id) ? filtered.filter(c => c !== id) : [...filtered, id]
      })
    }
  }

  const addMed = () => { if (medInput.trim()) { setMedications(prev => [...prev, medInput.trim()]); setMedInput('') } }

  const handleSubmit = () => {
    if (conditions.length === 0 || hospitalized === null) {
      setError(true)
      return
    }
    setError(false)
    onNext({ conditions, medications, allergies, hospitalized })
  }

  return (
    <div className="screen" onKeyDown={handleEnterJump}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--nav-btn-color)', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '8px 16px', marginBottom: 20, fontSize: 13, color: 'var(--bg-subtle-text)', fontWeight: 700 }}>Step 4 of 5</div>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>📋 {t('history_title')}</h2>

      {/* Conditions */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontWeight: 700, display: 'block', marginBottom: 10 }}>{t('known_conditions')}</label>
        {error && conditions.length === 0 && <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Please select at least one (or None).</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, padding: 4, border: error && conditions.length === 0 ? '2px dashed #ff6b6b' : 'none', borderRadius: 16 }}>
          {CONDITIONS.map(c => (
            <motion.button key={c.id} whileTap={{ scale: 0.88 }} onClick={() => toggleCondition(c.id)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 10, borderRadius: 12, border: '2px solid', cursor: 'pointer', position: 'relative',
                background: conditions.includes(c.id) ? 'var(--bg-subtle)' : 'var(--chip-bg)',
                borderColor: conditions.includes(c.id) ? 'var(--chip-active)' : 'var(--input-border)' }}>
              {conditions.includes(c.id) && (
                <div style={{ position: 'absolute', top: 4, right: 4, background: '#22c55e', color: 'white', borderRadius: '50%', width: 14, height: 14, fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', border: '1px solid white' }}>✓</div>
              )}
              <span style={{ fontSize: 24 }}>{c.emoji}</span>
              <span style={{ fontSize: 10, fontWeight: 700, textAlign: 'center', marginTop: 4, color: 'var(--text-main)' }}>{c.label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Medications */}
      <div style={{ marginBottom: 16 }}>
        <label style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-main)' }}>{t('current_medications')}</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
          <input data-no-jump="true" value={medInput} 
            onChange={e => setMedInput(e.target.value.replace(/[^a-zA-Z\s]/g, ''))} 
            onKeyDown={e => { if (e.key === 'Enter') { addMed(); e.stopPropagation(); } }}
            placeholder="Type medication name..." style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--input-border)', fontSize: 15, fontFamily: 'Nunito', background: 'var(--input-bg)', color: 'var(--text-main)' }} />
          <button onClick={addMed} style={{ padding: '12px 16px', background: 'var(--nav-btn-color)', color: 'white', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {medications.map((m, i) => (
            <span key={i} style={{ background: '#e8f5e9', color: '#00796b', padding: '6px 12px', borderRadius: 20, fontSize: 13, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
              {m} <span onClick={() => setMedications(prev => prev.filter((_,j) => j!==i))} style={{ cursor: 'pointer', color: '#ff6b6b' }}>✕</span>
            </span>
          ))}
        </div>
      </div>

      <input placeholder={t('allergies')} value={allergies} 
        onChange={e => setAllergies(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
        style={{ width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid var(--input-border)', fontSize: 15, fontFamily: 'Nunito', marginBottom: 16, background: 'var(--input-bg)', color: 'var(--text-main)' }} />

      {/* Hospitalized */}
      <div style={{ marginBottom: 20, padding: 8, border: error && hospitalized === null ? '2px dashed #ff6b6b' : 'none', borderRadius: 16 }}>
        <label style={{ fontWeight: 700, display: 'block', marginBottom: 8, color: 'var(--text-main)' }}>Previous hospitalization?</label>
        {error && hospitalized === null && <div style={{ color: '#ff6b6b', fontWeight: 700, marginBottom: 8, fontSize: 14 }}>Please select Yes or No.</div>}
        <div style={{ display: 'flex', gap: 8 }}>
          {['Yes', 'No'].map(v => (
            <button key={v} onClick={() => setHospitalized(v)}
              style={{ flex: 1, height: 44, borderRadius: 12, border: '2px solid', fontWeight: 700, cursor: 'pointer',
                background: hospitalized === v ? 'var(--chip-active)' : 'var(--chip-bg)',
                borderColor: hospitalized === v ? 'var(--chip-active)' : 'var(--input-border)',
                color: hospitalized === v ? 'white' : 'var(--text-main)' }}>
              {v}
            </button>
          ))}
        </div>
      </div>

      <button className="btn-primary" onClick={handleSubmit} style={{ width: '100%', height: 56, borderRadius: 16, fontSize: 18, fontWeight: 800, cursor: 'pointer', border: 'none', background: 'var(--nav-btn-color)', color: 'white' }}>
        {t('next')}
      </button>
    </div>
  )
}
