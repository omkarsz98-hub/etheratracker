import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { useAuth } from '../context/AuthContext'
import { Plus, FolderKanban, Users, CheckSquare, ArrowRight, Trash2 } from 'lucide-react'
import Modal from '../components/Modal'

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', member_ids: [] })
  const [saving, setSaving] = useState(false)

  const fetchProjects = async () => {
    const res = await api.get('/projects')
    setProjects(res.data)
  }

  useEffect(() => {
    const load = async () => {
      try {
        await fetchProjects()
        if (isAdmin) {
          const usersRes = await api.get('/users')
          setUsers(usersRes.data)
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [isAdmin])

  const handleCreate = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/projects', form)
      setShowModal(false)
      setForm({ name: '', description: '', member_ids: [] })
      await fetchProjects()
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to create project')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete project "${name}"? This will also delete all its tasks.`)) return
    await api.delete(`/projects/${id}`)
    setProjects(prev => prev.filter(p => p.id !== id))
  }

  const toggleMember = (uid) => {
    setForm(f => ({
      ...f,
      member_ids: f.member_ids.includes(uid)
        ? f.member_ids.filter(id => id !== uid)
        : [...f.member_ids, uid]
    }))
  }

  if (loading) return <div className="flex items-center justify-center h-64 text-ink-400 text-sm">Loading projects...</div>

  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-ink-900">Projects</h1>
          <p className="text-ink-400 text-sm mt-1">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary">
            <Plus size={16} /> New Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card p-16 text-center">
          <FolderKanban size={32} className="text-ink-200 mx-auto mb-3" />
          <p className="text-ink-400 text-sm">No projects yet.</p>
          {isAdmin && (
            <button onClick={() => setShowModal(true)} className="btn-primary mt-4">
              <Plus size={16} /> Create first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(project => (
            <div key={project.id} className="card p-5 hover:shadow-card-hover transition-all group relative animate-fade-in">
              <div className="flex items-start justify-between mb-3">
                <div className="w-9 h-9 bg-accent-50 rounded-xl flex items-center justify-center">
                  <FolderKanban size={17} className="text-accent-600" />
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleDelete(project.id, project.name)}
                    className="opacity-0 group-hover:opacity-100 btn-ghost text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-1.5"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>

              <h3 className="font-semibold text-ink-900 mb-1 leading-snug">{project.name}</h3>
              {project.description && (
                <p className="text-xs text-ink-400 mb-3 line-clamp-2">{project.description}</p>
              )}

              <div className="flex items-center gap-3 text-xs text-ink-400 mb-4">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {project.members?.length || 0} members
                </span>
                <span className="flex items-center gap-1">
                  <CheckSquare size={12} /> {project.task_count || 0} tasks
                </span>
              </div>

              {/* Member avatars */}
              {project.members?.length > 0 && (
                <div className="flex -space-x-1.5 mb-4">
                  {project.members.slice(0, 5).map(m => (
                    <div
                      key={m.id}
                      title={m.name}
                      className="w-6 h-6 rounded-full bg-accent-100 border-2 border-white flex items-center justify-center text-xs font-medium text-accent-700"
                    >
                      {m.name?.[0]?.toUpperCase()}
                    </div>
                  ))}
                  {project.members.length > 5 && (
                    <div className="w-6 h-6 rounded-full bg-ink-100 border-2 border-white flex items-center justify-center text-xs text-ink-500">
                      +{project.members.length - 5}
                    </div>
                  )}
                </div>
              )}

              <Link
                to={`/projects/${project.id}`}
                className="text-xs text-accent-600 hover:text-accent-700 flex items-center gap-1 font-medium"
              >
                View project <ArrowRight size={12} />
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* Create project modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="New Project">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="label">Project Name</label>
            <input
              className="input"
              placeholder="e.g. Marketing Website"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Description</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="What's this project about?"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Add Members</label>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-ink-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.member_ids.includes(u.id)}
                    onChange={() => toggleMember(u.id)}
                    className="rounded"
                  />
                  <div className="w-6 h-6 rounded-full bg-accent-100 flex items-center justify-center text-xs font-medium text-accent-700">
                    {u.name?.[0]?.toUpperCase()}
                  </div>
                  <span className="text-sm text-ink-700">{u.name}</span>
                  <span className="text-xs text-ink-400 ml-auto capitalize">{u.role}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1 justify-center">
              Cancel
            </button>
            <button type="submit" className="btn-primary flex-1 justify-center" disabled={saving}>
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
