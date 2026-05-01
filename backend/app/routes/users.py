from fastapi import APIRouter, Depends
from app.utils.auth import get_current_user
from app.utils.helpers import serialize_list, get_logs
from app.database import users_col

router = APIRouter()


@router.get("")
def list_users(current_user: dict = Depends(get_current_user)):
    users = users_col.find({}, {"password": 0})
    result = serialize_list(users)
    return result


@router.get("/logs")
def activity_logs(current_user: dict = Depends(get_current_user)):
    return get_logs(30)


@router.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return current_user
