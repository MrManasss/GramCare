import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { saveCaseSummary } from '../db/db'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function CaseSummary({ sessionData, onBack }) {
  const { t } = useTranslation()
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    generateSummary()
  }, [])

  async function generateSummary() {
    if (!navigator.onLine) {
      setError('offline')
      setLoading(false)
      return
    }
    try {
      const res = await fetch(`${BACKEND}/api/case-summary`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sessionData)
      })
      if (!res.ok) {
        const errObj = await res.json()
        console.error("Backend Error:", errObj)
        throw new Error(errObj.detail || 'API failed')
      }
      const data = await res.json()
      setSummary(data)
      await saveCaseSummary(sessionData.patient?.id, { ...data, urgency: data.urgency_level })
    } catch (e) {
      setError('failed')
    }
    setLoading(false)
  }

  const readAloud = () => {
    if (!summary || !sessionData?.patient) return
    const text = `Case Summary. Patient: ${sessionData.patient.name}. Urgency: ${summary.urgency_level || 'Unknown'}. ${summary.chief_complaint || ''}. ${summary.preliminary_observation || ''}. Immediate actions: ${summary.immediate_actions || ''}`
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-IN'
    window.speechSynthesis.speak(utterance)
  }

  const downloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let y = 15;

      // Draw overall page border
      doc.setDrawColor(0, 121, 107);
      doc.setLineWidth(1);
      doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
      doc.setLineWidth(0.2);
      doc.rect(7, 7, pageWidth - 14, pageHeight - 14);

      // ===== HEADER =====
      doc.setFillColor(230, 242, 241); // light teal
      doc.rect(8, 8, pageWidth - 16, 25, 'F');
      doc.setTextColor(0, 77, 64);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('TriageAid Medical Report', pageWidth / 2, 25, { align: 'center' });
      
      // Draw Urgency Badge (Top Right)
      if (summary?.urgency_level) {
        const urgColors = { 'EMERGENCY': [229, 57, 53], 'PRIORITY': [255, 179, 0], 'ROUTINE': [67, 160, 71] };
        const uc = urgColors[summary.urgency_level] || [67, 160, 71];
        doc.setFillColor(uc[0], uc[1], uc[2]);
        doc.roundedRect(pageWidth - 45, 12, 32, 10, 2, 2, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text(summary.urgency_level, pageWidth - 29, 18.5, { align: 'center' });
      }

      y = 45;

      // ===== Helper: Section Ribbon =====
      const drawRibbon = (title, r, g, b) => {
        if (y > pageHeight - 40) { 
          doc.addPage(); 
          doc.setDrawColor(0, 121, 107); doc.setLineWidth(1); doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
          doc.setLineWidth(0.2); doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
          y = 20; 
        }
        r = r !== undefined ? r : 0; g = g !== undefined ? g : 121; b = b !== undefined ? b : 107;
        doc.setFillColor(240, 245, 244);
        doc.rect(15, y, pageWidth - 30, 8, 'F');
        doc.setDrawColor(r, g, b);
        doc.setLineWidth(0.8);
        doc.line(15, y, 15, y + 8); // left thick accent
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(r === 0 ? 0 : r - 20, g === 121 ? 77 : g, b === 107 ? 64 : b);
        doc.text(title, 20, y + 5.5);
        doc.setTextColor(0, 0, 0);
        y += 14;
      }

      // ===== PATIENT INFO =====
      drawRibbon('PATIENT INFORMATION');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const patient = sessionData.patient || {};
      doc.text(`Name:   ${patient?.name || 'N/A'}`, 20, y); 
      doc.text(`Age/Sex:   ${patient?.age || 'N/A'} yrs / ${patient?.gender || 'N/A'}`, pageWidth / 2, y); y += 6;
      doc.text(`Village:   ${patient?.village || 'N/A'}`, 20, y); 
      doc.text(`Date:   ${new Date().toLocaleString()}`, pageWidth / 2, y); y += 12;

      // ===== VITALS GRID =====
      const v = sessionData.vitals || {};
      if (Object.keys(v).length > 0) {
        drawRibbon('RECORDED VITALS');
        doc.setFontSize(10);
        let vx = 20;
        let vy = y;
        
        const drawVitalBox = (label, val, x, yPos) => {
          doc.setDrawColor(220, 220, 220);
          doc.setFillColor(250, 252, 252);
          doc.roundedRect(x, yPos, 40, 12, 1, 1, 'FD');
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(100, 110, 110);
          doc.setFontSize(8);
          doc.text(label, x + 3, yPos + 4);
          doc.setTextColor(0, 0, 0);
          doc.setFontSize(10);
          doc.text(val || '--', x + 3, yPos + 10);
        }

        drawVitalBox('Temp (°F)', v.temp ? v.temp.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('Pulse (bpm)', v.pulse ? v.pulse.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('SpO2 (%)', v.spo2 ? v.spo2.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('Resp Rate', v.rr ? v.rr.toString() : '--', vx, vy); 
        vx = 20; vy += 15;
        drawVitalBox('BP (mmHg)', (v.systolic && v.diastolic) ? `${v.systolic}/${v.diastolic}` : '--', vx, vy); vx += 45;
        drawVitalBox('Weight (kg)', v.weight ? v.weight.toString() : '--', vx, vy); 
        
        y = vy + 22;
      }

      // ===== RED FLAGS =====
      const flags = sessionData.redFlags || [];
      if (flags.length > 0) {
        drawRibbon('REPORTED RED FLAGS', 198, 40, 40);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        flags.forEach(f => {
          const fLines = doc.splitTextToSize(`• ${f.trim()}`, pageWidth - 40);
          doc.text(fLines, 20, y);
          y += fLines.length * 5 + 2;
        });
        y += 6;
      }

      // ===== SUMMARY SECTIONS =====
      const addSection = (title, content) => {
        if (!content) return;
        drawRibbon(title);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        const sLines = doc.splitTextToSize(content.trim(), pageWidth - 40);
        doc.text(sLines, 20, y);
        y += sLines.length * 5 + 6;
      };

      addSection('CHIEF COMPLAINT', summary?.chief_complaint);
      addSection('VITAL SIGNS ASSESSMENT', summary?.vital_signs_assessment);
      addSection('PRELIMINARY OBSERVATION', summary?.preliminary_observation);
      if (summary?.urgency_reasoning) {
        addSection('URGENCY REASONING', summary.urgency_reasoning);
      }
      addSection('IMMEDIATE ACTIONS', summary?.immediate_actions);
      addSection('QUESTIONS FOR DOCTOR', summary?.suggested_questions);

      // ===== FOOTER =====
      if (y > pageHeight - 30) { 
        doc.addPage(); 
        doc.setDrawColor(0, 121, 107); doc.setLineWidth(1); doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
        doc.setLineWidth(0.2); doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
      }
      const footerY = pageHeight - 15;
      doc.setDrawColor(200, 200, 200);
      doc.setLineWidth(0.3);
      doc.line(15, footerY - 5, pageWidth - 15, footerY - 5);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text('TriageAid Medical OS — Electronically generated report. Consult a licensed medical professional.', pageWidth / 2, footerY, { align: 'center' });

      // Open PDF in new tab
      const pdfBlob = doc.output('blob');
      const blobUrl = URL.createObjectURL(pdfBlob);
      window.open(blobUrl, '_blank');
    } catch (e) {
      alert("PDF Error: " + e.message);
    }
  }

  const urgencyColor = { 'ROUTINE': '#43a047', 'PRIORITY': '#ffb300', 'EMERGENCY': '#ff6b6b' }

  return (
    <div className="screen">
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: '#00796b', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back')}</button>
      <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 20 }}>📄 {t('summary_title')}</h2>

      {/* Patient info card */}
      <div className="card" style={{ borderLeft: '4px solid var(--nav-btn-color)', marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-main)' }}>{sessionData.patient?.name}</div>
        <div style={{ color: 'var(--text-sub)', fontSize: 14 }}>{sessionData.patient?.age} {t('age_yrs') || 'yrs'} · {t(sessionData.patient?.gender?.toLowerCase()) || sessionData.patient?.gender} · {sessionData.patient?.village}</div>
      </div>

      {sessionData.redFlags?.length > 0 && (
        <div className="red-flag-box" style={{ background: 'var(--bg-red-subtle)', border: '2px solid #ff6b6b', borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, color: '#ff6b6b', marginBottom: 8 }}>🚨 {t('red_flags_detected')}</div>
          {sessionData.redFlags.map((f, i) => <div key={i} style={{ fontSize: 13, color: '#ff6b6b', marginBottom: 4 }}>• {f}</div>)}
        </div>
      )}

      {loading && (
        <div className="no-print" style={{ textAlign: 'center', padding: 40 }}>
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: 40 }}>⚙️</motion.div>
          <p style={{ color: '#666', marginTop: 12 }}>{t('generating_summary')}</p>
        </div>
      )}

      {summary && (
        <div className="summary-content">
          <div className="urgency-badge" style={{ background: (summary && summary.urgency_level && urgencyColor[summary.urgency_level]) || '#43a047', color: 'white', borderRadius: 12, padding: '12px 20px', textAlign: 'center', marginBottom: 16 }}>
            <div style={{ fontSize: 22, fontWeight: 800 }}>{summary?.urgency_level || 'ROUTINE'}</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>{summary?.urgency_reasoning || ''}</div>
          </div>

          {[
            { title: `🩺 ${t('chief_complaint') || 'Chief Complaint'}`, content: summary?.chief_complaint },
            { title: `📊 ${t('vitals_summary') || 'Vital Signs'}`, content: summary?.vital_signs_assessment },
            { title: `🔍 ${t('preliminary_obs') || 'Preliminary Observation'}`, content: summary?.preliminary_observation },
            { title: `⚡ ${t('immediate_actions') || 'Immediate Actions'}`, content: summary?.immediate_actions },
            { title: `❓ ${t('doc_questions') || 'Questions for Doctor'}`, content: summary?.suggested_questions }
          ].map((s, i) => (
            <div key={i} className="card section-card" style={{ marginBottom: 12, borderLeft: '4px solid var(--nav-btn-color)' }}>
              <div style={{ fontWeight: 700, color: 'var(--nav-btn-color)', marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6 }}>{s.content}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
        <button className="btn-primary" onClick={downloadPDF} style={{ flex: 1, height: 56 }}>
          📥 {t('download')}
        </button>
        <button className="btn-secondary" onClick={readAloud} disabled={!summary} style={{ flex: 1, height: 56 }}>
          🔊 {t('listen')}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <button className="btn-secondary" onClick={() => {
            if (navigator.userAgent.match(/Android|iPhone/i)) {
              window.location.href = 'tel:108'
            } else {
              alert('Dial 108 emergency.')
            }
          }} style={{ width: '100%', height: 52, color: '#ff6b6b', borderColor: '#ff6b6b' }}>
          🚑 {t('call_emergency')}
        </button>
      </div>
    </div>
  )
}
