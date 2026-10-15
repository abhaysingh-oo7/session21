import { useState, useEffect, useCallback } from 'react'

const API_BASE = '/api'

// ─── helpers ─────────────────────────────────────────────────────────────────
function statusLabel(s) {
  return { todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' }[s] ?? s
}
function statusClass(s) {
  return `badge badge-${s}`
}
function priorityClass(p) {
  return `priority-${p}`
}
function initials(name) {
  if (!name) return '?'
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}
function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins  = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days  = Math.floor(diff / 86400000)
  if (days > 0)  return `${days}d ago`
  if (hours > 0) return `${hours}h ago`
  if (mins > 0)  return `${mins}m ago`
  return 'just now'
}

// ─── Activity feed (synthetic from tasks) ─────────────────────────────────────
function buildActivity(tasks) {
  return tasks.slice(0, 5).map(t => ({
    text: `Task "${t.title}" is ${statusLabel(t.status)}`,
    time: timeAgo(t.updated_at),
    color: t.priority === 'critical' ? '#ef4444'
         : t.priority === 'high'     ? '#f59e0b'
         : t.status   === 'done'     ? '#22c55e'
         : '#6c63ff',
  }))
}

// ─── Modal component ──────────────────────────────────────────────────────────
function TaskModal({ task, onClose, onSave }) {
  const [form, setForm] = useState(
    task
      ? { title: task.title, description: task.description ?? '', status: task.status, priority: task.priority, assignee: task.assignee ?? '' }
      : { title: '', description: '', status: 'todo', priority: 'medium', assignee: '' }
  )
  const [saving, setSaving] = useState(false)

  const set = (field, val) => setForm(f => ({ ...f, [field]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) return
    setSaving(true)
    const payload = { ...form, description: form.description || null, assignee: form.assignee || null }
    try {
      let res
      if (task) {
        res = await fetch(`${API_BASE}/tasks/${task.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      } else {
        res = await fetch(`${API_BASE}/tasks`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      }
      if (!res.ok) throw new Error('Failed')
      const saved = await res.json()
      onSave(saved, !!task)
    } catch {
      alert('Could not save task. Is the backend running?')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{task ? '✏️ Edit Task' : '➕ New Task'}</span>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input id="task-title" className="form-input" placeholder="What needs to be done?" value={form.title}
                onChange={e => set('title', e.target.value)} required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-textarea" placeholder="Add more detail…" value={form.description}
                onChange={e => set('description', e.target.value)} />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Status</label>
                <select id="task-status" className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Priority</label>
                <select id="task-priority" className="form-select" value={form.priority} onChange={e => set('priority', e.target.value)}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Assignee</label>
              <input className="form-input" placeholder="e.g. Alice, Bob…" value={form.assignee}
                onChange={e => set('assignee', e.target.value)} />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button id="save-task-btn" type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? '⏳ Saving…' : (task ? '💾 Update Task' : '✅ Create Task')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [tasks,   setTasks]   = useState([])
  const [stats,   setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [filter,  setFilter]  = useState('all')
  const [search,  setSearch]  = useState('')
  const [modal,   setModal]   = useState(null) // null | 'create' | task object

  // fetch tasks + stats
  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const [tRes, sRes] = await Promise.all([
        fetch(`${API_BASE}/tasks`),
        fetch(`${API_BASE}/tasks/stats`),
      ])
      if (!tRes.ok || !sRes.ok) throw new Error('API error')
      setTasks(await tRes.json())
      setStats(await sRes.json())
    } catch {
      setError('Cannot reach the backend. Make sure Docker Compose is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  // delete task
  const deleteTask = async (id) => {
    if (!confirm('Delete this task?')) return
    await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' })
    setTasks(prev => prev.filter(t => t.id !== id))
    setStats(prev => prev ? { ...prev, total: prev.total - 1 } : prev)
  }

  // after save/update
  const handleSaved = (saved, isEdit) => {
    if (isEdit) {
      setTasks(prev => prev.map(t => t.id === saved.id ? saved : t))
    } else {
      setTasks(prev => [saved, ...prev])
    }
    setModal(null)
    load() // refresh stats
  }

  // filtered tasks
  const visible = tasks.filter(t => {
    const matchFilter = filter === 'all' || t.status === filter
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase()) ||
                        (t.assignee && t.assignee.toLowerCase().includes(search.toLowerCase()))
    return matchFilter && matchSearch
  })

  const filters = ['all', 'todo', 'in_progress', 'review', 'done']
  const filterLabels = { all: 'All', todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done' }

  const PIPELINE_STEPS = [
    { name: 'Code', dot: 'green' },
    { name: 'Pytest', dot: 'green' },
    { name: 'Docker Build', dot: 'green' },
    { name: 'Trivy Scan', dot: 'green' },
    { name: 'GHCR Push', dot: 'blue' },
    { name: 'Terraform', dot: 'accent' },
    { name: 'Helm Deploy', dot: 'yellow' },
    { name: 'K8s Live', dot: 'muted' },
  ]

  return (
    <div className="app-shell">
      {/* ── SIDEBAR ── */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-icon">📋</div>
          <div>
            <div className="brand-text">TaskBoard</div>
            <div className="brand-version">Session 21 • v1.0</div>
          </div>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-label">Workspace</div>
          {[
            { icon: '📊', label: 'Dashboard', active: true },
            { icon: '✅', label: 'My Tasks' },
            { icon: '👥', label: 'Team Board' },
            { icon: '📅', label: 'Calendar' },
          ].map(item => (
            <div key={item.label} className={`nav-item${item.active ? ' active' : ''}`}>
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}

          <div className="sidebar-label" style={{ marginTop: 20 }}>DevOps</div>
          {[
            { icon: '🔄', label: 'CI/CD Pipeline' },
            { icon: '🐳', label: 'Containers' },
            { icon: '☸️', label: 'Kubernetes' },
            { icon: '📈', label: 'Monitoring' },
          ].map(item => (
            <div key={item.label} className="nav-item">
              <span className="nav-icon">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="avatar">AD</div>
          <div>
            <div className="avatar-name">Admin</div>
            <div className="avatar-role">DevOps Engineer</div>
          </div>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <main className="main">
        {/* Header */}
        <div className="header">
          <div className="header-left">
            <h1>Project Dashboard</h1>
            <p>TaskBoard — Session 21 DevOps Capstone</p>
          </div>
          <div className="header-right">
            <button id="refresh-btn" className="btn btn-ghost" onClick={load} title="Refresh">🔄 Refresh</button>
            <button id="create-task-btn" className="btn btn-primary" onClick={() => setModal('create')}>
              ➕ New Task
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          {/* Error */}
          {error && (
            <div className="error-bar">
              ⚠️ {error}
            </div>
          )}

          {/* KPI Cards */}
          <div className="kpi-grid">
            <div className="kpi-card total">
              <div className="kpi-label">Total Tasks</div>
              <div className="kpi-value">{stats?.total ?? '—'}</div>
              <div className="kpi-sub">All tasks in board</div>
            </div>
            <div className="kpi-card todo">
              <div className="kpi-label">To Do</div>
              <div className="kpi-value">{stats?.todo ?? '—'}</div>
              <div className="kpi-sub">Waiting to start</div>
            </div>
            <div className="kpi-card active">
              <div className="kpi-label">In Progress</div>
              <div className="kpi-value">{stats?.in_progress ?? '—'}</div>
              <div className="kpi-sub">Currently active</div>
            </div>
            <div className="kpi-card done">
              <div className="kpi-label">Done</div>
              <div className="kpi-value">{stats?.done ?? '—'}</div>
              <div className="kpi-sub">Completed tasks</div>
            </div>
          </div>

          {/* Pipeline indicator */}
          <div className="pipeline-bar">
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', marginRight: 4 }}>CI/CD</span>
            {PIPELINE_STEPS.map((step, i) => (
              <div key={step.name} className="pipeline-step">
                {i > 0 && <span className="pipeline-arrow">›</span>}
                <div className={`pipeline-dot ${step.dot}`} />
                <span className="pipeline-name">{step.name}</span>
              </div>
            ))}
          </div>

          {/* Filter bar */}
          <div className="filter-bar">
            {filters.map(f => (
              <button key={f} id={`filter-${f}`} className={`filter-btn${filter === f ? ' active' : ''}`} onClick={() => setFilter(f)}>
                {filterLabels[f]}
                {stats && f !== 'all' && <span style={{ marginLeft: 5, opacity: 0.7 }}>({stats[f] ?? 0})</span>}
              </button>
            ))}
            <input
              id="search-input"
              className="search-input"
              placeholder="🔍 Search tasks…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Bottom grid: table + activity */}
          <div className="bottom-grid">
            {/* Task Table */}
            <div className="task-table-wrap">
              {loading ? (
                <div className="loading-wrap">
                  <div className="spinner" />
                  Loading tasks…
                </div>
              ) : visible.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">📋</div>
                  <div className="empty-title">{tasks.length === 0 ? 'No tasks yet' : 'No matching tasks'}</div>
                  <div className="empty-sub">{tasks.length === 0 ? 'Click "New Task" to get started' : 'Try changing filters or search'}</div>
                  {tasks.length === 0 && (
                    <button className="btn btn-primary" onClick={() => setModal('create')} style={{ marginTop: 8 }}>
                      ➕ Create First Task
                    </button>
                  )}
                </div>
              ) : (
                <table className="task-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Task</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Assignee</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map(task => (
                      <tr key={task.id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>#{task.id}</td>
                        <td>
                          <div className="task-title">{task.title}</div>
                          {task.description && <div className="task-desc">{task.description.slice(0, 60)}{task.description.length > 60 ? '…' : ''}</div>}
                        </td>
                        <td>
                          <span className={statusClass(task.status)}>
                            {statusLabel(task.status)}
                          </span>
                        </td>
                        <td><span className={priorityClass(task.priority)}>{task.priority}</span></td>
                        <td>
                          {task.assignee ? (
                            <div className="assignee">
                              <div className="assignee-dot">{initials(task.assignee)}</div>
                              {task.assignee}
                            </div>
                          ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>—</span>}
                        </td>
                        <td style={{ color: 'var(--text-muted)', fontSize: 12 }}>{timeAgo(task.created_at)}</td>
                        <td>
                          <div className="actions-col">
                            <button className="btn btn-ghost btn-sm" onClick={() => setModal(task)} title="Edit">✏️</button>
                            <button className="btn btn-danger btn-sm" onClick={() => deleteTask(task.id)} title="Delete">🗑️</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Activity Feed */}
            <div className="activity-feed">
              <div className="activity-title">🕐 Activity</div>
              {buildActivity(tasks).length === 0 ? (
                <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>No activity yet.</div>
              ) : (
                buildActivity(tasks).map((a, i) => (
                  <div key={i} className="activity-item">
                    <div className="activity-dot" style={{ background: a.color, boxShadow: `0 0 5px ${a.color}` }} />
                    <div>
                      <div className="activity-text">{a.text}</div>
                      <div className="activity-time">{a.time}</div>
                    </div>
                  </div>
                ))
              )}

              {/* Priority alerts */}
              {stats && (stats.critical_priority > 0 || stats.high_priority > 0) && (
                <div style={{ marginTop: 16, padding: '10px 14px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f87171', marginBottom: 4 }}>⚡ Priority Alert</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {stats.critical_priority} critical · {stats.high_priority} high priority tasks need attention
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── MODAL ── */}
      {modal && (
        <TaskModal
          task={modal === 'create' ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSaved}
        />
      )}
    </div>
  )
}
