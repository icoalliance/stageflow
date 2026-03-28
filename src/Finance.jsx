import { useState, useEffect } from 'react'
import { Modal, Badge, AIBox, EmptyState, ConfirmDialog, PageHeader } from './components'
import { useAIPrompt } from './useAIPrompt'
import { generateInvoicePDF } from './pdfUtils'

const STATUSES = ['Pending', 'Paid', 'Overdue']

function InvoiceForm({ invoice, realtors, onSave, onCancel }) {
  const [form, setForm] = useState({
    address: '', realtor: realtors[0]?.name || '', amount: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    status: 'Pending', notes: '', jobId: null,
    ...(invoice || {})
  })
  const { prompt, loading, fetchPrompt } = useAIPrompt()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.address.trim()) return alert('Please enter a property address.')
    if (!form.amount) return alert('Please enter an amount.')
    const saved = { ...form, amount: parseFloat(form.amount) }
    onSave(saved)
    fetchPrompt(saved, 'invoice')
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Property Address *</label>
        <input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} placeholder="142 Willow Creek Dr" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Realtor</label>
          <select className="form-select" value={form.realtor} onChange={e => set('realtor', e.target.value)}>
            {realtors.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Amount ($) *</label>
          <input className="form-input" type="number" inputMode="decimal" min="0" step="50" value={form.amount} onChange={e => set('amount', e.target.value)} placeholder="1200" />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Invoice Date</label>
          <input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} />
        </div>
        <div className="form-group">
          <label className="form-label">Due Date</label>
          <input className="form-input" type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Status</label>
        <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label className="form-label">Services / Notes</label>
        <textarea className="form-textarea" style={{ minHeight: 70 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Full staging — living room, dining…" />
      </div>
      <AIBox prompt={prompt} loading={loading} />
      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={handleSave}>{invoice ? 'Save Changes' : 'Create Invoice'}</button>
        <button className="btn btn-secondary btn-full" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Finance({ invoices, realtors, jobs, addInvoice, updateInvoice, deleteInvoice, fabTrigger }) {
  const [statusFilter, setStatusFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    if (fabTrigger > 0) setModal({ type: 'new' })
  }, [fabTrigger])

  const paid = invoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.amount, 0)
  const pending = invoices.filter(i => i.status === 'Pending').reduce((a, b) => a + b.amount, 0)
  const overdue = invoices.filter(i => i.status === 'Overdue').reduce((a, b) => a + b.amount, 0)

  const filtered = invoices.filter(i => statusFilter === 'All' || i.status === statusFilter)

  return (
    <div>
      <PageHeader title="Finances" subtitle="Invoices and payments"
        action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'new' })}>+ Invoice</button>} />

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Total</div>
          <div className="stat-value" style={{ fontSize: 22 }}>${(paid + pending + overdue).toLocaleString()}</div>
          <div className="stat-sub">{invoices.length} invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Paid</div>
          <div className="stat-value" style={{ color: 'var(--sage)', fontSize: 22 }}>${paid.toLocaleString()}</div>
          <div className="stat-sub">{invoices.filter(i => i.status === 'Paid').length} invoices</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Pending</div>
          <div className="stat-value" style={{ color: 'var(--clay)', fontSize: 22 }}>${pending.toLocaleString()}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Overdue</div>
          <div className="stat-value" style={{ color: '#9B2626', fontSize: 22 }}>${overdue.toLocaleString()}</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, overflowX: 'auto', paddingBottom: 2, scrollbarWidth: 'none' }}>
        {['All', 'Pending', 'Paid', 'Overdue'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            flexShrink: 0, padding: '9px 16px', borderRadius: 20, fontSize: 13, minHeight: 40,
            background: statusFilter === s ? 'var(--sage)' : 'white',
            color: statusFilter === s ? 'white' : 'var(--ink)',
            border: statusFilter === s ? 'none' : '0.5px solid var(--border-med)',
            cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
          }}>{s}</button>
        ))}
      </div>

      <div className="panel">
        {filtered.length === 0
          ? <EmptyState icon="💰" title="No invoices here" sub="Tap + to create your first invoice." />
          : filtered.map(inv => (
            <div key={inv.id} className="list-row" onClick={() => setModal({ type: 'detail', invoice: inv })}>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ fontSize: 14 }}>{inv.address}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{inv.realtor} · Due {inv.dueDate}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>${inv.amount.toLocaleString()}</div>
                <Badge status={inv.status} />
              </div>
            </div>
          ))
        }
      </div>

      {/* New */}
      <Modal open={modal?.type === 'new'} onClose={() => setModal(null)} title="New Invoice">
        <InvoiceForm realtors={realtors} jobs={jobs} onSave={inv => { addInvoice(inv); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>

      {/* Edit */}
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Invoice">
        <InvoiceForm invoice={modal?.invoice} realtors={realtors} jobs={jobs}
          onSave={inv => { updateInvoice(inv.id, inv); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>

      {/* Detail */}
      <Modal open={modal?.type === 'detail'} onClose={() => setModal(null)} title={`INV-${String(modal?.invoice?.id || '').padStart(4, '0')}`}>
        {modal?.invoice && (() => {
          const inv = modal.invoice
          const job = jobs.find(j => j.id === inv.jobId)
          return (
            <div>
              <div style={{ background: 'var(--cream)', borderRadius: 'var(--radius-md)', padding: 16, marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.07em', color: 'var(--muted)', marginBottom: 4 }}>Billed to</div>
                    <div style={{ fontWeight: 500, fontSize: 15 }}>{inv.realtor}</div>
                    <div style={{ fontSize: 13, color: 'var(--muted)' }}>{inv.address}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 26, color: 'var(--sage)' }}>${inv.amount.toLocaleString()}</div>
                    <Badge status={inv.status} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 12 }}>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Invoice Date</div><div style={{ fontSize: 13 }}>{inv.date}</div></div>
                  <div><div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>Due Date</div><div style={{ fontSize: 13 }}>{inv.dueDate}</div></div>
                </div>
              </div>
              {inv.notes && <div style={{ fontSize: 14, color: 'var(--ink-mid)', marginBottom: 16, padding: '10px 14px', background: 'var(--sage-light)', borderRadius: 'var(--radius-sm)', lineHeight: 1.6 }}>{inv.notes}</div>}
              <div className="modal-actions">
                {inv.status !== 'Paid' && <button className="btn btn-primary btn-full" onClick={() => { updateInvoice(inv.id, { status: 'Paid' }); setModal(null) }}>✓ Mark as Paid</button>}
                <button className="btn btn-secondary btn-full" onClick={() => generateInvoicePDF(inv, job)}>📄 Export Invoice PDF</button>
                <button className="btn btn-secondary btn-full" onClick={() => setModal({ type: 'edit', invoice: inv })}>Edit</button>
                <button className="btn btn-danger btn-full" onClick={() => setConfirmDelete(inv)}>Delete</button>
              </div>
            </div>
          )
        })()}
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Invoice?"
        message={`Delete invoice for ${confirmDelete?.address}?`}
        onConfirm={() => { deleteInvoice(confirmDelete.id); setConfirmDelete(null); setModal(null) }}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  )
}
