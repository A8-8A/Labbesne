import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext.jsx'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'CUSTOMER' })
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const { login, register } = useAuth()
  const nav = useNavigate()

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError(''); setBusy(true)
    try {
      const u = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form)
      nav(u.role === 'OWNER' ? '/owner/dashboard' : u.role === 'ADMIN' ? '/admin/dashboard' : '/')
    } catch (err) { setError(err.message) } finally { setBusy(false) }
  }

  return (
    <main className="container" style={{ maxWidth: 460, paddingTop: 50, paddingBottom: 70 }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ padding: 28 }}>
        <h1 style={{ fontSize: 30 }}>{mode === 'login' ? 'Welcome back' : 'Join Labbesne'}</h1>
        <hr className="stitch" />
        <form onSubmit={submit}>
          {mode === 'register' && <>
            <div className="field"><label>Name</label><input required value={form.name} onChange={set('name')} /></div>
            <div className="field"><label>Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+961 …" /></div>
            <div className="field">
              <label>I am a</label>
              <select value={form.role} onChange={set('role')}>
                <option value="CUSTOMER">Customer — I want to shop</option>
                <option value="OWNER">Store owner — I want to sell</option>
              </select>
            </div>
          </>}
          <div className="field"><label>Email</label><input type="email" required value={form.email} onChange={set('email')} /></div>
          <div className="field"><label>Password</label><input type="password" required minLength={8} value={form.password} onChange={set('password')} /></div>
          <button className="btn" disabled={busy} style={{ width: '100%', justifyContent: 'center' }}>
            {busy ? 'One moment…' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
          {error && <div className="error">{error}</div>}
        </form>
        <p className="muted" style={{ marginTop: 16, fontSize: 14.5 }}>
          {mode === 'login' ? 'New here? ' : 'Already have an account? '}
          <button className="btn ghost sm" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Sign in'}
          </button>
        </p>
      </motion.div>
    </main>
  )
}
