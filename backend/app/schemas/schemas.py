from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date


class SignupRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "member"  # admin or member


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = ""
    member_ids: Optional[List[str]] = []


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    member_ids: Optional[List[str]] = None


class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    project_id: str
    assigned_to: Optional[str] = None  # user id
    due_date: Optional[str] = None  # ISO date string
    status: Optional[str] = "todo"  # todo, in_progress, done
    subtasks: Optional[List[str]] = []


class SubtaskUpdate(BaseModel):
    id: str
    title: str
    completed: bool

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assigned_to: Optional[str] = None
    due_date: Optional[str] = None
    status: Optional[str] = None
    subtasks: Optional[List[SubtaskUpdate]] = None
