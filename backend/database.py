from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME
import logging

logger = logging.getLogger(__name__)

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    try:
        client = AsyncIOMotorClient(
            MONGO_URI,
            serverSelectionTimeoutMS=5000,
            connectTimeoutMS=5000,
            socketTimeoutMS=10000,
            maxPoolSize=5,       # limit pool size on free tier (default is 100)
            minPoolSize=1,
        )
        await client.admin.command("ping")
        db = client[DB_NAME]
        logger.info(f"✅ Connected to MongoDB: {DB_NAME}")
        print(f"✅ Connected to MongoDB: {DB_NAME}")
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        print(f"❌ MongoDB connection failed: {e}")
        # Don't crash — server still starts, DB calls will fail gracefully

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    if db is None:
        raise RuntimeError("Database not connected. Check MONGO_URI and Atlas IP whitelist.")
    return db
