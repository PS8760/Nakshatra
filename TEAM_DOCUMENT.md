# 🧠 CogniscanAI – Project Execution Document
### AI-Powered Early Cognitive Decline Detection System

> **Team:** Pranav Ghodke · Jui Katkade · Aditya Chavan · Gauri Borse
> **Status:** ✅ Built · ✅ Deployed (Vercel + Render) · ✅ GitHub: PS8760/Nakshatra

---

## 🎯 1. Project Overview

### Objective
An AI-powered multimodal cognitive screening system that detects early signs of cognitive decline using:
- Memory recall tests
- Reaction time measurement
- Speech fluency analysis
- Pattern recognition (Simon-style sequence memory)

**Output:** Cognitive Risk Score (0–100) → Risk Level: 🟢 Low / 🟡 Medium / 🔴 High
**+ OpenAI GPT-3.5 personalized insight per result**

### What Makes It Different from the Original Plan
| Original Plan | What Was Built |
|---|---|
| Basic MVP, no DB | Full-stack with MongoDB Atlas |
| No auth | JWT auth (register/login/profile) |
| 3 tests | 4 tests (added Pattern Recognition) |
| Rule-based only | Rule-based + OpenAI GPT-3.5 insight |
| No history | Full test history with trend chart |
| Fake caregiver alert | Real caregiver portal + email alerts |
| No doctor info | Doctor finder with city filter |
| No contact | Contact form → Gmail SMTP |
| No animations | Framer Motion throughout |

---

## ⚡ 2. Core Strategy

✅ Rule-based scoring (no ML training needed)
✅ OpenAI API for personalized AI insight (post-scoring)
✅ Browser Speech API (zero setup, works in Chrome)
✅ MongoDB Atlas free tier (no cost)
✅ JWT auth (stateless, scalable)
✅ Framer Motion for demo-worthy animations
✅ Deployed: Vercel (frontend) + Render (backend)

---

## 🧩 3. Features Built

### 🔹 Pages
| Page | Route | Auth Required |
|---|---|---|
| Landing | `/` | No |
| How It Works | `/how-it-works` | No |
| About | `/about` | No |
| Register | `/register` | No |
| Login | `/login` | No |
| Test Flow | `/test` | ✅ Yes |
| Result | `/result` | ✅ Yes |
| Dashboard | `/dashboard` | ✅ Yes |
| Profile | `/profile` | ✅ Yes |
| Caregiver Portal | `/caregiver` | ✅ Yes |
| Find Doctors | `/doctors` | ✅ Yes |
| Contact | `/contact` | ✅ Yes |
| 404 | `/*` | No |

### 🔹 Cognitive Tests (4 domains)
| Test | What It Measures | Weight |
|---|---|---|
| 🧩 Memory | 3-word recall after 5s delay | 50% |
| ⚡ Reaction | Click speed on green circle | 30% |
| 🔷 Pattern | Simon-style tile sequence (5 rounds) | Blended into memory |
| 🎙️ Speech | Read sentence aloud → word match analysis | 20% |

### 🔹 Scoring Formula
```
Effective Memory = (Memory × 0.7) + (Pattern × 0.3)
Final Score = (Effective Memory × 0.5) + (Reaction × 0.3) + (Speech × 0.2)

≥ 70  →  🟢 Low Risk
40–69 →  🟡 Medium Risk
< 40  →  🔴 High Risk
```

### 🔹 AI Insight
After scoring, OpenAI GPT-3.5-turbo generates a 2–3 sentence personalized insight based on the user's domain scores. Stored in MongoDB with the test result.

---

## 🏗️ 4. Architecture

```
User Browser
    │
    ▼
Next.js Frontend (Vercel)
    │  REST API (JSON) + JWT Bearer token
    ▼
FastAPI Backend (Render)
    ├── /auth/register  /auth/login  /auth/me  /auth/profile
    ├── /score          → scoring + OpenAI insight + save to MongoDB
    ├── /history        → fetch user's test history
    ├── /alert          → send caregiver email via Gmail SMTP
    ├── /contact        → save to DB + email team
    └── /doctors        → curated specialist list
    │
    ▼
MongoDB Atlas (cloud DB)
    ├── users           → profile + testHistory[]
    └── contacts        → contact form submissions
```

---

## 📁 5. Folder Structure

