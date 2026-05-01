import os
import logging
from pymongo import MongoClient, errors

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "team_task_manager")

client = None
db = None
users_col = None
projects_col = None
tasks_col = None
logs_col = None

try:
    client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
    # The ismaster command is cheap and does not require auth
    client.admin.command('ismaster')
    logger.info("Successfully connected to MongoDB")
    
    db = client[DB_NAME]
    users_col = db["users"]
    projects_col = db["projects"]
    tasks_col = db["tasks"]
    logs_col = db["activity_logs"]
    
    # Create indexes
    users_col.create_index("email", unique=True)
except errors.ServerSelectionTimeoutError as e:
    logger.error(f"MongoDB connection timeout: {e}")
except Exception as e:
    logger.error(f"Failed to connect to MongoDB: {e}")
