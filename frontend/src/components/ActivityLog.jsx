import { ActivityIcon } from 'lucide-react'

export default function ActivityLog({ logs }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="card p-6 text-center text-ink-400 text-sm">
        No activity yet.
      </div>
    )
  }

  return (
    <div className="card divide-y divide-ink-50">
      {logs.slice(0, 10).map((log, i) => (
        <div key={log.id || i} className="px-4 py-3">
          <p className="text-xs text-ink-600 leading-relaxed">{log.action}</p>
          <p className="text-[11px] text-ink-300 mt-0.5">
            {new Date(log.timestamp).toLocaleString(undefined, {
              month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })}
          </p>
        </div>
      ))}
    </div>
  )
}
