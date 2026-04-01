import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getAllPatients, deletePatientFull } from '../db/db'

export default function PatientHistory({ onBack, onViewReport }) {
  const { t } = useTranslation()
  const [patients, setPatients] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { getAllPatients().then(setPatients) }, [])

  const filtered = patients.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.village?.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = async (patientId, name) => {
    const pid = Number(patientId);
    try {
      await deletePatientFull(pid)
      setPatients(prev => prev.filter(p => Number(p.id || p.ID) !== pid))
    } catch (err) {
      alert('Delete failed! Check internet or try refreshing.');
    }
  }

  return (
    <div className="screen">
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--nav-btn-color)', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 16, color: 'var(--text-main)' }}>📋 {t('view_records')}</h2>

      <input placeholder="🔍 Search by name or village..."
        value={search} onChange={e => setSearch(e.target.value)}
        style={{ width: '100%', padding: 14, borderRadius: 12, border: '1.5px solid var(--input-border)', background: 'transparent', color: 'var(--text-main)', fontSize: 15, fontFamily: 'Nunito', marginBottom: 16 }} />

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', color: 'var(--text-sub)', padding: 40 }}>
          <div style={{ fontSize: 40 }}>📭</div>
          <p>No records found</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
            className="card card-interactive" style={{ borderLeft: '4px solid var(--nav-btn-color)', padding: 0, overflow: 'hidden' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' }}>
              <button 
                onClick={() => {
                  const pid = p.id || p.ID;
                  if (onViewReport) onViewReport(pid);
                }}
                style={{ 
                  flex: 1, 
                  textAlign: 'left', 
                  background: 'none', 
                  border: 'none', 
                  padding: 0, 
                  margin: 0,
                  cursor: 'pointer',
                  display: 'block'
                }}
              >
                <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-main)' }}>{p.name}</div>
                <div style={{ color: 'var(--text-sub)', fontSize: 14 }}>{p.village} · {p.age} yrs · {p.gender}</div>
                <div style={{ color: 'var(--text-sub)', opacity: 0.6, fontSize: 12, marginTop: 4 }}>{new Date(p.createdAt).toLocaleString()}</div>
                <div style={{ marginTop: 8, color: 'var(--nav-btn-color)', fontWeight: 700, fontSize: 13, textDecoration: 'underline' }}>
                  📄 OPEN FULL MEDICAL REPORT →
                </div>
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 10 }}>
                <div style={{ background: p.synced ? 'var(--bg-subtle)' : 'var(--bg-yellow-subtle)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 700, color: p.synced ? 'var(--nav-btn-color)' : '#b37f00' }}>
                  {p.synced ? '✓' : '⏳'} 
                </div>
                <button 
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const pid = p.id || p.ID;
                    handleDelete(pid, p.name);
                  }}
                  title="Delete"
                  style={{ 
                    background: 'var(--bg-red-subtle)', 
                    color: '#ff6b6b', 
                    border: '1.5px solid #ff6b6b', 
                    borderRadius: '8px', 
                    padding: '8px',
                    cursor: 'pointer', 
                    fontSize: '16px'
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
