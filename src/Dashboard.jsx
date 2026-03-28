import { useEffect, useState } from 'react'
import { StatusDot, Badge, Modal } from './components'
import Jobs from './Jobs'

export default function Dashboard({ jobs, realtors, inventory, invoices, onNav, fabTrigger }) {
  const [showNewJob, setShowNewJob] = useState(false)

  useEffect(() => {
    if (fabTrigger > 0) setShowNewJob(true)
  }, [fabTrigger])

  const active = jobs.filter(j => j.status === 'Active').length
  const scheduled = jobs.filter(j => j.status === 'Scheduled').length
  const revenue = invoices.filter(i => i.status === 'Paid').reduce((a, b) => a + b.amount, 0)
  const pendingAmt = invoices.filter(i => i.status !== 'Paid').reduce((a, b) => a + b.amount, 0)
  const overdue = invoices.filter(i => i.status === 'Overdue')

  const today = new Date()
  const hour = today.getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22 }}>{greeting} ✦</h1>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 3 }}>Your staging business at a glance</p>
      </div>

      {overdue.length > 0 && (
        <div onClick={() => onNav('finance')} style={{ background: '#FDECEC', border: '0.5px solid rgba(155,38,38,0.2)', borderRadius: 'var(--radius-md)', padding: '12px 14px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500, color: '#9B2626' }}>{overdue.length} overdue invoice{overdue.length > 1 ? 's' : ''}</div>
              <div style={{ fontSize: 12, color: '#9B2626', opacity: 0.75 }}>Tap to view →</div>
            </div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card accent">
          <div className="stat-label">Active Jobs</div>
          <div className="stat-value">{active}</div>
          <div className="stat-sub">{scheduled} scheduled</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Revenue</div>
          <div className="stat-value" style={{ fontSize: 22 }}>${revenue.toLocaleString()}</div>
          <div className="stat-sub" style={{ color: pendingAmt > 0 ? 'var(--clay)' : 'var(--muted)' }}>${pendingAmt.toLocaleString()} pending</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Realtors</div>
          <div className="stat-value">{realtors.length}</div>
          <div className="stat-sub">in network</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Items</div>
          <div className="stat-value">{inventory.length}</div>
          <div className="stat-sub">in inventory</div>
        </div>
      </div>

      {/* Recent jobs */}
      <div className="panel" style={{ marginBottom: 14 }}>
        <div className="panel-header">
          <span className="panel-title">Recent Jobs</span>
          <button className="panel-link" onClick={() => onNav('jobs')}>View all →</button>
        </div>
        {jobs.length === 0
          ? <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>No jobs yet</div>
          : jobs.slice(0, 4).map(job => (
            <div key={job.id} className="list-row" onClick={() => onNav('jobs', job.id)}>
              <StatusDot status={job.status} />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ fontSize: 14 }}>{job.address}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{job.realtor} · {job.city}</div>
              </div>
              <Badge status={job.status} />
            </div>
          ))
        }
      </div>

      {/* Outstanding invoices */}
      <div className="panel">
        <div className="panel-header">
          <span className="panel-title">Outstanding Invoices</span>
          <button className="panel-link" onClick={() => onNav('finance')}>View all →</button>
        </div>
        {invoices.filter(i => i.status !== 'Paid').length === 0
          ? <div style={{ padding: '20px 16px', textAlign: 'center', color: 'var(--muted)', fontSize: 13 }}>All paid ✓</div>
          : invoices.filter(i => i.status !== 'Paid').slice(0, 4).map(inv => (
            <div key={inv.id} className="list-row" onClick={() => onNav('finance')}>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate" style={{ fontSize: 14 }}>{inv.address.split(' ').slice(0, 3).join(' ')}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>{inv.realtor} · Due {inv.dueDate}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 500 }}>${inv.amount.toLocaleString()}</div>
                <Badge status={inv.status} />
              </div>
            </div>
          ))
        }
      </div>

      {/* FAB opens new job */}
      {showNewJob && (
        <Jobs
          jobs={jobs} realtors={realtors}
          addJob={() => {}} updateJob={() => {}} deleteJob={() => {}}
          openJobId={null} onClearOpen={() => {}}
          fabTrigger={1}
          onClose={() => setShowNewJob(false)}
          standalone
        />
      )}
    </div>
  )
}
