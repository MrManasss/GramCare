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


   ## Front Page 

<img width="552" height="921" alt="Screenshot 2026-04-01 132212" src="https://github.com/user-attachments/assets/6520233c-a39c-4c62-9bf2-be6b2267e18e" />


   ## User Details 
 
<img width="563" height="908" alt="Screenshot 2026-04-01 132429" src="https://github.com/user-attachments/assets/c40ba801-f652-4b93-a724-3e0300251e06" />


   ## Symptoms 
 
<img width="550" height="916" alt="Screenshot 2026-04-01 132505" src="https://github.com/user-attachments/assets/63a2acb4-bff6-4789-80ed-c49cbc104c9c" />


   ## Medical History 
 
<img width="547" height="918" alt="Screenshot 2026-04-01 132556" src="https://github.com/user-attachments/assets/c9fb5e41-75c3-4036-b064-622bd3ba7a82" />


   ## AI Response 
 
<img width="549" height="922" alt="Screenshot 2026-04-01 132615" src="https://github.com/user-attachments/assets/33100371-a618-4ff5-9f74-363520c22bea" />


   ## Summery 

<img width="554" height="915" alt="Screenshot 2026-04-01 132747" src="https://github.com/user-attachments/assets/151208a2-6192-41bb-8b25-aa80a65c1c8b" />



---

## 💻 Installation & Setup

1. **Clone the repo**: `git clone https://github.com/MrManasss/GramCare.git`
2. **Frontend Support**: `cd client && npm install && npm run dev`
3. **Backend Support**: `cd server && pip install -r requirements.txt && uvicorn main:app`

---

Created for the **Hackathon 2024** | **Team GramCare**
