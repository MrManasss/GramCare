import Dexie from 'dexie';

export const db = new Dexie('TriageAidDB');

db.version(1).stores({
  patients: '++id, name, village, createdAt, synced',
  vitals: '++id, patientId, createdAt',
  symptoms: '++id, patientId, createdAt',
  history: '++id, patientId, createdAt',
  caseSummaries: '++id, patientId, urgency, createdAt, synced'
});

export async function savePatient(data) {
  return await db.patients.add({ ...data, createdAt: new Date().toISOString(), synced: false });
}

export async function saveVitals(patientId, data) {
  return await db.vitals.add({ patientId, ...data, createdAt: new Date().toISOString() });
}

export async function saveSymptoms(patientId, data) {
  return await db.symptoms.add({ patientId, ...data, createdAt: new Date().toISOString() });
}

export async function saveHistory(patientId, data) {
  return await db.history.add({ patientId, ...data, createdAt: new Date().toISOString() });
}

export async function saveCaseSummary(patientId, data) {
  return await db.caseSummaries.add({ patientId, ...data, createdAt: new Date().toISOString(), synced: false });
}

export async function getAllPatients() {
  return await db.patients.orderBy('createdAt').reverse().toArray();
}

export async function getPatientById(id) {
  return await db.patients.get(id);
}

export async function getTodayCount() {
  const today = new Date().toDateString();
  const all = await db.patients.toArray();
  return all.filter(p => new Date(p.createdAt).toDateString() === today).length;
}

export async function getWeekRedFlags() {
  const week = new Date(Date.now() - 7*24*60*60*1000).toISOString();
  const all = await db.caseSummaries.toArray();
  return all.filter(s => s.urgency === 'EMERGENCY' && s.createdAt > week).length;
}

export async function deletePatientFull(patientId) {
  const id = Number(patientId);
  try {
    await db.transaction('rw', [db.patients, db.vitals, db.symptoms, db.history, db.caseSummaries], async () => {
      await db.patients.delete(id);
      await db.vitals.where('patientId').equals(id).delete();
      await db.symptoms.where('patientId').equals(id).delete();
      await db.history.where('patientId').equals(id).delete();
      await db.caseSummaries.where('patientId').equals(id).delete();
    });
    console.log('Successfully deleted patient:', id);
  } catch (err) {
    console.error('Delete transaction failed:', err);
    throw err;
  }
}

export async function autoExpireOldRecords(days = 30) {
  try {
    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
    const oldPatients = await db.patients.filter(p => p.createdAt < cutoffDate).toArray();
    for (const p of oldPatients) {
      if (p.id) await deletePatientFull(p.id);
    }
    if (oldPatients.length > 0) {
      console.log(`Auto-expired ${oldPatients.length} records older than ${days} days.`);
    }
  } catch (err) {
    console.error('Auto-expire failed:', err);
  }
}

export async function getFullPatientData(patientId) {
  const id = Number(patientId);
  const patient = await db.patients.get(id);
  const vitals = await db.vitals.where('patientId').equals(id).first();
  const symptoms = await db.symptoms.where('patientId').equals(id).first();
  const history = await db.history.where('patientId').equals(id).first();
  const summary = await db.caseSummaries.where('patientId').equals(id).first();

  return { patient, vitals, symptoms, history, summary };
}
