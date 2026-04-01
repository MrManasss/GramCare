import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { savePatient } from '../db/db'
import { handleEnterJump } from '../utils/keyboard'

export default function PatientRegistration({ onNext, onBack }) {
  const { t } = useTranslation()
  const [form, setForm] = useState({ name: '', age: 25, gender: '', village: '', phone: '' })
  const [errors, setErrors] = useState([])

  const handleSubmit = async () => {
    const newErrors = []
    if (!form.name) newErrors.push('name')
    if (!form.gender) newErrors.push('gender')
    if (!form.village) newErrors.push('village')
    
    if (newErrors.length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors([])
    const id = await savePatient(form)
    onNext({ ...form, id })
  }

  return (
    <div className="screen" onKeyDown={handleEnterJump}>
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#00796b', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <div style={{ background: 'var(--bg-subtle)', borderRadius: 12, padding: '8px 16px', marginBottom: 20, fontSize: 13, color: 'var(--bg-subtle-text)', fontWeight: 700 }}>Step 1 of 5</div>

      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20, color: 'var(--text-main)' }}>🧑 {t('patient_name')}</h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <input placeholder={`${t('patient_name')} *`} value={form.name} 
          onChange={e => setForm({...form, name: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
          style={{ padding: '16px', borderRadius: 12, border: errors.includes('name') ? '2px solid #ff6b6b' : '1.5px solid var(--input-border)', fontSize: 18, fontFamily: 'Nunito', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-main)' }} />

        {/* Age stepper */}
        <div className="card">
          <label style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>{t('age')}</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setForm({...form, age: Math.max(0, form.age-1)})}
              style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--bg-subtle)', color: 'var(--bg-subtle-text)', border: 'none', fontSize: 24, cursor: 'pointer' }}>−</motion.button>
            <span style={{ fontSize: 32, fontWeight: 800, flex: 1, textAlign: 'center', color: 'var(--text-main)' }}>{form.age}</span>
            <motion.button whileTap={{ scale: 0.85 }} onClick={() => setForm({...form, age: form.age+1})}
              style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--chip-active)', border: 'none', fontSize: 24, color: 'white', cursor: 'pointer' }}>+</motion.button>
          </div>
        </div>

        {/* Gender pills */}
        <div>
          <label style={{ fontWeight: 700, color: 'var(--text-main)', display: 'block', marginBottom: 8 }}>{t('gender')}</label>
          <div style={{ display: 'flex', gap: 8, padding: 4, borderRadius: 16 }}>
            {['Male','Female','Other'].map(g => (
              <motion.button key={g} whileTap={{ scale: 0.92 }} onClick={() => setForm({...form, gender: g})}
                style={{ flex: 1, height: 48, borderRadius: 12, border: errors.includes('gender') ? '2px solid #ff6b6b' : '2px solid', fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  background: form.gender === g ? 'var(--chip-active)' : 'var(--chip-bg)',
                  borderColor: form.gender === g ? 'var(--chip-active)' : (errors.includes('gender') ? '#ff6b6b' : 'var(--input-border)'),
                  color: form.gender === g ? 'white' : 'var(--text-main)' }}>
                {t(g.toLowerCase())}
              </motion.button>
            ))}
          </div>
        </div>

        <input placeholder={`${t('village')} *`} value={form.village} 
          onChange={e => setForm({...form, village: e.target.value.replace(/[^a-zA-Z\s]/g, '')})}
          style={{ padding: '16px', borderRadius: 12, border: errors.includes('village') ? '2px solid #ff6b6b' : '1.5px solid var(--input-border)', fontSize: 18, fontFamily: 'Nunito', outline: 'none', background: 'var(--input-bg)', color: 'var(--text-main)' }} />
        <input placeholder={t('phone')} value={form.phone} 
          onChange={e => setForm({...form, phone: e.target.value.replace(/[^0-9]/g, '')})}
          style={{ padding: '16px', borderRadius: 12, border: '1.5px solid var(--input-border)', fontSize: 18, fontFamily: 'Nunito', background: 'var(--input-bg)', color: 'var(--text-main)' }} />
      </div>

      <motion.button className="btn-primary" onClick={handleSubmit} whileTap={{ scale: 0.97 }} style={{ marginTop: 24 }}>
        {t('save_continue')}
      </motion.button>
    </div>
  )
}
