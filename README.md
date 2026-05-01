# Team Task Manager (TaskFlow)

A modern, full-stack team task management application built with a React (Vite) frontend and a FastAPI (Python) backend. 

## 🚀 Features

* **Role-Based Access Control (RBAC):** Users can be assigned an `Admin` or `Member` role.
* **Project Management:** Admins can create new projects and assign team members.
* **Advanced Task Management:** 
  * Admins can create tasks with detailed subtasks/requirements.
  * Members can track their progress step-by-step by checking off subtasks.
  * **Strict Workflow:** Only Admins can transition the overall status of a task (e.g., from *Todo* to *In Progress* to *Done*).
* **Real-time Dashboard:** View task statistics, overdue items, and a live activity log.
* **Kanban Task Board:** Visualize task statuses dynamically.

## 🛠️ Technology Stack

### Frontend
* **Framework:** React + Vite
* **Styling:** TailwindCSS
* **Icons:** Lucide React
* **Routing:** React Router DOM

### Backend
* **Framework:** FastAPI (Python)
* **Database:** MongoDB (via PyMongo)
* **Authentication:** JWT (JSON Web Tokens) with `bcrypt` password hashing.

## ⚙️ Getting Started

### Prerequisites
* Python 3.9+
* Node.js & npm
* MongoDB instance (Local or Atlas)

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```
3. Create a `.env` file in the `backend` directory with your configuration:
   ```env
   MONGO_URI=your_mongodb_connection_string
   DB_NAME=etheratracker
   SECRET_KEY=your_secure_secret_key
   ```
4. Start the FastAPI server (Ensure it runs on port 8001):
   ```bash
   uvicorn main:app --reload --port 8001
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install the Node dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:3000`.

## 🤝 Workflow Example
1. Sign up as a new user and select the **Admin** role.
2. Navigate to **Projects** and create your first project, adding team members.
3. Open the project and create a new **Task**, outlining a list of subtasks.
4. Assigned members log in, view the task, and mark off the subtasks as they complete them.
5. The Admin reviews the subtasks and clicks **"Move to ->"** to mark the task as *Done*.