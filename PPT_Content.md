# CogniscanAI — PPT Content Guide

---

## Slide 1 — Title Slide

**CogniscanAI**
*AI-Powered Early Cognitive Decline Detection*

Tagline: Early Detection. Better Prevention.

Team: Pranav Ghodke · Jui Katkade · Aditya Chavan · Gauri Borse

---

## Slide 2 — Problem Statement

**Cognitive decline goes undetected — until it's too late.**

- Over 55 million people worldwide live with dementia; that number doubles every 20 years (WHO, 2023)
- Early-stage Alzheimer's and MCI (Mild Cognitive Impairment) show no obvious symptoms for years
- Traditional diagnosis requires expensive neurological tests, specialist visits, and long wait times
- Most patients are diagnosed only after significant cognitive loss has already occurred
- Rural and low-income populations have virtually no access to cognitive screening tools
- Caregivers lack real-time data to monitor a patient's cognitive trajectory over time

**The gap:** No accessible, affordable, continuous cognitive screening exists for everyday users.

---

## Slide 3 — Proposed Solution

**CogniscanAI** is a web-based cognitive screening platform that uses AI and multimodal analysis to detect early signs of cognitive decline — from any device, in under 10 minutes.

### What it does:
- Administers 5 scientifically-grounded cognitive tests (memory, reaction, pattern recognition, speech, facial expression)
- Computes a composite cognitive score (0–100) with risk classification: Low / Medium / High
- Generates AI-powered insights using Groq LLM
- Tracks cognitive history over time with trend visualization
- Alerts caregivers and doctors automatically on high-risk results
- Sends weekly reminder emails to encourage consistent screening
- Exports a detailed PDF health report for clinical sharing

### Who it's for:
- Individuals aged 50+ concerned about cognitive health
- Caregivers and family members monitoring a loved one
- General practitioners needing a quick pre-screening tool

---

## Slide 4 — Approach / Methodology

### Multimodal Cognitive Assessment Pipeline

**Step 1 — Memory Test**
- Sequence recall task: user memorizes and reproduces a pattern of items
- Evaluates short-term working memory and recall accuracy
- Score based on correct recall rate and response time

**Step 2 — Reaction Time Test**
- Visual stimulus response task
- Measures processing speed and psychomotor response
- Scored against age-normalized benchmarks; penalizes missed or false responses

**Step 3 — Pattern Recognition Test**
- Spatial pattern matching under time pressure
- Assesses visuospatial reasoning and executive function
- Score derived from accuracy and completion speed

**Step 4 — Speech Analysis**
- User records a short spoken response
- NLTK analyzes lexical diversity, filler word frequency, and sentence coherence
- Librosa extracts acoustic features: pitch variance, speech rate, pause patterns
- Deviations from baseline indicate early language/cognitive markers

**Step 5 — Facial Expression Analysis**
- Webcam-based micro-expression capture via OpenCV
- Detects affect flatness, reduced expressiveness, and asymmetry
- These are known early biomarkers of neurological change

### Scoring Engine
- Each test produces a normalized sub-score (0–100)
- Weighted composite formula: Memory 30% · Reaction 25% · Pattern 20% · Speech 15% · Facial 10%
- Risk classification thresholds: Low (≥70) · Medium (45–69) · High (<45)
- Scikit-learn SVM and Random Forest models trained on cognitive benchmark datasets refine the final score

### AI Insight Layer
- Groq LLM (LLaMA 3) generates a personalized natural-language explanation of the result
- Contextualizes score, highlights weak domains, and provides actionable recommendations

---

## Slide 5 — Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Backend | Python (FastAPI) | API handling & business logic |
| Vision | OpenCV | Facial expression analysis |
| NLP / Audio | NLTK / Librosa | Speech processing & linguistic analysis |
| ML Models | Scikit-learn | SVM & Random Forest scoring models |
| Database | MongoDB | NoSQL data storage for users & history |
| Version Control | Git & GitHub | Source control & collaboration |
| Frontend | Next.js 14 (TypeScript) | Reactive UI, test interfaces |
| Styling | Tailwind CSS | Utility-first responsive design |
| AI Inference | Groq API (LLaMA 3) | Natural language insight generation |
| Auth | JWT (PyJWT) | Stateless token-based authentication |
| Email | SMTP / Gmail | Welcome, alert & reminder emails |
| Deployment | Vercel (frontend) · Render (backend) | Cloud hosting |

---

## Slide 6 — Expected Impact

### Clinical Impact
- Enables early detection of MCI and Alzheimer's precursors — when intervention is most effective
- Bridges the gap between annual neurologist visits with continuous at-home monitoring
- Provides clinicians with longitudinal cognitive data, not just a single snapshot

### Social Impact
- Democratizes access to cognitive screening — no specialist, no clinic, no cost
- Empowers caregivers with real-time alerts and trend data
- Reduces diagnostic delay from years to minutes

### Quantified Targets
- 10-minute full assessment vs. 2–4 hour traditional neuropsychological battery
- Target user base: 500M+ adults aged 50+ globally
- Potential to reduce late-stage diagnosis rates by enabling earlier intervention pathways
- Weekly reminders drive consistent longitudinal data — improving model accuracy over time

### Research Value
- Anonymized aggregate data can train progressively better ML models
- Contributes to open research on digital biomarkers for cognitive health

---

## Slide 7 — Feasibility & Scalability

### Why It's Feasible Now
- All core technologies are mature, open-source, and production-ready
- No specialized hardware required — runs entirely in a standard web browser
- Backend deployed on Render (auto-scaling); frontend on Vercel (global CDN)
- MongoDB Atlas scales horizontally with zero infrastructure management
- Groq API provides sub-second LLM inference at low cost

### Technical Scalability
- Stateless FastAPI backend — horizontally scalable behind a load balancer
- MongoDB sharding supports millions of user records without schema changes
- Modular test architecture — new cognitive modules can be added without touching existing logic
- JWT-based auth requires no session state — scales to any number of concurrent users

### Regulatory & Ethical Considerations
- Positioned as a screening tool, not a diagnostic device — avoids FDA/CE medical device classification
- Data encrypted in transit (HTTPS) and at rest (MongoDB Atlas encryption)
- Users own their data; export and deletion supported
- No PII shared with third-party ML services

### Roadmap to Scale
1. **v1 (Current)** — Web app, 5 tests, score + AI insight, caregiver alerts
2. **v2** — Mobile app (React Native), offline test support, doctor portal
3. **v3** — Wearable integration (heart rate variability as additional biomarker), clinical API for hospital EHR systems
4. **v4** — Federated learning across anonymized user data to continuously improve ML models

---

*CogniscanAI — Early Detection. Better Prevention.*
