# InclusiveAI — Where No One Is Left Behind

InclusiveAI is an AI-powered platform designed to make university campuses truly accessible. It provides real-time assistive technology, mental health support, and campus safety features.

## 🚀 Getting Started

### 1. Install Dependencies
The project uses `npm`. Dependencies are managed automatically in this environment, but if you were running this locally, you would run:
```bash
npm install
```

### 2. Run the Development Server
To start the Next.js application:
```bash
npm run dev
```
The app will be available at `http://localhost:9002`.

### 3. Run Genkit (Optional)
To debug or explore the AI flows using the Genkit Developer UI:
```bash
npm run genkit:dev
```

## 🛠 Tech Stack
- **Framework:** Next.js 15 (App Router)
- **AI Engine:** Genkit 1.x with Gemini 1.5 Flash
- **Database:** Firebase Firestore
- **Authentication:** Firebase Auth
- **Styling:** Tailwind CSS & ShadCN UI
- **Icons:** Lucide React

## 🧩 Core Modules

### 1. AccessAssist
Transforms any educational content into accessible formats.
- **Dyslexia Mode:** Specialized fonts (OpenDyslexic, Atkinson Hyperlegible).
- **Transformation:** Real-time text simplification and translation.
- **Transcription:** (Coming Soon) Live lecture captions.

### 2. WellnessCompanion
A 24/7 AI wellbeing partner for students.
- **WellnessBot:** Compassionate chat with distress detection.
- **Human Handoff:** Automatically alerts campus counselors for high-risk situations.
- **Mood Logs:** Private tracking of emotional trends over time.

### 3. CrisisRadar
Real-time campus safety and emergency response.
- **Sensor Fusion:** Monitors rainfall, temperature, and wind.
- **AI Alerts:** Drafts emergency notifications in English, Hindi, and Tamil.
- **Risk Zones:** Visual map indicators for campus safety.

### 4. InclusionDesignKit
A tool for campus developers to ensure digital accessibility.
- **WCAG Audit:** Automated scans for WCAG 2.2 compliance.
- **Fix Queue:** AI-generated remediation suggestions and code snippets.

## 📁 Project Structure
- `src/app/`: Next.js pages and layouts.
- `src/ai/`: Genkit flows and AI prompt definitions.
- `src/components/`: Reusable React components (UI & Layout).
- `src/firebase/`: Firebase configuration and hooks.
- `docs/backend.json`: Blueprint for data structures and roles.
