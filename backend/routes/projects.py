from fastapi import APIRouter, Depends, HTTPException
from schemas.schemas import ProjectCreate, ProjectUpdate
from utils.auth import get_current_user, require_admin
from utils.helpers import serialize, serialize_list, log_activity
from database import projects_col, users_col, tasks_col
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def enrich_project(project: dict) -> dict:
    """Add member details and task count to a project."""
    member_ids = project.get("member_ids", [])
    members = []
    for mid in member_ids:
        try:
            u = users_col.find_one({"_id": ObjectId(mid)}, {"password": 0})
            if u:
                members.append({"id": str(u["_id"]), "name": u["name"], "email": u["email"]})
        except:
            pass
    project["members"] = members
    project["task_count"] = tasks_col.count_documents({"project_id": project["id"]})
    return project


@router.get("")
def list_projects(current_user: dict = Depends(get_current_user)):
    user_id = current_user["sub"]
    role = current_user.get("role")

    if role == "admin":
        projects = serialize_list(projects_col.find())
    else:
        projects = serialize_list(projects_col.find({"member_ids": user_id}))

    return [enrich_project(p) for p in projects]


@router.post("")
def create_project(body: ProjectCreate, current_user: dict = Depends(require_admin)):
    project = {
        "name": body.name,
        "description": body.description,
        "member_ids": body.member_ids,
        "created_by": current_user["sub"],
        "created_at": datetime.utcnow()
    }
    result = projects_col.insert_one(project)
    project["_id"] = result.inserted_id
    created = serialize(project)

    log_activity(f"Project '{body.name}' created", current_user["sub"], current_user["name"], created["id"])
    return enrich_project(created)


@router.get("/{project_id}")
def get_project(project_id: str, current_user: dict = Depends(get_current_user)):
    try:
        project = projects_col.find_one({"_id": ObjectId(project_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Members can only see their own projects
    if current_user.get("role") != "admin" and current_user["sub"] not in project.get("member_ids", []):
        raise HTTPException(status_code=403, detail="Access denied")

    return enrich_project(serialize(project))


@router.put("/{project_id}")
def update_project(project_id: str, body: ProjectUpdate, current_user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    updates = {k: v for k, v in body.dict().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Nothing to update")

    projects_col.update_one({"_id": oid}, {"$set": updates})
    updated = projects_col.find_one({"_id": oid})
    return enrich_project(serialize(updated))


@router.delete("/{project_id}")
def delete_project(project_id: str, current_user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(project_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    project = projects_col.find_one({"_id": oid})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    projects_col.delete_one({"_id": oid})
    tasks_col.delete_many({"project_id": project_id})

    log_activity(f"Project '{project['name']}' deleted", current_user["sub"], current_user["name"])
    return {"message": "Project deleted"}
