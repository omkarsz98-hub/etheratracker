import { useState, useEffect } from 'react'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Calendar, User, CheckCircle2, Clock, Circle } from 'lucide-react'
import SubtasksList from '../components/SubtasksList'

const COLUMNS = [
  { key: 'todo', label: 'Todo', icon: Circle, color: 'text-ink-400', headerBg: 'bg-ink-100' },
  { key: 'in_progress', label: 'In Progress', icon: Clock, color: 'text-amber-500', headerBg: 'bg-amber-50' },
  { key: 'done', label: 'Done', icon: CheckCircle2, color: 'text-emerald-500', headerBg: 'bg-emerald-50' },
]

export default function TaskBoardPage() {
  const { isAdmin } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(null) // task id being updated

  useEffect(() => {
    api.get('/tasks')
      .then(res => setTasks(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const handleStatusChange = async (taskId, newStatus, fullUpdatedTask = null) => {
    if (fullUpdatedTask) {
      setTasks(prev => prev.map(t => t.id === taskId ? fullUpdatedTask : t))
      return
    }
    setUpdating(taskId)
    try {
      const res = await api.put(`/tasks/${taskId}`, { status: newStatus })
      setTasks(prev => prev.map(t => t.id === taskId ? res.data : t))
    } catch (err) {
      alert(err.response?.data?.detail || 'Could not update task')
    } finally {
      setUpdating(null)
    }
  }

  const byStatus = (status) => tasks.filter(t => t.status === status)

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-400 text-sm">Loading tasks...</div>

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-ink-900">Task Board</h1>
        <p className="text-ink-400 text-sm mt-1">
          {tasks.length} total task{tasks.length !== 1 ? 's' : ''}
          {!isAdmin && ' assigned to you'}
        </p>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(({ key, label, icon: Icon, color, headerBg }) => {
          const columnTasks = byStatus(key)
          return (
            <div key={key} className="kanban-col min-w-[280px] max-w-[320px]">
              {/* Column header */}
              <div className={`flex items-center gap-2 px-3 py-2 rounded-xl ${headerBg} mb-1`}>
                <Icon size={15} className={color} />
                <span className="text-sm font-semibold text-ink-700">{label}</span>
                <span className="ml-auto text-xs font-mono text-ink-400">{columnTasks.length}</span>
              </div>

              {/* Tasks */}
              {columnTasks.length === 0 ? (
                <div className="flex items-center justify-center h-20 text-ink-300 text-xs">
                  No tasks
                </div>
              ) : (
                columnTasks.map(task => (
                  <KanbanCard
                    key={task.id}
                    task={task}
                    currentStatus={key}
                    onStatusChange={handleStatusChange}
                    loading={updating === task.id}
                    isAdmin={isAdmin}
                  />
                ))
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function KanbanCard({ task, currentStatus, onStatusChange, loading, isAdmin }) {
  const [showMenu, setShowMenu] = useState(false)
  const otherStatuses = COLUMNS.filter(c => c.key !== currentStatus)

  return (
    <div className={`task-card ${task.overdue ? 'overdue' : ''} relative`}>
      {/* Title */}
      <h4 className="font-medium text-ink-900 text-sm leading-snug mb-2">{task.title}</h4>

      {task.description && (
        <p className="text-xs text-ink-400 mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* Meta */}
      <div className="flex flex-col gap-1 text-xs text-ink-400 mb-3">
        {task.assigned_user && (
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded-full bg-accent-100 flex items-center justify-center text-accent-700 text-[9px] font-bold">
              {task.assigned_user.name?.[0]?.toUpperCase()}
            </div>
            <span>{task.assigned_user.name}</span>
          </div>
        )}
        {task.due_date && (
          <div className={`flex items-center gap-1 ${task.overdue ? 'text-rose-500' : ''}`}>
            <Calendar size={11} />
            <span>{task.due_date}</span>
            {task.overdue && <span className="font-medium">· Overdue</span>}
          </div>
        )}
      </div>

      {/* Subtasks */}
      <SubtasksList 
        task={task} 
        onTaskUpdated={(updatedTask) => {
          onStatusChange(task.id, updatedTask.status, updatedTask)
        }} 
      />

      {/* Move to */}
      {isAdmin && (
        <div className="relative mt-2">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="text-xs text-accent-600 hover:text-accent-700 font-medium py-1 px-2 rounded-lg hover:bg-accent-50 transition-colors"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Move to →'}
          </button>

          {showMenu && (
            <div className="absolute bottom-full left-0 mb-1 w-36 card py-1 z-10 animate-fade-in">
              {otherStatuses.map(({ key, label, icon: Icon, color }) => (
                <button
                  key={key}
                  onClick={() => {
                    onStatusChange(task.id, key)
                    setShowMenu(false)
                  }}
                  className="w-full text-left px-3 py-2 text-xs text-ink-600 hover:bg-ink-50 flex items-center gap-2"
                >
                  <Icon size={12} className={color} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
