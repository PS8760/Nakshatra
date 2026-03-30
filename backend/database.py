from motor.motor_asyncio import AsyncIOMotorClient
from config import MONGO_URI, DB_NAME

client: AsyncIOMotorClient = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(
        MONGO_URI,
        serverSelectionTimeoutMS=5000,   # fail fast if Atlas unreachable
        connectTimeoutMS=5000,
        socketTimeoutMS=10000,
    )
    # Verify connection is actually alive
    await client.admin.command("ping")
    db = client[DB_NAME]
    print(f"✅ Connected to MongoDB: {DB_NAME}")

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    return db
