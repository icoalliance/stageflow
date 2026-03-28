import { useRef } from 'react'

export function Modal({ open, onClose, title, children }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h2 style={{ fontSize: 19 }}>{title}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  )
}

export function Badge({ status }) {
  const map = {
    Active: 'badge-active', Scheduled: 'badge-scheduled', Complete: 'badge-complete',
    'Under Review': 'badge-review', Paid: 'badge-paid', Pending: 'badge-pending', Overdue: 'badge-overdue'
  }
  return <span className={`badge ${map[status] || 'badge-complete'}`}>{status}</span>
}

export function StatusDot({ status }) {
  const map = { Active: 'dot-active', Scheduled: 'dot-scheduled', Complete: 'dot-complete', 'Under Review': 'dot-review' }
  return <span className={`dot ${map[status] || 'dot-complete'}`} />
}

export function Avatar({ name, color = 'sage' }) {
  const colors = {
    sage: { bg: '#EFF4EF', color: '#4A6B4C' },
    clay: { bg: '#F8EDE5', color: '#8B4E2A' },
    amber: { bg: '#FDF5E0', color: '#8B6010' },
    blue: { bg: '#E6F1FB', color: '#185FA5' },
    purple: { bg: '#EEEDFE', color: '#534AB7' },
  }
  const c = colors[color] || colors.sage
  const initials = name.split(' ').map(p => p[0]).join('').substring(0, 2).toUpperCase()
  return <div className="avatar" style={{ background: c.bg, color: c.color }}>{initials}</div>
}

export function PhotoUpload({ photos = [], onChange }) {
  const inputRef = useRef()

  const handleFiles = (e) => {
    const files = Array.from(e.target.files)
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        onChange(prev => [...(prev || photos), { id: Date.now() + Math.random(), src: ev.target.result, name: file.name }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removePhoto = (id) => onChange(photos.filter(p => p.id !== id))

  return (
    <div>
      <div className="photo-upload-area" onClick={() => inputRef.current.click()}>
        <div style={{ fontSize: 28, marginBottom: 6 }}>📷</div>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--sage-dark)' }}>Tap to upload photos</div>
        <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>JPG, PNG · multiple OK</div>
        <input ref={inputRef} type="file" accept="image/*" multiple capture="environment" style={{ display: 'none' }} onChange={handleFiles} />
      </div>
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map(p => (
            <div key={p.id} className="photo-thumb">
              <img src={p.src} alt={p.name} />
              <button className="photo-del" onClick={() => removePhoto(p.id)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function AIBox({ prompt, loading }) {
  if (!loading && !prompt) return null
  return (
    <div className="ai-box">
      <div className="ai-box-label"><span>✦</span> AI Suggestion</div>
      {loading
        ? <div style={{ color: 'var(--muted)', fontSize: 13 }}>Thinking…</div>
        : <div className="ai-box-text">{prompt.text}</div>
      }
    </div>
  )
}

export function EmptyState({ icon, title, sub, action }) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <div className="empty-title">{title}</div>
      <div className="empty-sub">{sub}</div>
      {action && <div style={{ marginTop: 16 }}>{action}</div>}
    </div>
  )
}

export function ConfirmDialog({ open, title, message, onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 style={{ fontSize: 18 }}>{title}</h2>
          <button className="modal-close" onClick={onCancel}>×</button>
        </div>
        <div className="modal-body">
          <p style={{ fontSize: 14, color: 'var(--ink-mid)', marginBottom: 20, lineHeight: 1.6 }}>{message}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <button className="btn btn-danger btn-full" onClick={onConfirm}>Yes, Delete</button>
            <button className="btn btn-secondary btn-full" onClick={onCancel}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}

// Mobile-friendly section header with back affordance
export function PageHeader({ title, subtitle, action }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 24 }}>{title}</h1>
          {subtitle && <p style={{ fontSize: 13, marginTop: 3, color: 'var(--muted)' }}>{subtitle}</p>}
        </div>
        {action && <div style={{ flexShrink: 0, paddingTop: 2 }}>{action}</div>}
      </div>
    </div>
  )
}
