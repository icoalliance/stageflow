import { useState, useEffect } from 'react'

const SEED = {
  jobs: [
    { id: 1, address: '142 Willow Creek Dr', city: 'Naperville', state: 'IL', realtor: 'Sarah Chen', status: 'Active', date: '2025-03-22', items: ['Sofa (gray linen)', 'Floor lamp x2', 'Coffee table', 'Abstract art print'], notes: 'Buyers loved the living room arrangement. Open house next Saturday.', photos: [], invoiceId: 1 },
    { id: 2, address: '87 Elmwood Terrace', city: 'Winnetka', state: 'IL', realtor: 'Marcus Webb', status: 'Scheduled', date: '2025-03-30', items: ['Dining table set', 'Entry console', 'Throw pillows x6'], notes: '', photos: [], invoiceId: 2 },
    { id: 3, address: '319 Birchwood Ln', city: 'Hinsdale', state: 'IL', realtor: 'Amanda Torres', status: 'Active', date: '2025-03-18', items: ['King bed frame', 'Nightstands x2', 'Dresser', 'Mirror'], notes: 'Pending open house this weekend. Realtor requested extra plants.', photos: [], invoiceId: 3 },
    { id: 4, address: '55 Maple Ridge Rd', city: 'Wheaton', state: 'IL', realtor: 'James Park', status: 'Complete', date: '2025-03-05', items: ['Sofa', 'Rug 8x10', 'Accent chairs x2', 'Side tables'], notes: 'Sold in 6 days on market! Realtor very happy.', photos: [], invoiceId: 4 },
    { id: 5, address: '210 Oak Hill Blvd', city: 'Downers Grove', state: 'IL', realtor: 'Sarah Chen', status: 'Under Review', date: '2025-04-05', items: [], notes: 'Initial walkthrough scheduled. 4BR colonial needs full staging.', photos: [], invoiceId: 5 },
  ],
  realtors: [
    { id: 1, name: 'Sarah Chen', agency: 'Coldwell Banker', phone: '(312) 555-0184', email: 'sarah.chen@cbprime.com', notes: 'Prefers modern/minimalist staging. Refers frequently.', color: 'sage' },
    { id: 2, name: 'Marcus Webb', agency: 'Compass Realty', phone: '(630) 555-0221', email: 'm.webb@compass.com', notes: 'Works luxury market. Likes bold accent pieces.', color: 'clay' },
    { id: 3, name: 'Amanda Torres', agency: 'Keller Williams', phone: '(847) 555-0093', email: 'amanda.t@kw.com', notes: 'Quick turnarounds needed. Very communicative.', color: 'amber' },
    { id: 4, name: 'James Park', agency: 'RE/MAX Elite', phone: '(708) 555-0347', email: 'j.park@remax.com', notes: '', color: 'blue' },
    { id: 5, name: 'Diane Russo', agency: 'Baird & Warner', phone: '(630) 555-0162', email: 'd.russo@bairdwarner.com', notes: 'New referral. First job pending.', color: 'purple' },
  ],
  inventory: [
    { id: 1, name: 'Gray Linen Sofa', category: 'Furniture', qty: 2, condition: 'Excellent', location: 'Storage Unit A', notes: '' },
    { id: 2, name: 'Marble Coffee Table', category: 'Furniture', qty: 1, condition: 'Good', location: 'Storage Unit A', notes: 'Minor scratch on underside' },
    { id: 3, name: 'Arc Floor Lamp', category: 'Lighting', qty: 3, condition: 'Excellent', location: 'Storage Unit B', notes: '' },
    { id: 4, name: 'Abstract Canvas Print', category: 'Art', qty: 4, condition: 'Excellent', location: 'Storage Unit A', notes: '24x36 inches' },
    { id: 5, name: 'Faux Fur Throw', category: 'Textiles', qty: 6, condition: 'Good', location: 'Storage Unit B', notes: '' },
    { id: 6, name: 'Entry Console Table', category: 'Furniture', qty: 2, condition: 'Excellent', location: 'Storage Unit A', notes: '' },
    { id: 7, name: 'Succulent Arrangement', category: 'Decor', qty: 5, condition: 'Good', location: 'Home', notes: 'Refresh monthly' },
    { id: 8, name: 'Woven Area Rug 8x10', category: 'Textiles', qty: 2, condition: 'Excellent', location: 'Storage Unit B', notes: '' },
    { id: 9, name: 'Pendant Light', category: 'Lighting', qty: 2, condition: 'Good', location: 'Storage Unit A', notes: '' },
    { id: 10, name: 'Accent Chairs (Velvet)', category: 'Furniture', qty: 4, condition: 'Excellent', location: 'Storage Unit B', notes: 'Dusty rose color' },
  ],
  invoices: [
    { id: 1, jobId: 1, address: '142 Willow Creek Dr', realtor: 'Sarah Chen', amount: 1400, status: 'Paid', date: '2025-03-24', dueDate: '2025-04-07', notes: 'Full staging — living room, dining, master bedroom' },
    { id: 2, jobId: 2, address: '87 Elmwood Terrace', realtor: 'Marcus Webb', amount: 950, status: 'Pending', date: '2025-04-01', dueDate: '2025-04-15', notes: 'Partial staging — dining room and entry' },
    { id: 3, jobId: 3, address: '319 Birchwood Ln', realtor: 'Amanda Torres', amount: 1800, status: 'Pending', date: '2025-04-01', dueDate: '2025-04-14', notes: 'Full staging — 3 bedrooms + common areas' },
    { id: 4, jobId: 4, address: '55 Maple Ridge Rd', realtor: 'James Park', amount: 1200, status: 'Paid', date: '2025-03-10', dueDate: '2025-03-24', notes: 'Living room + master suite' },
    { id: 5, jobId: 5, address: '210 Oak Hill Blvd', realtor: 'Sarah Chen', amount: 850, status: 'Overdue', date: '2025-03-15', dueDate: '2025-03-29', notes: 'Consultation + initial staging plan' },
  ],
}

