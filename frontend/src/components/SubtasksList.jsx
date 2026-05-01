import { useState, useEffect } from 'react'
import api from '../utils/api'

export default function SubtasksList({ task, onTaskUpdated }) {
  const [subtasks, setSubtasks] = useState(task.subtasks || [])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setSubtasks(task.subtasks || [])
  }, [task.subtasks])

  if (!subtasks.length) return null

  const toggleSubtask = async (id) => {
    if (loading) return
    setLoading(true)
    const newSubtasks = subtasks.map(s => s.id === id ? { ...s, completed: !s.completed } : s)
    setSubtasks(newSubtasks) // optimistic update
    
    try {
      const res = await api.put(`/tasks/${task.id}`, { subtasks: newSubtasks })
      if (onTaskUpdated) {
        onTaskUpdated(res.data)
      } else {
        setSubtasks(res.data.subtasks)
      }
    } catch (err) {
      setSubtasks(subtasks) // revert on error
      alert('Failed to update subtask')
    } finally {
      setLoading(false)
    }
  }

  const completedCount = subtasks.filter(s => s.completed).length

  return (
    <div className="mt-3 border-t border-ink-100 pt-3">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Subtasks</span>
        <span className="text-xs text-ink-400 font-medium">{completedCount}/{subtasks.length}</span>
      </div>
      
      {/* Progress indicator */}
      <div className="w-full h-1.5 bg-ink-100 rounded-full overflow-hidden mb-2">
        <div 
          className="h-full bg-accent-600 transition-all duration-300"
          style={{ width: `${(completedCount / subtasks.length) * 100}%` }}
        />
      </div>

      <div className="space-y-1.5">
        {subtasks.map(s => (
          <label key={s.id} className="flex items-start gap-2 cursor-pointer group">
            <input 
              type="checkbox" 
              checked={s.completed} 
              onChange={() => toggleSubtask(s.id)}
              disabled={loading}
              className="mt-0.5 rounded text-accent-600 border-ink-300 focus:ring-accent-500"
            />
            <span className={`text-xs leading-snug ${s.completed ? 'text-ink-300 line-through' : 'text-ink-600 group-hover:text-ink-900'}`}>
              {s.title}
            </span>
          </label>
        ))}
      </div>
      
      {/* Auto-progression hint */}
      <div className="mt-2.5 p-2 bg-accent-50 rounded-lg border border-accent-100">
        <p className="text-[11px] text-accent-700">
          <span className="font-semibold">✨ Auto-advance:</span> When all subtasks are done, task moves to "Done"
        </p>
      </div>
    </div>
  )
}
