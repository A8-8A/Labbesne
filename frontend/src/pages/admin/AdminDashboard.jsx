import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'

const TABS = ['Overview', 'Pending stores', 'Reports', 'Users', 'Audit log']

export default function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0])
  const [stats, setStats] = useState(null)
  const [pending, setPending] = useState([])
  const [reports, setReports] = useState([])
  const [users, setUsers] = useState([])
  const [log, setLog] = useState([])
  const [error, setError] = useState('')

  async function load() {
    try {
      const [st, pe, re, us, lo] = await Promise.all([
        api.get('/api/admin/dashboard'),
        api.get('/api/admin/stores?status=PENDING'),
        api.get('/api/admin/reports?status=OPEN'),
        api.get('/api/admin/users'),
        api.get('/api/admin/audit-log'),
      ])
      setStats(st); setPending(pe); setReports(re); setUsers(us); setLog(lo)
    } catch (e) { setError(e.message) }
  }
  useEffect(() => { load() }, [])

  const storeAction = (id, status) => api.patch(`/api/admin/stores/${id}`, { status, reason: 'Admin review' }).then(load).catch(e => setError(e.message))
  const reportAction = (id, status) => api.patch(`/api/admin/reports/${id}`, { status }).then(load).catch(e => setError(e.message))
  const userAction = (id, status) => api.patch(`/api/admin/users/${id}`, { status, reason: 'Admin action' }).then(load).catch(e => setError(e.message))

  return (
    <main className="container" style={{ paddingBottom: 60 }}>
      <h1 className="section-title">Admin</h1>
      <div className="row" style={{ margin: '12px 0 20px' }}>
        {TABS.map(t => (
          <button key={t} className={`btn sm ${tab === t ? '' : 'ghost'}`} onClick={() => setTab(t)}>{t}</button>
        ))}
      </div>
      {error && <p className="error">{error}</p>}

      {tab === 'Overview' && stats && (
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))' }}>
          {Object.entries({
            'Total users': stats.totalUsers, 'Customers': stats.totalCustomers,
            'Store owners': stats.totalOwners, 'Stores': stats.totalStores,
            'Pending stores': stats.pendingStores, 'Open reports': stats.openReports,
          }).map(([k, v]) => (
            <div key={k} className="card" style={{ padding: 18 }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 34, fontWeight: 600 }}>{v}</div>
              <div className="muted" style={{ fontSize: 13.5 }}>{k}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'Pending stores' && (
        <table>
          <thead><tr><th>Store</th><th>Owner address</th><th>Contact</th><th>Actions</th></tr></thead>
          <tbody>
            {pending.map(s => (
              <tr key={s.id}>
                <td><strong>{s.name}</strong><div className="muted" style={{ fontSize: 13 }}>{s.categories}</div></td>
                <td>{s.address}</td>
                <td>{s.phone || s.whatsapp}</td>
                <td className="row">
                  <button className="btn sm" onClick={() => storeAction(s.id, 'APPROVED')}>Approve</button>
                  <button className="btn danger sm" onClick={() => storeAction(s.id, 'REJECTED')}>Reject</button>
                </td>
              </tr>
            ))}
            {!pending.length && <tr><td colSpan={4} className="muted">No stores waiting for review.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'Reports' && (
        <table>
          <thead><tr><th>Target</th><th>Reason</th><th>Reporter</th><th>Details</th><th>Actions</th></tr></thead>
          <tbody>
            {reports.map(r => (
              <tr key={r.id}>
                <td>{r.targetType} #{r.targetId}</td>
                <td>{r.reason}</td>
                <td>{r.reporterName}</td>
                <td className="muted" style={{ maxWidth: 240 }}>{r.description}</td>
                <td className="row">
                  <button className="btn sm" onClick={() => reportAction(r.id, 'RESOLVED')}>Resolve</button>
                  <button className="btn ghost sm" onClick={() => reportAction(r.id, 'DISMISSED')}>Dismiss</button>
                </td>
              </tr>
            ))}
            {!reports.length && <tr><td colSpan={5} className="muted">No open reports.</td></tr>}
          </tbody>
        </table>
      )}

      {tab === 'Users' && (
        <table>
          <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
                <td><span className={`badge ${u.status}`}>{u.status}</span></td>
                <td className="row">
                  {u.status === 'ACTIVE'
                    ? <><button className="btn ghost sm" onClick={() => userAction(u.id, 'SUSPENDED')}>Suspend</button>
                        <button className="btn danger sm" onClick={() => userAction(u.id, 'BANNED')}>Ban</button></>
                    : <button className="btn sm" onClick={() => userAction(u.id, 'ACTIVE')}>Reactivate</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {tab === 'Audit log' && (
        <table>
          <thead><tr><th>Admin</th><th>Action</th><th>Target</th><th>Reason</th><th>Date</th></tr></thead>
          <tbody>
            {log.map(a => (
              <tr key={a.id}>
                <td>{a.adminName}</td><td>{a.actionType}</td>
                <td>{a.targetType} #{a.targetId}</td>
                <td className="muted">{a.reason}</td>
                <td className="muted">{new Date(a.createdAt).toLocaleString()}</td>
              </tr>
            ))}
            {!log.length && <tr><td colSpan={5} className="muted">No actions logged yet.</td></tr>}
          </tbody>
        </table>
      )}
    </main>
  )
}
