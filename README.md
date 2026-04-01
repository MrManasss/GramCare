# GramCare: Offline-First AI Telemedicine PWA

**GramCare** is a next-generation Progressive Web Application (PWA) designed to provide high-quality healthcare support in areas with low or zero internet connectivity. It enables frontline health workers to capture patient data, vitals, and symptoms offline, and uses AI to generate standardized **eSanjeevani-compliant** clinical case summaries once connectivity is restored.

---

## 🚀 Key Features

- **Offline-First Workflow**: Complete patient registration and clinical capture without an active internet connection.
- **AI Case Summaries**: Leverages LLMs (via Groq API) to convert raw clinical data into professional medical summaries.
- **eSanjeevani Integration**: Standardized clinical summary format ready for teleconsultation upload.
- **Multi-lingual Support**: Native support for English, Hindi, and colloquial dialects to ensure accessibility.
- **PWA Excellence**: Fully installable on Android/iOS with sub-second load times.

---

## 🏗️ Offline Architecture

GramCare implements a robust **Offline-First Architecture** to ensure data persistence even during total network failure.

### 1. Service Workers (The Middleware)
Using `vite-plugin-pwa`, we register a custom Service Worker that:
- **Caches Assets**: Uses a `Cache-First` strategy for CSS, JS, and UI icons, allowing the app to load instantly offline.
- **Stale-While-Revalidate**: Ensures the user always has the latest UI while keeping the app functional during sync.

### 2. IndexedDB & Dexie (The Local Database)
For patient records and vital signs, we use **IndexedDB** instead of traditional `localStorage`:
- **Transactional Safety**: Prevents data corruption during sudden device shutdowns.
- **Capacity**: Can store thousands of patient records locally without hitting browser limits.
- **Sync Logic**: When the device detects an online state via the `navigator.onLine` API, the app triggers a background sync to push pending cases to our FastAPI backend.

---

## 🩺 eSanjeevani Case Summary Documentation

Our backend (FastAPI + Llama-3-Groq) is specifically prompted to output summaries in the official **eSanjeevani** format:

| Section | Description |
| :--- | :--- |
| **Chief Complaints** | Primary reasons for the visit with duration. |
| **History** | Relevant past medical history and lifestyle factors. |
| **Vitals** | BP, Spo2, Pulse, Temperature, and BMI calculation. |
| **Systemic Exam** | Observations from Respiratory, CNS, and CVS systems. |
| **AI Assessment** | Differential diagnosis based on captured red flags. |

---

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, TailwindCSS (Modern, responsive UI).
- **Offline Storage**: Dexie.js (IndexedDB wrapper).
- **Backend**: FastAPI (Python) - High performance and asynchronous.
- **AI Engine**: Llama-3 via **Groq Cloud API** (Ultra-fast inference).
- **Deployment**: Vercel (Frontend) & Render (Backend).

---

## 📸 Media & Submission Proofs

### 1. Symptom Selection UI
![Symptom Selection Screenshot](https://via.placeholder.com/800x450?text=Upload+Icon-based+Symptom+Selection+Screenshot+Here)
*Visual icon-based triage for ease of use by health workers.*

### 2. Demo Video (Offline Sync)
[Click here to watch the Demo Video](https://via.placeholder.com/800x450?text=Upload+Link+to+Demo+Video+Here)
*Demonstrates offline data entry followed by automatic sync and AI generation.*

### 3. Lighthouse PWA Audit
![Lighthouse Score](https://via.placeholder.com/800x450?text=Upload+Lighthouse+PWA+Score+Screenshot+Here)
*Verification of PWA compliance, performance, and best practices.*

---

## 💻 Installation & Setup

1. **Clone the repo**: `git clone https://github.com/MrManasss/GramCare.git`
2. **Frontend Support**: `cd client && npm install && npm run dev`
3. **Backend Support**: `cd server && pip install -r requirements.txt && uvicorn main:app`

---

Created for the **Hackathon 2024** | **Team GramCare**