```
cogniscan-ai/
├── frontend/                        # Next.js 14 App Router
│   ├── app/
│   │   ├── page.tsx                 # Landing (animated hero)
│   │   ├── layout.tsx               # Navbar + Footer + AuthProvider
│   │   ├── globals.css              # Tailwind + Framer Motion keyframes
│   │   ├── not-found.tsx            # Custom 404
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   ├── test/page.tsx            # 4-step test flow
│   │   ├── result/page.tsx          # Score ring + AI insight
│   │   ├── dashboard/page.tsx       # History + trend chart
│   │   ├── profile/page.tsx         # Edit profile + history
│   │   ├── caregiver/page.tsx       # Alert form + resources
│   │   ├── doctors/page.tsx         # Specialist directory
│   │   ├── contact/page.tsx         # Contact form
│   │   ├── about/page.tsx
│   │   └── how-it-works/page.tsx
│   ├── components/
│   │   ├── Navbar.tsx               # Scroll-aware + auth dropdown
│   │   ├── Footer.tsx
│   │   ├── AuthGuard.tsx            # Protects all private routes
│   │   ├── MemoryTest.tsx
│   │   ├── ReactionTest.tsx
│   │   ├── PatternTest.tsx          # Simon game
│   │   └── SpeechTest.tsx           # Browser Speech API
│   ├── context/
│   │   └── AuthContext.tsx          # Global auth state (React Context)
│   ├── utils/
│   │   ├── api.ts                   # apiFetch() with auth header
│   │   ├── scoring.ts               # Offline fallback scoring
│   │   ├── motion.ts                # Framer Motion variants
│   │   └── helpers.ts               # Word bank, sleep, clamp
│   ├── public/
│   │   ├── favicon.ico
│   │   └── icon.svg
│   ├── .env.example
│   └── vercel.json
│
├── backend/                         # FastAPI (Python)
│   ├── main.py                      # App + CORS middleware
│   ├── routes.py                    # All API endpoints
│   ├── database.py                  # Motor async MongoDB client
│   ├── config.py                    # Reads from .env via python-dotenv
│   ├── services/
│   │   ├── scoring.py               # Scoring formula + risk logic
│   │   ├── auth.py                  # bcrypt + JWT
│   │   ├── mailer.py                # Gmail SMTP email sender
│   │   └── ai_analysis.py           # OpenAI GPT-3.5 insight
│   ├── requirements.txt
│   ├── render.yaml                  # Render deployment config
│   └── .env.example
│
├── .gitignore                       # Excludes .env, node_modules, __pycache__
└── README.md
```

---

## 🛠️ 6. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), TypeScript |
| Styling | Tailwind CSS |
| Animations | Framer Motion |
| Backend | FastAPI (Python 3.9) |
| Database | MongoDB Atlas (Motor async driver) |
| Auth | JWT (python-jose) + bcrypt (passlib) |
| AI | OpenAI GPT-3.5-turbo |
| Speech | Browser Web Speech API |
| Email | Gmail SMTP (smtplib) |
| Frontend Deploy | Vercel (Mumbai region) |
| Backend Deploy | Render (Singapore region) |

---

## 👥 7. Team Role Division

| Member | Role | Responsibilities |
|---|---|---|
| **Pranav Ghodke** | Lead Dev & AI Engineer | Backend API, MongoDB, OpenAI integration, deployment |
| **Jui Katkade** | Frontend & UX | UI components, animations, Framer Motion, responsive design |
| **Aditya Chavan** | Backend & ML | Scoring engine, auth system, FastAPI routes |
| **Gauri Borse** | Research & Medical | Test design, risk recommendations, caregiver portal content |

---

## 🔐 8. Auth Flow

```
Register → bcrypt hash password → save to MongoDB → return JWT
Login    → verify password → return JWT
All protected pages → AuthGuard checks JWT in localStorage
API calls → Bearer token in Authorization header
Backend  → decode JWT → get user ID → fetch/save data
```

---

## 🌐 9. Deployment

| Service | Platform | URL |
|---|---|---|
| Frontend | Vercel | `https://nakshatra.vercel.app` |
| Backend | Render | `https://cogniscan-ai-backend.onrender.com` |
| Database | MongoDB Atlas | `cluster0.82ckokl.mongodb.net` |
| Repo | GitHub | `github.com/PS8760/Nakshatra` |

### Environment Variables

**Backend (Render):**
```
MONGO_URI, DB_NAME, JWT_SECRET, OPENAI_API_KEY,
SMTP_USER, SMTP_PASS, SMTP_FROM, TEAM_EMAIL, ALLOWED_ORIGINS
```

**Frontend (Vercel):**
```
NEXT_PUBLIC_API_URL = https://cogniscan-ai-backend.onrender.com
```

---

## 🧪 10. Running Locally

```bash
# Backend
cd backend
pip install -r requirements.txt
cp .env.example .env   # fill in values
uvicorn main:app --reload --port 8000

# Frontend
cd frontend
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
# → http://localhost:3000
```

---

## 🎤 11. Demo Story (For Judges)

> *"A 65-year-old user takes this 3-minute test every week. Over time, CogniscanAI detects a gradual decline in their memory and reaction scores. The system automatically alerts their caregiver and recommends a neurologist — before serious symptoms appear. Early detection means better outcomes."*

---

## 💡 12. Smart Answers for Judges

**Q: Where is your AI model?**
> "We use a clinically-inspired weighted scoring formula for real-time inference, combined with OpenAI GPT-3.5 for personalized insights. In production, we would fine-tune on clinical datasets like ADNI for higher accuracy."

**Q: How is this different from existing tools?**
> "Existing cognitive tests require a clinic visit and a trained professional. CogniscanAI works on any device with a browser, takes 3 minutes, and provides instant results with caregiver alerts — making it accessible in low-resource environments."

**Q: Is the data secure?**
> "Yes. Passwords are bcrypt-hashed, sessions use JWT tokens, all API calls are HTTPS, and credentials are stored in environment variables — never in code."

**Q: How does it scale?**
> "MongoDB Atlas scales horizontally. FastAPI is async and handles concurrent users efficiently. The frontend is statically optimized on Vercel's CDN."

---

## 🏆 13. Success Checklist

✅ Smooth animated UI (Framer Motion)
✅ 4 working cognitive tests
✅ AI-powered risk scoring + GPT insight
✅ User auth (register/login/profile)
✅ Test history with trend chart
✅ Caregiver alert system with real email
✅ Doctor finder directory
✅ Contact form → team email
✅ Deployed on Vercel + Render
✅ GitHub repo with clean commit history
✅ No secrets in codebase (.env protected)

---

## 🔥 Team Mindset

> *"Less complexity, more clarity. Less features, more impact."*

**What we built is not just a prototype — it's a production-ready system.**
