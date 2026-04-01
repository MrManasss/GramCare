from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv
import json
from groq import Groq

load_dotenv()

app = FastAPI(title="TriageAid API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

class SessionData(BaseModel):
    patient: Optional[dict] = None
    vitals: Optional[dict] = None
    symptoms: Optional[dict] = None
    history: Optional[dict] = None
    redFlags: Optional[List[str]] = []

@app.get("/")
def root():
    return {"status": "TriageAid API running"}

@app.post("/api/case-summary")
async def generate_case_summary(data: SessionData):
    p = data.patient or {}
    v = data.vitals or {}
    s = data.symptoms or {}
    h = data.history or {}
    flags = data.redFlags or []

    prompt = f"""You are a medical triage assistant helping rural health workers in India prepare structured pre-consultation summaries for telemedicine doctors.

Generate a structured eSanjeevani-compatible case summary based on:
Patient: {p.get('name','Unknown')}, {p.get('age','?')}yr, {p.get('gender','?')}, from {p.get('village','?')}
Vitals: Temperature {v.get('temp','N/A')}°F, Pulse {v.get('pulse','N/A')}bpm, BP {v.get('systolic','N/A')}/{v.get('diastolic','N/A')}, SpO2 {v.get('spo2','N/A')}%, RR {v.get('rr','N/A')}
Chief Complaints: {', '.join(s.get('selected', []))} for {s.get('duration','unknown')}, Notes: {s.get('notes','')}
Medical History: Conditions: {', '.join(h.get('conditions',[]))}, Medications: {', '.join(h.get('medications',[]))}, Allergies: {h.get('allergies','None')}
Red Flags: {', '.join(flags) if flags else 'None'}

Return ONLY a valid JSON object with these exact keys:
{{
  "chief_complaint": "one sentence",
  "vital_signs_assessment": "assessment of vitals",
  "preliminary_observation": "what this might suggest",
  "suggested_questions": "5 questions for doctor",
  "immediate_actions": "what health worker should do now",
  "urgency_level": "ROUTINE or PRIORITY or EMERGENCY",
  "urgency_reasoning": "one line reason"
}}

Keep language simple. This will be read by a doctor in 30 seconds."""

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800
        )
        text = response.choices[0].message.content
        # Parse JSON from response
        start = text.find('{')
        end = text.rfind('}') + 1
        json_str = text[start:end]
        result = json.loads(json_str)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/sync")
async def sync_records(records: list):
    # Accept bulk sync from frontend
    return {"synced": len(records), "status": "ok"}

@app.get("/api/stats")
async def get_stats():
    return {"total_patients": 0, "today": 0, "red_flags": 0}
