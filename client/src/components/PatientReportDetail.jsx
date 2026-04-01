import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { getFullPatientData } from '../db/db'
import { jsPDF } from 'jspdf'
import { saveAs } from 'file-saver'

export default function PatientReportDetail({ patientId, onBack }) {
  const { t } = useTranslation()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFullPatientData(patientId).then(d => {
      setData(d)
      setLoading(false)
    })
  }, [patientId])

  if (loading) return (
    <div className="screen" style={{ textAlign: 'center', padding: 40 }}>
      <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} style={{ fontSize: 40 }}>⚙️</motion.div>
      <p>Loading Medical Report...</p>
    </div>
  )

  if (!data?.patient) return (
    <div className="screen" style={{ textAlign: 'center', padding: 40 }}>
      <p>Error: Report not found.</p>
      <button className="btn-primary" onClick={onBack}>Go Back</button>
    </div>
  )

  const { patient, vitals, symptoms, history, summary } = data

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
      const drawRibbon = (title) => {
        if (y > pageHeight - 40) { 
          doc.addPage(); 
          doc.setDrawColor(0, 121, 107); doc.setLineWidth(1); doc.rect(5, 5, pageWidth - 10, pageHeight - 10);
          doc.setLineWidth(0.2); doc.rect(7, 7, pageWidth - 14, pageHeight - 14);
          y = 20; 
        }
        doc.setFillColor(240, 245, 244);
        doc.rect(15, y, pageWidth - 30, 8, 'F');
        doc.setDrawColor(0, 121, 107);
        doc.setLineWidth(0.8);
        doc.line(15, y, 15, y + 8); // left thick accent
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(0, 77, 64);
        doc.text(title, 20, y + 5.5);
        doc.setTextColor(0, 0, 0);
        y += 14;
      }

      // ===== PATIENT INFO =====
      drawRibbon('PATIENT INFORMATION');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Name:   ${patient?.name || 'N/A'}`, 20, y); 
      doc.text(`Age/Sex:   ${patient?.age || 'N/A'} yrs / ${patient?.gender || 'N/A'}`, pageWidth / 2, y); y += 6;
      doc.text(`Village:   ${patient?.village || 'N/A'}`, 20, y); 
      doc.text(`Date:   ${new Date(patient?.createdAt).toLocaleString()}`, pageWidth / 2, y); y += 12;

      // ===== VITALS GRID =====
      if (vitals && Object.keys(vitals).length > 0) {
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

        drawVitalBox('Temp (°F)', vitals.temp ? vitals.temp.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('Pulse (bpm)', vitals.pulse ? vitals.pulse.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('SpO2 (%)', vitals.spo2 ? vitals.spo2.toString() : '--', vx, vy); vx += 45;
        drawVitalBox('Resp Rate', vitals.rr ? vitals.rr.toString() : '--', vx, vy); 
        vx = 20; vy += 15;
        drawVitalBox('BP (mmHg)', (vitals.systolic && vitals.diastolic) ? `${vitals.systolic}/${vitals.diastolic}` : '--', vx, vy); vx += 45;
        drawVitalBox('Weight (kg)', vitals.weight ? vitals.weight.toString() : '--', vx, vy); 
        
        y = vy + 22;
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

      // ===== NEW: MEDICAL HISTORY & ALLERGIES =====
      if (history && (history.conditions?.length > 0 || history.allergies)) {
        drawRibbon('MEDICAL HISTORY & ALLERGIES');
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        let historyStr = "";
        if (history.conditions?.length > 0) historyStr += `Conditions: ${history.conditions.join(', ')}\n`;
        if (history.medications?.length > 0) historyStr += `Current Medications: ${history.medications.join(', ')}\n`;
        if (history.allergies) historyStr += `Allergies: ${history.allergies}\n`;
        if (history.hospitalized) historyStr += `Prev. Hospitalization: ${history.hospitalized}`;
        
        const hLines = doc.splitTextToSize(historyStr.trim(), pageWidth - 40);
        doc.text(hLines, 20, y);
        y += hLines.length * 5 + 6;
      }

      // ===== NEW: PHYSICIAN NOTES (Fill Space) =====
      if (y < pageHeight - 60) {
        drawRibbon('PHYSICIAN NOTES & OBSERVATIONS');
        doc.setDrawColor(200, 200, 200);
        for(let i=0; i<4; i++) {
          doc.line(20, y + (i*8), pageWidth - 20, y + (i*8));
        }
        y += 40;
      }

      // ===== NEW: REFERRAL / CLINIC STAMP =====
      doc.setDrawColor(0, 121, 107);
      doc.setLineWidth(0.5);
      doc.rect(pageWidth - 70, y, 55, 25);
      doc.setFontSize(8);
      doc.text('Clinic / Doctor Stamp', pageWidth - 42.5, y + 13, { align: 'center' });
      doc.text('Signature', pageWidth - 42.5, y + 22, { align: 'center' });

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
      <button onClick={onBack} style={{ background: 'none', border: 'none', fontSize: 16, color: 'var(--nav-btn-color)', cursor: 'pointer', padding: '8px 0', fontWeight: 700 }}>← {t('back') || 'Back'}</button>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, color: 'var(--text-main)' }}>📄 {t('report_header')}</h2>
        {summary && (
          <div style={{ background: urgencyColor[summary.urgency_level], color: 'white', padding: '4px 12px', borderRadius: 20, fontSize: 12, fontWeight: 800 }}>
             {summary.urgency_level}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div style={{ fontWeight: 800, fontSize: 18, color: 'var(--text-main)' }}>{patient.name}</div>
        <div style={{ color: 'var(--text-sub)', fontSize: 14 }}>{patient.age} {t('age_yrs') || 'yrs'} · {t(patient.gender?.toLowerCase()) || patient.gender} · {patient.village}</div>
        <div style={{ color: 'var(--text-sub)', opacity: 0.6, fontSize: 12, marginTop: 4 }}>Date: {new Date(patient.createdAt).toLocaleString()}</div>
      </div>

      {vitals && (
        <div className="card" style={{ marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: 'var(--nav-btn-color)', marginBottom: 8 }}>📊 {t('vitals_summary')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 13, color: 'var(--text-main)' }}>
            <div>{t('pulse')}: <b>{vitals.pulse} {t('bpm')}</b></div>
            <div>{t('temperature')}: <b>{vitals.temp}°F</b></div>
            <div>{t('bp')}: <b>{vitals.systolic}/{vitals.diastolic}</b></div>
            <div>{t('spo2')}: <b>{vitals.spo2}%</b></div>
            <div>{t('weight')}: <b>{vitals.weight} kg</b></div>
            <div>{t('rr')}: <b>{vitals.rr}</b></div>
          </div>
        </div>
      )}

      {summary && (
        <div className="summary-content" style={{ marginBottom: 20 }}>
          {[
            { title: `🩺 ${t('chief_complaint')}`, content: summary.chief_complaint },
            { title: `📊 ${t('vitals_summary')}`, content: summary.vital_signs_assessment },
            { title: `🔍 ${t('preliminary_obs')}`, content: summary.preliminary_observation },
            { title: `⚡ ${t('immediate_actions')}`, content: summary.immediate_actions },
            { title: `❓ ${t('doc_questions')}`, content: summary.suggested_questions }
          ].map((s, i) => s.content ? (
            <div key={i} className="card section-card" style={{ marginBottom: 12, borderLeft: '4px solid var(--nav-btn-color)' }}>
              <div style={{ fontWeight: 700, color: 'var(--nav-btn-color)', marginBottom: 6 }}>{s.title}</div>
              <div style={{ fontSize: 14, color: 'var(--text-main)', lineHeight: 1.6 }}>{s.content}</div>
            </div>
          ) : null)}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <button className="btn-primary" onClick={downloadPDF} style={{ height: 56 }}>
          📥 {t('download')}
        </button>

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
