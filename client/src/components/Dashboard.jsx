import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getTodayCount, getWeekRedFlags, getAllPatients } from '../db/db'

export default function Dashboard({ onNewPatient, onViewHistory, onChangePIN }) {
  const { t } = useTranslation()
  const [stats, setStats] = useState({ today: 0, week: 0, flags: 0 })

  useEffect(() => {
    async function load() {
      const today = await getTodayCount()
      const flags = await getWeekRedFlags()
      const all = await getAllPatients()
      const weekAgo = new Date(Date.now() - 7*24*60*60*1000).toISOString()
      const week = all.filter(p => p.createdAt > weekAgo).length
      setStats({ today, week, flags })
    }
    load()
  }, [])

  return (
    <div className="screen">
      <div style={{ paddingTop: 16, paddingBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--nav-btn-color)', margin: 0 }}>{t('app_name')}</h1>
          <p style={{ color: 'var(--text-sub)', marginTop: 4, fontSize: 15 }}>{t('welcome_worker')}</p>
        </div>
        <button onClick={onChangePIN} style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', padding: 4, opacity: 0.7 }}>
          ⚙️
        </button>
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
        {[
          { label: t('today_patients'), value: stats.today, color: 'var(--nav-btn-color)', bg: 'var(--card-bg)', shadow: 'rgba(0,121,107,0.3)', border: 'var(--nav-btn-color)' },
          { label: t('week_patients'), value: stats.week, color: '#3b82f6', bg: 'var(--card-bg)', shadow: 'rgba(21,101,192,0.3)', border: '#3b82f6' },
          { label: t('red_flags'), value: stats.flags, color: '#ef4444', bg: 'var(--card-bg)', shadow: 'rgba(198,40,40,0.3)', border: '#ef4444' }
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="card card-interactive" style={{ textAlign: 'center', background: s.bg, borderTop: 'none', borderBottom: `4px solid ${s.border}`, boxShadow: `0 8px 25px ${s.shadow}`, padding: 12 }}>
            <div style={{ fontSize: 32, fontWeight: 900, color: s.color, textShadow: `0 2px 10px ${s.shadow}` }}>{s.value}</div>
            <div style={{ fontSize: 11, fontWeight: 800, color: s.color, marginTop: 4 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Action buttons */}
      <motion.button className="btn-primary" onClick={onNewPatient}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ marginBottom: 12 }}>
        ➕ {t('new_patient')}
      </motion.button>
      <motion.button className="btn-secondary" onClick={onViewHistory}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        📋 {t('view_records')}
      </motion.button>

      {/* Quick info cards */}
      <div style={{ marginTop: 24 }}>
        <div className="card card-interactive" style={{ borderLeft: 'none', background: 'var(--card-bg)', boxShadow: '0 8px 30px rgba(0,121,107,0.15)', borderBottom: '4px solid var(--nav-btn-color)', marginBottom: 12 }}>
          <div style={{ fontWeight: 800, color: 'var(--nav-btn-color)', marginBottom: 4 }}>{t('esanjeevani_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{t('esanjeevani_desc')}</div>
        </div>
        <div className="card card-interactive" style={{ borderLeft: 'none', background: 'var(--card-bg)', boxShadow: '0 8px 30px rgba(255,179,0,0.15)', borderBottom: '4px solid #f59e0b' }}>
          <div style={{ fontWeight: 800, color: '#f59e0b', marginBottom: 4 }}>{t('offline_title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-sub)' }}>{t('offline_desc')}</div>
        </div>
      </div>
    </div>
  )
}
