import { useState, useEffect } from 'react'
import './index.css'
import { useAppState } from './useStorage'
import Dashboard from './Dashboard'
import Jobs from './Jobs'
import Realtors from './Realtors'
import Inventory from './Inventory'
import Finance from './Finance'

const NAV = [
  { id: 'dashboard', label: 'Home', icon: <svg viewBox="0 0 22 22" fill="none"><path d="M3 9.5L11 3l8 6.5V19a1 1 0 01-1 1H14v-5h-4v5H4a1 1 0 01-1-1V9.5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg> },
  { id: 'jobs', label: 'Jobs', icon: <svg viewBox="0 0 22 22" fill="none"><rect x="3" y="5" width="16" height="14" rx="2" stroke="currentColor" strokeWidth="1.6"/><path d="M7 5V4a2 2 0 014 0v1M8 11h6M8 14h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: 'realtors', label: 'Realtors', icon: <svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.6"/><path d="M4 19c0-3.866 3.134-7 7-7h.5c3.866 0 7 3.134 7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: 'inventory', label: 'Items', icon: <svg viewBox="0 0 22 22" fill="none"><rect x="3" y="7" width="16" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6"/><path d="M8 7V5.5A2.5 2.5 0 0111 3v0a2.5 2.5 0 012.5 2.5V7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/><path d="M7 13h8M11 10v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { id: 'finance', label: 'Finance', icon: <svg viewBox="0 0 22 22" fill="none"><circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.6"/><path d="M11 6.5v9M8.5 8.5h3.25a2 2 0 010 4H9a2 2 0 000 4H13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
]

export default function App() {
  const [view, setView] = useState('dashboard')
  const [openJobId, setOpenJobId] = useState(null)
  const [fabTrigger, setFabTrigger] = useState(0)
  const state = useAppState()

  const navigate = (v, id) => {
    setView(v)
    if (id) setOpenJobId(id)
  }

  return (
    <div className="app-shell">

      {/* Desktop sidebar */}
      <aside className="sidebar">
        <div style={{ padding: '22px 20px 18px', borderBottom: '0.5px solid var(--border)' }}>
          <div style={{ width: 32, height: 32, background: 'var(--sage)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" fill="white"/></svg>
          </div>
          <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: 16, color: 'var(--ink)' }}>StageFlow</div>
          <div style={{ fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>Home Staging CRM</div>
        </div>
        <nav style={{ padding: '14px 10px', flex: 1 }}>
          {[['Overview', [NAV[0]]], ['Work', [NAV[1], NAV[2]]], ['Resources', [NAV[3], NAV[4]]]].map(([section, items]) => (
            <div key={section}>
              <div style={{ fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 8px', marginBottom: 6, marginTop: section === 'Overview' ? 0 : 14 }}>{section}</div>
              {items.map(item => (
                <button key={item.id} onClick={() => setView(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px',
                  borderRadius: 8, width: '100%', fontSize: 13.5, fontFamily: 'DM Sans, sans-serif',
                  background: view === item.id ? 'var(--sage-light)' : 'transparent',
                  color: view === item.id ? 'var(--sage-dark)' : 'var(--muted)',
                  fontWeight: view === item.id ? 500 : 400,
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s', marginBottom: 2, textAlign: 'left',
                }}>
                  <span style={{ width: 15, height: 15, display: 'flex' }}>{item.icon}</span>
                  {item.label === 'Home' ? 'Dashboard' : item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>
        <div style={{ padding: '14px 18px', borderTop: '0.5px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--sage-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 500, color: 'var(--sage-dark)' }}>YN</div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 500, color: 'var(--ink)' }}>Your Business</div>
              <div style={{ fontSize: 11, color: 'var(--muted)' }}>Owner</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content">
        {/* Mobile logo bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, paddingBottom: 16, borderBottom: '0.5px solid var(--border)' }} className="mobile-logo">
          <div style={{ width: 28, height: 28, background: 'var(--sage)', borderRadius: 7, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" fill="white"/></svg>
          </div>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: 18, color: 'var(--ink)' }}>StageFlow</span>
        </div>

        {view === 'dashboard' && <Dashboard jobs={state.jobs} realtors={state.realtors} inventory={state.inventory} invoices={state.invoices} onNav={navigate} fabTrigger={fabTrigger} />}
        {view === 'jobs' && <Jobs jobs={state.jobs} realtors={state.realtors} addJob={state.addJob} updateJob={state.updateJob} deleteJob={state.deleteJob} openJobId={openJobId} onClearOpen={() => setOpenJobId(null)} fabTrigger={fabTrigger} />}
        {view === 'realtors' && <Realtors realtors={state.realtors} jobs={state.jobs} addRealtor={state.addRealtor} updateRealtor={state.updateRealtor} deleteRealtor={state.deleteRealtor} fabTrigger={fabTrigger} />}
        {view === 'inventory' && <Inventory inventory={state.inventory} addInventoryItem={state.addInventoryItem} updateInventoryItem={state.updateInventoryItem} deleteInventoryItem={state.deleteInventoryItem} fabTrigger={fabTrigger} />}
        {view === 'finance' && <Finance invoices={state.invoices} realtors={state.realtors} jobs={state.jobs} addInvoice={state.addInvoice} updateInvoice={state.updateInvoice} deleteInvoice={state.deleteInvoice} fabTrigger={fabTrigger} />}
      </main>

      {/* Mobile bottom nav */}
      <nav className="bottom-nav">
        {NAV.map(item => (
          <button key={item.id} className={`bottom-nav-item${view === item.id ? ' active' : ''}`} onClick={() => setView(item.id)}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </nav>

      {/* Floating Action Button */}
      <button className="bottom-nav-fab" onClick={() => setFabTrigger(t => t + 1)} aria-label="Add new">
        +
      </button>
    </div>
  )
}
