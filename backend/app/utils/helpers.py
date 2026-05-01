from bson import ObjectId
from datetime import datetime
from app.database import logs_col


def serialize(doc) -> dict:
    """Convert MongoDB doc to JSON-serializable dict."""
    if doc is None:
        return None
    doc["id"] = str(doc.pop("_id"))
    return doc


def serialize_list(docs) -> list:
    return [serialize(doc) for doc in docs]


def log_activity(action: str, user_id: str, user_name: str, entity_id: str = None):
    """Simple activity logger."""
    logs_col.insert_one({
        "action": action,
        "user_id": user_id,
        "user_name": user_name,
        "entity_id": entity_id,
        "timestamp": datetime.utcnow()
    })


def get_logs(limit: int = 20) -> list:
    logs = logs_col.find().sort("timestamp", -1).limit(limit)
    result = []
    for log in logs:
        log["id"] = str(log.pop("_id"))
        log["timestamp"] = log["timestamp"].isoformat()
        result.append(log)
    return result
