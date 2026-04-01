from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class PatientCreate(BaseModel):
    name: str
    age: int
    gender: str
    village: str
    phone: Optional[str] = None

class PatientResponse(BaseModel):
    id: int
    name: str
    age: int
    gender: str
    village: str
    phone: Optional[str] = None
    created_at: Optional[str] = None

class CaseSummaryCreate(BaseModel):
    patient_id: int
    urgency_level: str
    chief_complaint: str
    vital_signs_assessment: Optional[str] = None
    preliminary_observation: Optional[str] = None
    immediate_actions: Optional[str] = None
    suggested_questions: Optional[str] = None

class CaseSummaryResponse(BaseModel):
    id: int
    patient_id: int
    urgency_level: str
    chief_complaint: str
    vital_signs_assessment: Optional[str] = None
    preliminary_observation: Optional[str] = None
    immediate_actions: Optional[str] = None
    suggested_questions: Optional[str] = None
    created_at: Optional[str] = None