function useStorage(key, fallback) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : fallback
    } catch { return fallback }
  })

  useEffect(() => {
    try { localStorage.setItem(key, JSON.stringify(value)) }
    catch (e) { console.warn('Storage error', e) }
  }, [key, value])

  return [value, setValue]
}

export function useAppState() {
  const [jobs, setJobs] = useStorage('sf_jobs', SEED.jobs)
  const [realtors, setRealtors] = useStorage('sf_realtors', SEED.realtors)
  const [inventory, setInventory] = useStorage('sf_inventory', SEED.inventory)
  const [invoices, setInvoices] = useStorage('sf_invoices', SEED.invoices)

  const nextId = (arr) => Math.max(0, ...arr.map(x => x.id)) + 1

  return {
    jobs, setJobs,
    realtors, setRealtors,
    inventory, setInventory,
    invoices, setInvoices,
    addJob: (job) => setJobs(prev => [{ ...job, id: nextId(prev) }, ...prev]),
    updateJob: (id, patch) => setJobs(prev => prev.map(j => j.id === id ? { ...j, ...patch } : j)),
    deleteJob: (id) => setJobs(prev => prev.filter(j => j.id !== id)),
    addRealtor: (r) => setRealtors(prev => [...prev, { ...r, id: nextId(prev) }]),
    updateRealtor: (id, patch) => setRealtors(prev => prev.map(r => r.id === id ? { ...r, ...patch } : r)),
    deleteRealtor: (id) => setRealtors(prev => prev.filter(r => r.id !== id)),
    addInventoryItem: (item) => setInventory(prev => [...prev, { ...item, id: nextId(prev) }]),
    updateInventoryItem: (id, patch) => setInventory(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i)),
    deleteInventoryItem: (id) => setInventory(prev => prev.filter(i => i.id !== id)),
    addInvoice: (inv) => setInvoices(prev => [{ ...inv, id: nextId(prev) }, ...prev]),
    updateInvoice: (id, patch) => setInvoices(prev => prev.map(i => i.id === id ? { ...i, ...patch } : i)),
    deleteInvoice: (id) => setInvoices(prev => prev.filter(i => i.id !== id)),
  }
}
