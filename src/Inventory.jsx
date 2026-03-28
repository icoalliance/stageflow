import { useState, useEffect } from 'react'
import { Modal, AIBox, EmptyState, ConfirmDialog, PageHeader } from './components'
import { useAIPrompt } from './useAIPrompt'

const CATEGORIES = ['Furniture', 'Decor', 'Lighting', 'Textiles', 'Art', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Needs Repair']
const COND_COLOR = { Excellent: 'var(--sage)', Good: '#5F8A60', Fair: 'var(--clay)', 'Needs Repair': '#9B2626' }

function ItemForm({ item, onSave, onCancel }) {
  const [form, setForm] = useState({ name: '', category: 'Furniture', qty: 1, condition: 'Excellent', location: '', notes: '', ...(item || {}) })
  const { prompt, loading, fetchPrompt } = useAIPrompt()
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.name.trim()) return alert('Please enter an item name.')
    onSave(form)
    fetchPrompt(form, 'inventory')
  }

  return (
    <div>
      <div className="form-group">
        <label className="form-label">Item Name *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Gray Linen Sofa" />
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Category</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Quantity</label>
          <input className="form-input" type="number" min="0" value={form.qty} onChange={e => set('qty', parseInt(e.target.value) || 0)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Condition</label>
          <select className="form-select" value={form.condition} onChange={e => set('condition', e.target.value)}>
            {CONDITIONS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Location</label>
          <input className="form-input" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Storage Unit A" />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" style={{ minHeight: 70 }} value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Dimensions, color, care notes…" />
      </div>
      <AIBox prompt={prompt} loading={loading} />
      <div className="modal-actions">
        <button className="btn btn-primary btn-full" onClick={handleSave}>{item ? 'Save Changes' : 'Add Item'}</button>
        <button className="btn btn-secondary btn-full" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  )
}

export default function Inventory({ inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem, fabTrigger }) {
  const [search, setSearch] = useState('')
  const [catFilter, setCatFilter] = useState('All')
  const [modal, setModal] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  useEffect(() => {
    if (fabTrigger > 0) setModal({ type: 'new' })
  }, [fabTrigger])

  const filtered = inventory.filter(item => {
    const q = search.toLowerCase()
    const matchSearch = !q || item.name.toLowerCase().includes(q) || item.location?.toLowerCase().includes(q)
    const matchCat = catFilter === 'All' || item.category === catFilter
    return matchSearch && matchCat
  })

  // Category tab counts
  const cats = ['All', ...CATEGORIES]

  return (
    <div>
      <PageHeader title="Inventory" subtitle="All your staging items"
        action={<button className="btn btn-primary btn-sm" onClick={() => setModal({ type: 'new' })}>+ Add</button>} />

      {/* Category pills — scrollable */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4, marginBottom: 14, scrollbarWidth: 'none' }}>
        {cats.map(cat => {
          const count = cat === 'All' ? inventory.length : inventory.filter(i => i.category === cat).length
          const active = catFilter === cat
          return (
            <button key={cat} onClick={() => setCatFilter(cat)} style={{
              flexShrink: 0, padding: '8px 14px', borderRadius: 20, fontSize: 13,
              background: active ? 'var(--sage)' : 'white',
              color: active ? 'white' : 'var(--ink)',
              border: active ? 'none' : '0.5px solid var(--border-med)',
              cursor: 'pointer', fontFamily: 'DM Sans, sans-serif',
              display: 'flex', alignItems: 'center', gap: 5, minHeight: 36,
            }}>
              {cat}
              <span style={{ fontSize: 11, opacity: 0.75, background: active ? 'rgba(255,255,255,0.25)' : 'var(--cream)', borderRadius: 10, padding: '1px 6px' }}>{count}</span>
            </button>
          )
        })}
      </div>

      <input className="form-input" style={{ marginBottom: 14 }} placeholder="Search items…" value={search} onChange={e => setSearch(e.target.value)} />

      <div className="panel">
        {filtered.length === 0
          ? <EmptyState icon="🪑" title="No items found" sub={search ? 'Try adjusting your search.' : 'Tap + to add your first item.'} />
          : filtered.map(item => (
            <div key={item.id} className="list-row" onClick={() => setModal({ type: 'edit', item })}>
              <div style={{ width: 44, height: 44, background: 'var(--cream)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {item.category === 'Furniture' ? '🛋️' : item.category === 'Lighting' ? '💡' : item.category === 'Art' ? '🖼️' : item.category === 'Textiles' ? '🧶' : item.category === 'Decor' ? '🌿' : '📦'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium" style={{ fontSize: 14 }}>{item.name}</div>
                <div className="text-xs" style={{ marginTop: 2, color: COND_COLOR[item.condition] || 'var(--muted)' }}>
                  {item.condition} · {item.location || 'No location'}
                </div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 500, color: item.qty === 0 ? '#9B2626' : 'var(--ink)' }}>{item.qty}</div>
                <div className="text-xs text-muted">{item.category}</div>
              </div>
            </div>
          ))
        }
      </div>

      <Modal open={modal?.type === 'new'} onClose={() => setModal(null)} title="Add Item">
        <ItemForm onSave={item => { addInventoryItem(item); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>
      <Modal open={modal?.type === 'edit'} onClose={() => setModal(null)} title="Edit Item">
        <ItemForm item={modal?.item} onSave={item => { updateInventoryItem(item.id, item); setModal(null) }} onCancel={() => setModal(null)} />
      </Modal>

      <ConfirmDialog open={!!confirmDelete} title="Delete Item?"
        message={`Remove "${confirmDelete?.name}" from inventory?`}
        onConfirm={() => { deleteInventoryItem(confirmDelete.id); setConfirmDelete(null) }}
        onCancel={() => setConfirmDelete(null)} />
    </div>
  )
}
