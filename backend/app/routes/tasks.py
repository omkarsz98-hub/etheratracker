from fastapi import APIRouter, Depends, HTTPException
from app.schemas.schemas import TaskCreate, TaskUpdate
from app.utils.auth import get_current_user, require_admin
from app.utils.helpers import serialize, serialize_list, log_activity
from app.database import tasks_col, users_col, projects_col
from bson import ObjectId
from datetime import datetime, date
import uuid

router = APIRouter()


def enrich_task(task: dict) -> dict:
    """Attach assigned user info and overdue flag."""
    assigned_id = task.get("assigned_to")
    if assigned_id:
        try:
            u = users_col.find_one({"_id": ObjectId(assigned_id)}, {"password": 0})
            if u:
                task["assigned_user"] = {"id": str(u["_id"]), "name": u["name"], "email": u["email"]}
        except:
            task["assigned_user"] = None
    else:
        task["assigned_user"] = None

    due = task.get("due_date")
    if due and task.get("status") != "done":
        try:
            due_dt = datetime.strptime(due, "%Y-%m-%d").date()
            task["overdue"] = due_dt < date.today()
        except:
            task["overdue"] = False
    else:
        task["overdue"] = False

    return task


@router.get("")
def list_tasks(project_id: str = None, current_user: dict = Depends(get_current_user)):
    query = {}
    if project_id:
        query["project_id"] = project_id

    if current_user.get("role") != "admin":
        query["assigned_to"] = current_user["sub"]

    tasks = serialize_list(tasks_col.find(query).sort("created_at", -1))
    return [enrich_task(t) for t in tasks]


@router.get("/stats")
def task_stats(current_user: dict = Depends(get_current_user)):
    """Dashboard stats."""
    base_query = {} if current_user.get("role") == "admin" else {"assigned_to": current_user["sub"]}

    total = tasks_col.count_documents(base_query)
    done = tasks_col.count_documents({**base_query, "status": "done"})

    today_str = date.today().isoformat()
    all_tasks = list(tasks_col.find({**base_query, "status": {"$ne": "done"}}))
    overdue = sum(
        1 for t in all_tasks
        if t.get("due_date") and t["due_date"] < today_str
    )

    recent = serialize_list(tasks_col.find(base_query).sort("created_at", -1).limit(5))
    recent = [enrich_task(t) for t in recent]

    return {
        "total": total,
        "completed": done,
        "overdue": overdue,
        "recent_tasks": recent
    }


@router.post("")
def create_task(body: TaskCreate, current_user: dict = Depends(require_admin)):
    # Verify project exists
    try:
        project = projects_col.find_one({"_id": ObjectId(body.project_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid project ID")

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    subtasks = [{"id": str(uuid.uuid4()), "title": st, "completed": False} for st in body.subtasks] if body.subtasks else []
    
    task = {
        "title": body.title,
        "description": body.description,
        "project_id": body.project_id,
        "assigned_to": body.assigned_to,
        "due_date": body.due_date,
        "status": body.status or "todo",
        "subtasks": subtasks,
        "created_by": current_user["sub"],
        "created_at": datetime.utcnow()
    }
    result = tasks_col.insert_one(task)
    task["_id"] = result.inserted_id
    created = serialize(task)

    log_activity(f"Task '{body.title}' created", current_user["sub"], current_user["name"], created["id"])
    return enrich_task(created)


@router.get("/{task_id}")
def get_task(task_id: str, current_user: dict = Depends(get_current_user)):
    try:
        task = tasks_col.find_one({"_id": ObjectId(task_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if current_user.get("role") != "admin" and task.get("assigned_to") != current_user["sub"]:
        raise HTTPException(status_code=403, detail="Access denied")

    return enrich_task(serialize(task))


@router.put("/{task_id}")
def update_task(task_id: str, body: TaskUpdate, current_user: dict = Depends(get_current_user)):
    try:
        oid = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = tasks_col.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Members can only update subtasks on their own tasks (only admins can change status)
    if current_user.get("role") != "admin":
        if task.get("assigned_to") != current_user["sub"]:
            raise HTTPException(status_code=403, detail="Access denied")
        allowed_updates = {}
        # Status updates are ignored for non-admins per user request
        if body.subtasks is not None:
            allowed_updates["subtasks"] = [s.dict() for s in body.subtasks]
    else:
        allowed_updates = {k: v for k, v in body.dict().items() if v is not None}

    if "subtasks" in allowed_updates:
        pass # No automatic progression per user request

    if not allowed_updates:
        raise HTTPException(status_code=400, detail="Nothing to update")

    tasks_col.update_one({"_id": oid}, {"$set": allowed_updates})

    if "status" in allowed_updates:
        log_activity(
            f"Task '{task['title']}' marked as {allowed_updates['status']}",
            current_user["sub"],
            current_user["name"],
            task_id
        )

    updated = tasks_col.find_one({"_id": oid})
    return enrich_task(serialize(updated))


@router.delete("/{task_id}")
def delete_task(task_id: str, current_user: dict = Depends(require_admin)):
    try:
        oid = ObjectId(task_id)
    except:
        raise HTTPException(status_code=400, detail="Invalid task ID")

    task = tasks_col.find_one({"_id": oid})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    tasks_col.delete_one({"_id": oid})
    log_activity(f"Task '{task['title']}' deleted", current_user["sub"], current_user["name"])
    return {"message": "Task deleted"}
