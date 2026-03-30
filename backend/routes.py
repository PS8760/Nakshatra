from fastapi import APIRouter, HTTPException, Depends, Header
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime
from bson import ObjectId

from services.scoring import TestScores, ScoreResult, compute_score
from services.auth import hash_password, verify_password, create_token, decode_token
from services.mailer import send_welcome_email, send_caregiver_alert, send_contact_email
from services.ai_analysis import get_ai_insight
from database import get_db

router = APIRouter()


def oid(doc: dict) -> dict:
    if doc and "_id" in doc:
        doc["_id"] = str(doc["_id"])
    return doc


async def get_current_user(authorization: str = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = authorization.split(" ")[1]
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    return payload


# ── Auth ──────────────────────────────────────────────────────────────────────

class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


@router.post("/auth/register")
async def register(req: RegisterRequest):
    db = get_db()
    existing = await db.users.find_one({"email": req.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "name": req.name,
        "email": req.email,
        "password": hash_password(req.password),
        "age": req.age,
        "gender": req.gender,
        "phone": req.phone,
        "createdAt": datetime.utcnow(),
        "testHistory": [],
    }
    result = await db.users.insert_one(user)
    user_id = str(result.inserted_id)
    token = create_token(user_id, req.email)
    try:
        send_welcome_email(req.email, req.name)
    except Exception:
        pass
    return {"token": token, "user": {"id": user_id, "name": req.name, "email": req.email}}


@router.post("/auth/login")
async def login(req: LoginRequest):
    db = get_db()
    user = await db.users.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user_id = str(user["_id"])
    token = create_token(user_id, req.email)
    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "age": user.get("age"),
            "gender": user.get("gender"),
            "phone": user.get("phone"),
        },
    }


@router.get("/auth/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {
        "id": str(user["_id"]),
        "name": user["name"],
        "email": user["email"],
        "age": user.get("age"),
        "gender": user.get("gender"),
        "phone": user.get("phone"),
        "createdAt": str(user.get("createdAt", "")),
    }


class UpdateProfileRequest(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    phone: Optional[str] = None


@router.put("/auth/profile")
async def update_profile(req: UpdateProfileRequest, current_user: dict = Depends(get_current_user)):
    db = get_db()
    update = {k: v for k, v in req.dict().items() if v is not None}
    await db.users.update_one({"_id": ObjectId(current_user["sub"])}, {"$set": update})
    return {"success": True}


# ── Score ─────────────────────────────────────────────────────────────────────

class ScoreWithAI(ScoreResult):
    aiInsight: Optional[str] = None


@router.post("/score", response_model=ScoreWithAI)
async def score(scores: TestScores, authorization: str = Header(None)):
    try:
        result = compute_score(scores)
    except Exception as e:
        raise HTTPException(status_code=422, detail=str(e))

    raw = {}
    if result.rawScores:
        raw = {
            "memory": result.rawScores.memory,
            "reaction": result.rawScores.reaction,
            "pattern": result.rawScores.pattern,
            "speech": result.rawScores.speech,
        }
    ai_insight = get_ai_insight(result.finalScore, result.riskLevel, raw)

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        payload = decode_token(token)
        if payload:
            db = get_db()
            entry = {
                "date": datetime.utcnow().isoformat(),
                "finalScore": result.finalScore,
                "riskLevel": result.riskLevel,
                "rawScores": raw,
                "aiInsight": ai_insight,
            }
            await db.users.update_one(
                {"_id": ObjectId(payload["sub"])},
                {"$push": {"testHistory": {"$each": [entry], "$position": 0, "$slice": 20}}},
            )

    return ScoreWithAI(**result.dict(), aiInsight=ai_insight)


# ── History ───────────────────────────────────────────────────────────────────

@router.get("/history")
async def get_history(current_user: dict = Depends(get_current_user)):
    db = get_db()
    user = await db.users.find_one({"_id": ObjectId(current_user["sub"])})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"history": user.get("testHistory", [])}


# ── Alert ─────────────────────────────────────────────────────────────────────

class AlertRequest(BaseModel):
    email: str
    score: int
    riskLevel: str
    patientName: Optional[str] = "Patient"
    message: Optional[str] = None


@router.post("/alert")
async def send_alert(req: AlertRequest):
    success = send_caregiver_alert(req.email, req.patientName, req.score, req.riskLevel, req.message or "")
    return {"success": success}


