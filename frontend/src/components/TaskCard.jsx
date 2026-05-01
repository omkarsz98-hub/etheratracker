import { Calendar, User } from 'lucide-react'
import StatusBadge from './StatusBadge'

export default function TaskCard({ task, compact = false }) {
  return (
    <div className={`task-card ${task.overdue ? 'overdue' : ''}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-ink-900 truncate">{task.title}</span>
            <StatusBadge status={task.status} />
            {task.overdue && <span className="badge bg-rose-100 text-rose-600">Overdue</span>}
          </div>

          {!compact && task.description && (
            <p className="text-xs text-ink-400 mt-1 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-400">
            {task.assigned_user && (
              <span className="flex items-center gap-1">
                <User size={11} /> {task.assigned_user.name}
              </span>
            )}
            {task.due_date && (
              <span className={`flex items-center gap-1 ${task.overdue ? 'text-rose-500' : ''}`}>
                <Calendar size={11} /> {task.due_date}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
