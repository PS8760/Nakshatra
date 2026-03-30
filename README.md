# 🧠 CogniscanAI

> **Early Detection. Better Prevention.**

An AI-powered early cognitive decline detection system using multimodal inputs — memory, reaction time, speech analysis, and pattern recognition.

Built for hackathon by **Pranav Ghodke, Jui Katkade, Aditya Chavan, Gauri Borse**.

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion |
| Backend | FastAPI (Python), Motor (async MongoDB) |
| Database | MongoDB Atlas |
| Auth | JWT (python-jose) + bcrypt |
| AI | OpenAI GPT-3.5-turbo |
| Email | Gmail SMTP (Nodemailer-style via smtplib) |

---

## Getting Started

### 1. Clone the repo

```bash
git clone https://github.com/PS8760/Nakshatra.git
cd cogniscan-ai
```

### 2. Backend setup

```bash
cd backend
pip install -r requirements.txt

# Copy env template and fill in your values
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/
DB_NAME=cogniscan
JWT_SECRET=your_random_secret
OPENAI_API_KEY=sk-...
SMTP_USER=your@gmail.com
SMTP_PASS=your_gmail_app_password   # Generate at myaccount.google.com/apppasswords
TEAM_EMAIL=your@gmail.com
```

Start the backend:
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install

# Copy env template
cp .env.example .env.local
```

Edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Start the frontend:
```bash
npm run dev
# → http://localhost:3000
```

---

## Features

- 🧩 **Memory Test** — word recall scoring
- ⚡ **Reaction Test** — psychomotor speed measurement
- 🔷 **Pattern Test** — Simon-style sequence memory
- 🎙️ **Speech Test** — Browser Speech API transcription analysis
- 📊 **AI Risk Score** — weighted formula + GPT-3.5 personalized insight
- 👤 **User Auth** — register/login with JWT, MongoDB persistence
- 📈 **Dashboard** — score history, trend chart, domain averages
- 🔔 **Caregiver Portal** — alert system, tips, resources
- 🩺 **Doctor Finder** — specialist directory with city filter
- ✉️ **Contact Form** — sends email to team via Gmail SMTP

---

## Scoring Formula

```
Score = (Memory × 0.5) + (Reaction × 0.3) + (Speech × 0.2)

≥ 70  →  Low Risk   🟢
40–69 →  Medium Risk 🟡
< 40  →  High Risk  🔴
```

---

## Deployment

- **Frontend** → [Vercel](https://vercel.com) — connect repo, set `NEXT_PUBLIC_API_URL`
- **Backend** → [Render](https://render.com) — set start command: `uvicorn main:app --host 0.0.0.0 --port 8000`, add all env vars in dashboard

---

## License

MIT
