from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db, get_db
from routes import router
import os
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    asyncio.create_task(connect_db())
    # Start weekly reminder scheduler after DB connects
    await asyncio.sleep(3)
    try:
        from services.scheduler import run_scheduler
        db = get_db()
        if db is not None:
            asyncio.create_task(run_scheduler(db))
    except Exception as e:
        print(f"Scheduler not started: {e}")
    yield
    await close_db()

app = FastAPI(title="CogniscanAI API", version="3.1.0", lifespan=lifespan)

_origins_env = os.getenv("ALLOWED_ORIGINS", "")
ALLOWED_ORIGINS = [o.strip() for o in _origins_env.split(",") if o.strip()] or [
    "http://localhost:3000",
    "https://nakshatra.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)
