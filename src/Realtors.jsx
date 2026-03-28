import { useState, useEffect } from 'react'
import { Modal, Avatar, AIBox, EmptyState, ConfirmDialog, PageHeader } from './components'
import { useAIPrompt } from './useAIPrompt'

const COLORS = ['sage', 'clay', 'amber', 'blue', 'purple']
const COLOR_HEX = { sage: '#7C9A7E', clay: '#C17F5E', amber: '#E5A855', blue: '#378ADD', purple: '#7F77DD' }

function RealtorForm({ realtor, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', agency: '', phone: '', email: '', notes: '', color: 'sage', ...(realtor || {}) })
  const { prompt, loading, fetchPrompt } = useAIPrompt()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return alert('Please enter a name.')
    onSave(form)
    fetchPrompt(form, 'realtor')
  }

  return (
    <div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Full Name *</label>
          <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Sarah Chen" />
        </div>
        <div className="form-group">
          <label className="form-label">Agency</label>
          <input className="form-input" value={form.agency} onChange={e => set('agency', e.target.value)} placeholder="Coldwell Banker" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Phone</label>
          <input className="form-input" type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="(312) 555-0000" />
        </div>
        <div className="form-group">
          <label className="form-label">Email</label>
          <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="sarah@agency.com" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Color</label>
        <div style={{ display: 'flex', gap: 12 }}>
          {COLORS.map(c => (
            <button key={c} onClick={() => set('color', c)} style={{ width: 36, height: 36, borderRadius: '50%', background: COLOR_HEX[c], border: form.color === c ? '3px solid var(--ink)' : '3px solid transparent', cursor: 'pointer', transition: 'border 0.15s' }} />
          ))}
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Style preferences, communication notes…" />
      </div>
      <AIBox prompt={prompt} loading={loading} />
      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={handleSave}>{realtor ? 'Save Changes' : 'Add Realtor'}</button>
        <button className="btn btn-secondary btn-full" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

function RealtorDetail({ realtor, jobs, onEdit, onDelete, onClose }) {
  const [showDelete, setShowDelete] = useState(false)
  const realtorJobs = jobs.filter(j => j.realtor === realtor.name)

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16 }}>
        <Avatar name={realtor.name} color={realtor.color} />
        <div>
          <div style={{ fontWeight: 500, fontSize: 16 }}>{realtor.name}</div>
          <div style={{ fontSize: 13, color: 'var(--muted)' }}>{realtor.agency}</div>
          {realtor.phone && <a href={`tel:${realtor.phone}`} style={{ fontSize: 13, color: 'var(--sage)', display: 'block', marginTop: 2 }}>{realtor.phone}</a>}
          {realtor.email && <a href={`mailto:${realtor.email}`} style={{ fontSize: 12, color: 'var(--sage)', display: 'block' }}>{realtor.email}</a>}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--sage-light)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--sage-dark)', marginBottom: 4 }}>Total Jobs</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--sage)' }}>{realtorJobs.length}</div>
        </div>
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px', textAlign: 'center' }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>Active Now</div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 28, color: 'var(--ink)' }}>{realtorJobs.filter(j => j.status === 'Active').length}</div>
        </div>
      </div>

      {realtor.notes && (
        <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16 }}>
          <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>Notes</div>
          <div style={{ fontSize: 14, color: 'var(--ink)', lineHeight: 1.6 }}>{realtor.notes}</div>
        </div>
      )}

      {realtorJobs.length > 0 && (
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 8 }}>Jobs</div>
          {realtorJobs.map(j => (
            <div key={j.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '0.5px solid var(--border)' }}>
              <div style={{ fontSize: 14, fontWeight: 500 }}>{j.address}</div>
              <span className={`badge badge-${j.status.toLowerCase().replace(/ /g, '-')}`}>{j.status}</span>
            </div>
          ))}
        </div>
      )}

      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={onEdit}>Edit Realtor</button>
        <button className="btn btn-danger btn-full" onClick={() => setShowDelete(true)}>Delete</button>
      </div>

      <ConfirmDialog open={showDelete} title="Delete Realtor?"
        message={`Remove ${realtor.name} from your network? Their jobs won't be deleted.`}
        onConfirm={() => { onDelete(realtor.id); onClose() }}
        onCancel={() => setShowDelete(false)} />
    </div>
  )
}

export default function Realtors({ realtors, jobs, addRealtor, updateRealtor, deleteRealtor, fabTrigger }) {
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null)

  useEffect(() => {
    if (fabTrigger > 0) setModal({ type: 'new' })
  }, [fabTrigger])

  const filtered = realtors.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.agency.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Realtors" subtitle="Your staging referral network"
        action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'new' })}>+ Add</button>} />

      <input className="form-input" style={{ marginBottom: 14 }} placeholder="Search name or agency…" value={search} onChange={e => setSearch(e.target.value)} />

      <div className="panel">
        {filtered.length === 0
          ? <EmptyState icon="👤" title="No realtors yet" sub="Add realtors who refer staging jobs to you." />
          : filtered.map(r => {
            const jobCount = jobs.filter(j => j.realtor === r.name).length
            return (
              <div key={r.id} className="list-row" onClick={() => setModal({ type: 'detail', realtor: r })}>
                <Avatar name={r.name} color={r.color} />
                <div className="flex-1 min-w-0">
                  <div className="font-medium" style={{ fontSize: 14 }}>{r.name}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{r.agency}</div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 500, color: 'var(--sage)' }}>{jobCount} job{jobCount !== 1 ? 's' : ''}</div>
                  {r.phone && <div className="text-xs text-muted">{r.phone}</div>}
                </div>
              </div>
            )
          })
        }
      </div>

      <Modal open={modal?.type === 'new'} onClose={() => setModal(null)} title="Add Realtor">
        <RealtorForm onSave={r => { addRealtor(r); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Realtor">
        <RealtorForm realtor={modal?.realtor} onSave={r => { updateRealtor(r.id, r); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal?.type === 'detail'} onClose={() => setModal(null)} title={modal?.realtor?.name || ''}>
        {modal?.realtor && <RealtorDetail realtor={modal.realtor} jobs={jobs}
          onEdit={() => setModal({ type: 'edit', realtor: modal.realtor })}
          onDelete={deleteRealtor} onClose={() => setModal(null)} />}
      </Modal>
    </div>
  )
}
