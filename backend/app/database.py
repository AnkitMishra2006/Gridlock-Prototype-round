from motor.motor_asyncio import AsyncIOMotorClient
from typing import Optional
from .config import settings

class Database:
    client: Optional[AsyncIOMotorClient] = None
    
    @classmethod
    async def connect_db(cls):
        """Connect to MongoDB"""
        cls.client = AsyncIOMotorClient(settings.mongodb_url)
        print(f"✅ Connected to MongoDB at {settings.mongodb_url}")
    
    @classmethod
    async def close_db(cls):
        """Close MongoDB connection"""
        if cls.client:
            cls.client.close()
            print("❌ MongoDB connection closed")
    
    @classmethod
    def get_db(cls):
        """Get database instance"""
        if not cls.client:
            raise Exception("Database not connected. Call connect_db() first.")
        return cls.client[settings.database_name]


async def get_database():
    """Dependency to get database instance"""
    return Database.get_db()
