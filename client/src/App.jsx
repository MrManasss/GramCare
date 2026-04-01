import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import i18n from 'i18next'
import { AnimatePresence, motion } from 'framer-motion'
import SplashScreen from './components/SplashScreen'
import PINLogin from './components/PINLogin'
import Dashboard from './components/Dashboard'
import PatientRegistration from './components/PatientRegistration'
import VitalsEntry from './components/VitalsEntry'
import SymptomCapture from './components/SymptomCapture'
import MedicalHistory from './components/MedicalHistory'
import RedFlagAlert from './components/RedFlagAlert'
import CaseSummary from './components/CaseSummary'
import PatientHistory from './components/PatientHistory'
import PatientReportDetail from './components/PatientReportDetail'
import OfflineBanner from './components/OfflineBanner'
import ChangePIN from './components/ChangePIN'
import { autoExpireOldRecords } from './db/db'

const slideVariants = {
  enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 })
}

export default function App() {
  const { t } = useTranslation()
  const [screen, setScreen] = useState('splash')
  const [direction, setDirection] = useState(1)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [sessionData, setSessionData] = useState({
    patient: null, vitals: {}, symptoms: {}, history: {}, redFlags: [], summary: null
  })
  const [navLoading, setNavLoading] = useState(false)
  
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Silently purge records older than 30 days in the background
    autoExpireOldRecords(30)

    // Dark Mode Initialization
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialDark = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
    setIsDark(initialDark);
    if (initialDark) document.documentElement.classList.add('dark');
  }, [])

  const toggleTheme = () => {
    setIsDark(prev => {
      const next = !prev;
      if (next) document.documentElement.classList.add('dark');
      else document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  const toggleLang = () => {
    const langs = ['en', 'hi', 'hg']
    const nextIdx = (langs.indexOf(i18n.language) + 1) % langs.length
    const next = langs[nextIdx]
    i18n.changeLanguage(next)
    localStorage.setItem('lang', next)
  }

  const getLangLabel = () => {
    if (i18n.language === 'en') return 'HI'
    if (i18n.language === 'hi') return 'HG'
    return 'EN'
  }

  const navigate = (to) => {
    const order = ['dashboard', 'registration', 'vitals', 'symptoms', 'medhistory', 'redflag', 'summary', 'history', 'reportDetail', 'changePin']
    const from = order.indexOf(screen)
    const toIdx = order.indexOf(to)
    setDirection(toIdx >= from ? 1 : -1)
    setScreen(to)
  }

  const updateSession = (key, data) => {
    setSessionData(prev => ({ ...prev, [key]: data }))
  }

  if (screen === 'splash') return <SplashScreen onDone={() => setScreen('login')} />

  if (screen === 'login') return (
    <div style={{ minHeight: '100vh' }}>
      <OfflineBanner />
      <PINLogin onSuccess={() => setScreen('dashboard')} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', position: 'relative', overflowX: 'hidden' }}>
      {navLoading && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: 40 }}>⚙️</motion.div>
          <div style={{ marginTop: 16, fontWeight: 700 }}>Processing...</div>
        </div>
      )}
      {screen !== 'splash' && (
        <div style={{ position: 'absolute', top: 20, right: 20, zIndex: 100, display: 'flex', gap: 10 }}>
          <button 
            onClick={toggleLang}
            style={{
              padding: '0 12px', height: 44, borderRadius: 22, border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'var(--card-shadow)', color: 'var(--nav-btn-color)', fontWeight: 800,
              fontSize: 14, cursor: 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            {getLangLabel()}
          </button>
          <button 
            onClick={toggleTheme}
            style={{
              width: 44, height: 44, borderRadius: '50%', border: '1px solid var(--card-border)',
              background: 'var(--card-bg)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)',
              boxShadow: 'var(--card-shadow)', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, cursor: 'pointer', transition: 'all 0.3s ease'
            }}
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>
      )}
      <OfflineBanner />
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={screen}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ type: 'tween', duration: 0.3 }}
          style={{ width: '100%' }}
        >
          {screen === 'dashboard' && <Dashboard onNewPatient={() => navigate('registration')} onViewHistory={() => navigate('history')} onChangePIN={() => navigate('changePin')} />}
          {screen === 'registration' && <PatientRegistration onNext={(data) => { updateSession('patient', data); navigate('vitals') }} onBack={() => navigate('dashboard')} />}
          {screen === 'vitals' && <VitalsEntry age={sessionData.patient?.age} onNext={(data) => { updateSession('vitals', data); navigate('symptoms') }} onBack={() => navigate('registration')} />}
          {screen === 'symptoms' && <SymptomCapture onNext={(data) => { updateSession('symptoms', data); navigate('medhistory') }} onBack={() => navigate('vitals')} />}
          {screen === 'medhistory' && <MedicalHistory onNext={(data) => {
            setNavLoading(true)
            // Wait slightly so the user sees something is happening
            setTimeout(() => {
              try {
                const currentSession = { ...sessionData, history: data }
                const flags = detectRedFlags(currentSession.vitals, currentSession.symptoms, currentSession.patient?.age, t)
                
                setSessionData(prev => ({ ...prev, history: data, redFlags: flags }))
                setNavLoading(false)
                
                if (flags && flags.length > 0) {
                  navigate('redflag')
                } else {
                  navigate('summary')
                }
              } catch (err) {
                console.error("Step 4 Navigation Error:", err)
                setNavLoading(false)
                alert("Error during calculation. Please check all values.")
              }
            }, 300)
          }} onBack={() => navigate('symptoms')} />}
          {screen === 'redflag' && <RedFlagAlert flags={sessionData.redFlags} onContinue={() => navigate('summary')} onBack={() => navigate('medhistory')} />}
          {screen === 'summary' && <CaseSummary sessionData={sessionData} onBack={() => navigate('dashboard')} />}
          {screen === 'history' && <PatientHistory onBack={() => navigate('dashboard')} onViewReport={(id) => { 
            setSelectedReportId(id); 
            navigate('reportDetail'); 
          }} />}
          {screen === 'reportDetail' && <PatientReportDetail patientId={selectedReportId} onBack={() => navigate('history')} />}
          {screen === 'changePin' && <ChangePIN onBack={() => navigate('dashboard')} />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function detectRedFlags(vitals, symptoms, age, t) {
  const flags = []
  const s = symptoms?.selected || []
  const v = vitals || {}
  const patientAge = Number(age) || 30 // default to adult if missing

  let maxPulse = 120, minPulse = 40;
  let maxRR = 30;
  let maxSys = 180, minSys = 80;

  if (patientAge < 3) { // Infant/Toddler
    maxPulse = 160; minPulse = 80;
    maxRR = 40;
    maxSys = 130; minSys = 60;
  } else if (patientAge < 12) { // Child
    maxPulse = 130; minPulse = 60;
    maxRR = 30;
    maxSys = 140; minSys = 70;
  }

  if (v.spo2 && Number(v.spo2) < 90) flags.push(t('flag_oxygen'))
  if (v.pulse && (Number(v.pulse) > maxPulse || Number(v.pulse) < minPulse)) flags.push(t('flag_heart'))
  if (v.systolic && (Number(v.systolic) > maxSys || Number(v.systolic) < minSys)) flags.push(t('flag_bp'))
  if (v.temp && Number(v.temp) > 104) flags.push(t('flag_fever'))
  if (v.rr && Number(v.rr) > maxRR) flags.push(t('flag_breathing'))
  if (s.includes('chest_pain') && s.includes('breathlessness')) flags.push(t('flag_cardiac'))
  if (s.includes('unconscious')) flags.push(t('flag_unconscious'))
  if (s.includes('snake_bite')) flags.push(t('flag_snake'))
  if (s.includes('pregnancy') && s.includes('bleeding')) flags.push(t('flag_preg_bleed'))
  if (s.includes('child_illness') && s.includes('fever') && s.includes('unconscious')) flags.push(t('flag_child_seizure'))

  return flags
}
