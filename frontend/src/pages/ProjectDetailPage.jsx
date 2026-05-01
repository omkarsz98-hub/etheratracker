import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { ArrowLeft, Plus, Users, Calendar, Trash2, User } from 'lucide-react'
import Modal from '../components/Modal'
import StatusBadge from '../components/StatusBadge'
import SubtasksList from '../components/SubtasksList'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const { isAdmin } = useAuth()
  const [project, setProject] = useState(null)
  const [tasks, setTasks] = useState([])
  const [allUsers, setAllUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [taskForm, setTaskForm] = useState({ title: '', description: '', assigned_to: '', due_date: '', status: 'todo' })
  const [saving, setSaving] = useState(false)

  const fetchData = async () => {
    const [projectRes, tasksRes] = await Promise.all([
      api.get(`/projects/${id}`),
      api.get(`/tasks?project_id=${id}`)
    ])
    setProject(projectRes.data)
    setTasks(tasksRes.data)
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchData()
        if (isAdmin) {
          const usersRes = await api.get('/users')
          setAllUsers(usersRes.data)
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, isAdmin])

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      const subtasks = taskForm.subtasks_text?.split('\n').map(s => s.trim()).filter(Boolean) || []
      await api.post('/tasks', { ...taskForm, project_id: id, subtasks })
      setShowTaskModal(false)
      setTaskForm({ title: '', description: '', assigned_to: '', due_date: '', status: 'todo', subtasks_text: '' })
      await fetchData()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create task')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/tasks/${taskId}`)
    setTasks(prev => prev.filter(t => t.id !== taskId))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-400 text-sm">Loading project...</div>
  if (!project) return <div className="text-center text-ink-400 mt-16">Project not found.</div>

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <Link to="/projects" className="btn-ghost mb-4 -ml-2">
        <ArrowLeft size={16} /> Back to Projects
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: project info */}
        <div className="lg:col-span-1 space-y-4">
          <div className="card p-5">
            <h1 className="font-display text-xl font-bold text-ink-900 mb-1">{project.name}</h1>
            {project.description && (
              <p className="text-sm text-ink-400 mb-4">{project.description}</p>
            )}
            <div className="text-xs text-ink-400 flex items-center gap-1 mb-4">
              <span className="text-ink-300">📁</span> {tasks.length} task{tasks.length !== 1 ? 's' : ''}
            </div>
          </div>

          <div className="card p-5">
            <h2 className="font-semibold text-ink-800 flex items-center gap-2 mb-3">
              <Users size={15} /> Members ({project.members?.length || 0})
            </h2>
            {project.members?.length === 0 ? (
              <p className="text-sm text-ink-400">No members added yet.</p>
            ) : (
              <div className="space-y-2.5">
                {project.members?.map(m => (
                  <div key={m.id} className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-accent-100 flex items-center justify-center text-sm font-medium text-accent-700 flex-shrink-0">
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-ink-800">{m.name}</div>
                      <div className="text-xs text-ink-400">{m.email}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: task list */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-800">Tasks</h2>
            {isAdmin && (
              <button onClick={() => setShowTaskModal(true)} className="btn-primary">
                <Plus size={15} /> Add Task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <div className="card p-12 text-center text-ink-400 text-sm">
              No tasks in this project yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {tasks.map(task => (
                <div
                  key={task.id}
                  className={`card p-4 group flex items-start gap-4 ${task.overdue ? 'border-rose-200 bg-rose-50' : ''}`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2 flex-wrap">
                      <h3 className="font-medium text-ink-900 text-sm">{task.title}</h3>
                      <StatusBadge status={task.status} />
                      {task.overdue && (
                        <span className="badge bg-rose-100 text-rose-600">Overdue</span>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-ink-400 mt-1 line-clamp-1">{task.description}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2 text-xs text-ink-400">
                      {task.assigned_user && (
                        <span className="flex items-center gap-1">
                          <User size={11} /> {task.assigned_user.name}
                        </span>
                      )}
                      {task.due_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={11} /> {task.due_date}
                        </span>
                      )}
                    </div>
                    
                    <SubtasksList 
                      task={task} 
                      onTaskUpdated={(updatedTask) => {
                        setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t))
                      }} 
                    />
                  </div>
                  {isAdmin && (
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 btn-ghost text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5 flex-shrink-0"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create task modal */}
      <Modal open={showTaskModal} onClose={() => setShowTaskModal(false)} title="New Task">
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="label">Title</label>
            <input
              className="input"
              placeholder="What needs to be done?"
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Optional details..."
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Subtasks (one per line)</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="e.g. Design homepage&#10;Implement API&#10;Write tests"
              value={taskForm.subtasks_text || ''}
              onChange={e => setTaskForm({ ...taskForm, subtasks_text: e.target.value })}
            />
            <p className="text-xs text-ink-400 mt-1.5 flex items-start gap-1.5">
              <span className="text-accent-600 font-semibold mt-0.5">💡</span>
              <span>Task will auto-advance: when any subtask is done → "In Progress", all done → "Done"</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Assign To</label>
              <select
                className="input"
                value={taskForm.assigned_to}
                onChange={e => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {(project.members?.length > 0 ? project.members : allUsers).map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Status</label>
              <select
                className="input"
                value={taskForm.status}
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <option value="todo">Todo</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={taskForm.due_date}
              onChange={e => setTaskForm({ ...taskForm, due_date: e.target.value })}
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
              {saving ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
