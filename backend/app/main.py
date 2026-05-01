from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, projects, tasks, users
import os

app = FastAPI(title="Team Task Manager", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["auth"])
app.include_router(projects.router, prefix="/api/projects", tags=["projects"])
app.include_router(tasks.router, prefix="/api/tasks", tags=["tasks"])
app.include_router(users.router, prefix="/api/users", tags=["users"])

@app.get("/")
def root():
    return {"message": "Team Task Manager API is running"}
