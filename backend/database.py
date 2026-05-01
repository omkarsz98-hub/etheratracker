from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "team_task_manager")

client = MongoClient(MONGO_URI)
db = client[DB_NAME]

users_col = db["users"]
projects_col = db["projects"]
tasks_col = db["tasks"]
logs_col = db["activity_logs"]

# Create indexes
users_col.create_index("email", unique=True)
