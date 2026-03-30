import os
from dotenv import load_dotenv

# Load .env file (ignored in production where env vars are set directly)
load_dotenv()

def _require(key: str) -> str:
    val = os.getenv(key)
    if not val:
        raise RuntimeError(f"Missing required environment variable: {key}")
    return val

# MongoDB
MONGO_URI = _require("MONGO_URI")
DB_NAME   = os.getenv("DB_NAME", "cogniscan")

# JWT
JWT_SECRET       = _require("JWT_SECRET")
JWT_ALGORITHM    = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_HOURS = int(os.getenv("JWT_EXPIRE_HOURS", "72"))

# OpenAI (legacy — replaced by Groq)
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

# Groq
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")

# SMTP / Nodemailer
SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)
TEAM_EMAIL = os.getenv("TEAM_EMAIL", SMTP_USER)
