import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'triageaid.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            village TEXT,
            phone TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS case_summaries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            patient_id INTEGER,
            urgency_level TEXT,
            chief_complaint TEXT,
            vital_signs_assessment TEXT,
            preliminary_observation TEXT,
            immediate_actions TEXT,
            suggested_questions TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (patient_id) REFERENCES patients(id)
        )
    ''')
    conn.commit()
    conn.close()

# Initialize on import
init_db()
