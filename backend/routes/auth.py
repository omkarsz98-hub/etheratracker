from fastapi import APIRouter, HTTPException
from schemas.schemas import SignupRequest, LoginRequest
from utils.auth import hash_password, verify_password, create_token
from utils.helpers import serialize, log_activity
from database import users_col
from bson import ObjectId
from datetime import datetime

router = APIRouter()


@router.post("/signup")
def signup(body: SignupRequest):
    existing = users_col.find_one({"email": body.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = {
        "name": body.name,
        "email": body.email,
        "password": hash_password(body.password),
        "role": body.role if body.role in ["admin", "member"] else "member",
        "created_at": datetime.utcnow()
    }
    result = users_col.insert_one(user)
    user_id = str(result.inserted_id)

    token = create_token({
        "sub": user_id,
        "email": body.email,
        "name": body.name,
        "role": user["role"]
    })

    log_activity(f"User '{body.name}' signed up", user_id, body.name)

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": body.name,
            "email": body.email,
            "role": user["role"]
        }
    }


@router.post("/login")
def login(body: LoginRequest):
    user = users_col.find_one({"email": body.email})
    if not user or not verify_password(body.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_id = str(user["_id"])
    token = create_token({
        "sub": user_id,
        "email": user["email"],
        "name": user["name"],
        "role": user["role"]
    })

    log_activity(f"User '{user['name']}' logged in", user_id, user["name"])

    return {
        "token": token,
        "user": {
            "id": user_id,
            "name": user["name"],
            "email": user["email"],
            "role": user["role"]
        }
    }
