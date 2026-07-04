import { useState } from 'react'
import { api } from '../api/client.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useNavigate } from 'react-router-dom'

const REASONS = ['Fake product', 'Wrong price', 'Misleading images', 'Offensive behavior',
  'Scam attempt', 'Store not responding', 'Product unavailable', 'Harassment', 'Other']

export default function ReportButton({ targetType, targetId }) {
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState(REASONS[0])
  const [description, setDescription] = useState('')
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const nav = useNavigate()

  async function submit() {
    try {
      await api.post('/api/reports', { targetType, targetId, reason, description })
      setDone(true)
    } catch (e) { setError(e.message) }
  }

  if (done) return <span className="badge OPEN">Report submitted</span>
  if (!open) return (
    <button className="btn ghost sm" onClick={() => user ? setOpen(true) : nav('/login')}>
      Report
    </button>
  )
  return (
    <div className="card" style={{ padding: 16, marginTop: 12, maxWidth: 420 }}>
      <div className="field">
        <label>Reason</label>
        <select value={reason} onChange={e => setReason(e.target.value)}>
          {REASONS.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>
      <div className="field">
        <label>Details (optional)</label>
        <textarea rows={3} value={description} onChange={e => setDescription(e.target.value)} />
      </div>
      <div className="row">
        <button className="btn sm danger" onClick={submit}>Send report</button>
        <button className="btn ghost sm" onClick={() => setOpen(false)}>Cancel</button>
      </div>
      {error && <div className="error">{error}</div>}
    </div>
  )
}
