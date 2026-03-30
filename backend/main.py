from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from database import connect_db, close_db, get_db
from routes import router
import os
import asyncio
import httpx
import logging

logger = logging.getLogger(__name__)

SELF_URL = os.getenv("RENDER_EXTERNAL_URL", "").rstrip("/") or "https://cogniscan-ai-backend.onrender.com"
PING_INTERVAL = 9 * 60  # ping every 9 minutes — Render spins down after 15 min of inactivity


async def keep_alive():
    """Self-ping to prevent Render free tier from spinning down."""
    await asyncio.sleep(60)  # wait for full startup before first ping
    while True:
        try:
            async with httpx.AsyncClient(timeout=10) as client:
                await client.get(f"{SELF_URL}/health")
            logger.info("🏓 Keep-alive ping sent")
        except Exception as e:
            logger.warning(f"Keep-alive ping failed: {e}")
        await asyncio.sleep(PING_INTERVAL)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    asyncio.create_task(keep_alive())
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
