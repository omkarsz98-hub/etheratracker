const config = {
  todo: { label: 'Todo', className: 'bg-ink-100 text-ink-500' },
  in_progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700' },
  done: { label: 'Done', className: 'bg-emerald-100 text-emerald-700' },
}

export default function StatusBadge({ status }) {
  const { label, className } = config[status] || config.todo
  return (
    <span className={`badge ${className}`}>{label}</span>
  )
}
