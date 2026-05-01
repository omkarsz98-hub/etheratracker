import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { CheckCircle2, Clock, AlertCircle, ArrowRight, Calendar } from 'lucide-react'
import TaskCard from '../components/TaskCard'
import ActivityLog from '../components/ActivityLog'

export default function DashboardPage() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, logsRes] = await Promise.all([
          api.get('/tasks/stats'),
          api.get('/users/logs'),
        ])
        setStats(statsRes.data)
        setLogs(logsRes.data)
      } catch (err) {
        console.error('Dashboard fetch failed', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-ink-400 text-sm">Loading dashboard...</div>
  }

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats?.total ?? 0,
      icon: Clock,
      color: 'text-accent-600',
      bg: 'bg-accent-50',
    },
    {
      label: 'Completed',
      value: stats?.completed ?? 0,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Overdue',
      value: stats?.overdue ?? 0,
      icon: AlertCircle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
    },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold text-ink-900">
          Good day, {user?.name?.split(' ')[0]} 👋
        </h1>
        <p className="text-ink-400 text-sm mt-1">Here's what's happening with your tasks.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow">
            <div className={`w-11 h-11 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={20} className={color} />
            </div>
            <div>
              <div className="text-2xl font-display font-bold text-ink-900">{value}</div>
              <div className="text-xs text-ink-400 font-medium mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Recent tasks */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-800">Recent Tasks</h2>
            <Link to="/tasks" className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium">
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {stats?.recent_tasks?.length === 0 ? (
            <div className="card p-8 text-center text-ink-400 text-sm">
              No tasks yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {stats?.recent_tasks?.map(task => (
                <Link 
                  key={task.id} 
                  to={`/projects/${task.project_id}`}
                  className="block transition-transform hover:-translate-y-0.5"
                >
                  <TaskCard task={task} compact />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Activity log */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-ink-800">Activity</h2>
          </div>
          <ActivityLog logs={logs} />
        </div>
      </div>
    </div>
  )
}
