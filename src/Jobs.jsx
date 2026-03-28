import { useState, useEffect } from 'react'
import { Modal, Badge, StatusDot, PhotoUpload, AIBox, EmptyState, ConfirmDialog, PageHeader } from './components'
import { useAIPrompt } from './useAIPrompt'
import { generateJobSheetPDF } from './pdfUtils'

const STATUSES = ['Scheduled', 'Active', 'Under Review', 'Complete']

function JobForm({ job, realtors, onSave, onCancel }) {
  const [form, setForm] = useState({
    address: '', city: '', state: 'IL', realtor: realtors[0]?.name || '',
    status: 'Scheduled', date: new Date().toISOString().split('T')[0],
    items: [], itemInput: '', notes: '', photos: [],
    ...(job || {})
  })
  const { prompt, loading, fetchPrompt } = useAIPrompt()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const addItem = () => {
    const val = form.itemInput.trim()
    if (!val) return
    set('items', [...form.items, val])
    set('itemInput', '')
  }

  const removeItem = (i) => set('items', form.items.filter((_, idx) => idx !== i))

  const handleSave = () => {
    if (!form.address.trim()) return alert('Please enter a property address.')
    const saved = { ...form }
    delete saved.itemInput
    onSave(saved)
    fetchPrompt(saved, 'job')
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Street Address *</label>
        <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="142 Willow Creek Dr" autoComplete="street-address" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">City</label>
          <input className="form-input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="Naperville" />
        </div>
        <div className="form-group">
          <label className="form-label">Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Realtor</label>
          <select className="form-select" value={form.realtor} onChange={e => set('realtor', e.target.value)}>
            {realtors.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Status</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Staged Items</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <input className="form-input" value={form.itemInput}
            onChange={e => set('itemInput', e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addItem()}
            placeholder="e.g. Gray linen sofa…" style={{ flex: 1 }} />
          <button className="btn btn-secondary" onClick={addItem} style={{ flexShrink: 0, minWidth: 60 }}>Add</button>
        </div>
        {form.items.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {form.items.map((item, i) => (
              <span key={i} className="tag" style={{ gap: 6 }}>
                {item}
                <button onClick={() => removeItem(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--sage-dark)', fontSize: 16, lineHeight: 1, padding: 0 }}>×</button>
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Access instructions, special requests, buyer notes…" />
      </div>

      <div className="form-group">
        <label className="form-label">Property Photos</label>
        <PhotoUpload photos={form.photos} onChange={p => set('photos', typeof p === 'function' ? p(form.photos) : p)} />
      </div>

      <AIBox prompt={prompt} loading={loading} />

      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={handleSave}>{job ? 'Save Changes' : 'Create Job'}</button>
        <button className="btn btn-secondary btn-full" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function JobDetail({ job, realtor, onEdit, onDelete, onClose }) {
  const [showDelete, setShowDelete] = useState(false)
  const [lightbox, setLightbox] = useState(null)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <Badge status={job.status} />
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>{job.city}{job.state ? `, ${job.state}` : ''}</span>
        <span style={{ fontSize: 13, color: 'var(--muted)' }}>· {job.date}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>Realtor</div>
          <div style={{ fontWeight: 500, fontSize: 14 }}>{job.realtor}</div>
          {realtor?.agency && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{realtor.agency}</div>}
          {realtor?.phone && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{realtor.phone}</div>}
        </div>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>Items Staged</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 30, color: 'var(--ink)' }}>{job.items?.length || 0}</div>
        </div>
      </div>

      {job.items?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>Staged Items</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {job.items.map((item, i) => <span key={i} className="tag">{item}</span>)}
          </div>
        </div>
      )}

      {job.notes && (
        <div style={{ background: 'var(--clay-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--clay)', marginBottom: 4 }}>Notes</div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{job.notes}</div>
        </div>
      )}

      {job.photos?.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>Photos ({job.photos.length})</div>
          <div className="photo-grid">
            {job.photos.map(p => (
              <div key={p.id} className="photo-thumb" style={{ cursor: 'zoom-in' }} onClick={() => setLightbox(p.src)}>
                <img src={p.src} alt={p.name} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={onEdit}>Edit Job</button>
        <button className="btn btn-secondary btn-full" onClick={() => generateJobSheetPDF(job, realtor)}>📄 Export Job Sheet PDF</button>
        <button className="btn btn-danger btn-full" onClick={() => setShowDelete(true)}>Delete Job</button>
      </div>

      {lightbox && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setLightbox(null)}>
          <img src={lightbox} style={{ maxWidth: '95vw', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }} alt="Property" />
          <button style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', borderRadius: '50%', width: 40, height: 40, fontSize: 22, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setLightbox(null)}>×</button>
        </div>
      )}

      <ConfirmDialog open={showDelete} title="Delete Job?"
        message={`Permanently delete the job at ${job.address}?`}
        onConfirm={() => { onDelete(job.id); onClose() }}
        onCancel={() => setShowDelete(false)} />
    </div>
  )
}

export default function Jobs({ jobs, realtors, addJob, updateJob, deleteJob, openJobId, onClearOpen, fabTrigger }) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (fabTrigger > 0) setModal({ type: 'new' })
  }, [fabTrigger])

  useEffect(() => {
    if (openJobId) {
      const job = jobs.find(j => j.id === openJobId)
      if (job) setModal({ type: 'detail', job })
      onClearOpen?.()
    }
  }, [openJobId])

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase()
    const matchSearch = !q || j.address.toLowerCase().includes(q) || j.realtor.toLowerCase().includes(q) || j.city.toLowerCase().includes(q)
    const matchStatus = !statusFilter || j.status === statusFilter
    return matchSearch && matchStatus
  })

  const handleSaveNew = (form) => {
    addJob({ ...form, photos: form.photos || [], invoiceId: null })
    setModal(null)
  }

  const handleSaveEdit = (form) => {
    updateJob(form.id, form)
    setModal(null)
  }

  return (
    <div>
      <PageHeader
        title="Staging Jobs"
        subtitle="Track every property and setup"
        action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'new' })}>+ New</button>}
      />

      <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
        <input className="form-input" style={{ flex: 1 }} placeholder="Search address, realtor…" value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-select" style={{ width: 130 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="panel">
        {filtered.length === 0
          ? <EmptyState icon="🏠" title="No jobs found" sub={search || statusFilter ? 'Try adjusting your search.' : 'Tap + to create your first staging job.'} />
          : filtered.map(job => (
            <div key={job.id} className="list-row" onClick={() => setModal({ type: 'detail', job })}>
              <StatusDot status={job.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ fontSize: 14 }}>{job.address}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{job.realtor} · {job.city} · {job.items?.length || 0} items
                  {job.photos?.length > 0 && <span> · 📷{job.photos.length}</span>}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <Badge status={job.status} />
              </div>
            </div>
          ))
        }
      </div>

      <Modal open={modal?.type === 'new'} onClose={() => setModal(null)} title="New Staging Job">
        <JobForm realtors={realtors} onSave={handleSaveNew} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Job">
        <JobForm job={modal?.job} realtors={realtors} onSave={handleSaveEdit} onCancel={() => setModal(null)} />
      </Modal>

      <Modal open={modal?.type === 'detail'} onClose={() => setModal(null)} title={modal?.job?.address || ''}>
        {modal?.job && (
          <JobDetail
            job={modal.job}
            realtor={realtors.find(r => r.name === modal.job.realtor)}
            onEdit={() => setModal({ type: 'edit', job: modal.job })}
            onDelete={deleteJob}
            onClose={() => setModal(null)}
          />
        )}
      </Modal>
    </div>
  )
}