# ── Contact ───────────────────────────────────────────────────────────────────

class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    subject: str
    message: str
    category: Optional[str] = "General"


@router.post("/contact")
async def contact(req: ContactRequest):
    db = get_db()
    await db.contacts.insert_one({
        "name": req.name,
        "email": req.email,
        "subject": req.subject,
        "message": req.message,
        "category": req.category,
        "createdAt": datetime.utcnow(),
        "status": "open",
    })
    success = send_contact_email(req.name, req.email, f"[{req.category}] {req.subject}", req.message)
    return {
        "success": True,
        "emailSent": success,
        "message": "Message saved. Email notification sent." if success else "Message saved. Email notification could not be sent — check SMTP config.",
    }


# ── Doctors ───────────────────────────────────────────────────────────────────

@router.get("/doctors")
async def get_doctors(city: Optional[str] = None):
    doctors = [
        {"id": 1, "name": "Dr. Rajesh Sharma", "specialty": "Neurologist", "hospital": "Apollo Hospital", "city": "Mumbai", "rating": 4.9, "experience": 18, "phone": "+91-22-6767-0000", "available": True},
        {"id": 2, "name": "Dr. Priya Mehta", "specialty": "Cognitive Neurologist", "hospital": "Kokilaben Hospital", "city": "Mumbai", "rating": 4.8, "experience": 14, "phone": "+91-22-4269-6969", "available": True},
        {"id": 3, "name": "Dr. Anil Verma", "specialty": "Geriatric Psychiatrist", "hospital": "Lilavati Hospital", "city": "Mumbai", "rating": 4.7, "experience": 22, "phone": "+91-22-2675-1000", "available": False},
        {"id": 4, "name": "Dr. Sunita Rao", "specialty": "Neuropsychologist", "hospital": "Fortis Hospital", "city": "Pune", "rating": 4.8, "experience": 16, "phone": "+91-20-6712-8888", "available": True},
        {"id": 5, "name": "Dr. Vikram Nair", "specialty": "Neurologist", "hospital": "Ruby Hall Clinic", "city": "Pune", "rating": 4.6, "experience": 12, "phone": "+91-20-6645-5555", "available": True},
        {"id": 6, "name": "Dr. Kavita Joshi", "specialty": "Dementia Specialist", "hospital": "Sahyadri Hospital", "city": "Pune", "rating": 4.9, "experience": 20, "phone": "+91-20-6721-3000", "available": True},
        {"id": 7, "name": "Dr. Arjun Patel", "specialty": "Neurologist", "hospital": "Narayana Health", "city": "Bangalore", "rating": 4.7, "experience": 15, "phone": "+91-80-7122-2222", "available": True},
        {"id": 8, "name": "Dr. Meera Krishnan", "specialty": "Cognitive Specialist", "hospital": "Manipal Hospital", "city": "Bangalore", "rating": 4.8, "experience": 19, "phone": "+91-80-2502-4444", "available": False},
        {"id": 9, "name": "Dr. Sanjay Gupta", "specialty": "Neurologist", "hospital": "AIIMS", "city": "Delhi", "rating": 4.9, "experience": 25, "phone": "+91-11-2658-8500", "available": True},
        {"id": 10, "name": "Dr. Ananya Singh", "specialty": "Geriatric Neurologist", "hospital": "Max Hospital", "city": "Delhi", "rating": 4.7, "experience": 13, "phone": "+91-11-2651-5050", "available": True},
        {"id": 11, "name": "Dr. Ravi Chandran", "specialty": "Neuropsychiatrist", "hospital": "NIMHANS", "city": "Bangalore", "rating": 4.9, "experience": 28, "phone": "+91-80-2699-5000", "available": True},
        {"id": 12, "name": "Dr. Pooja Desai", "specialty": "Memory Clinic Specialist", "hospital": "Breach Candy Hospital", "city": "Mumbai", "rating": 4.6, "experience": 11, "phone": "+91-22-2367-4444", "available": True},
    ]
    if city:
        doctors = [d for d in doctors if d["city"].lower() == city.lower()]
    return {"doctors": doctors}


# ── Health ────────────────────────────────────────────────────────────────────

@router.get("/health")
def health():
    return {"status": "ok", "version": "3.0.0"}
