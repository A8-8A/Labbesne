import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function Navbar() {
  const [q, setQ] = useState('')
  const { user, logout } = useAuth()
  const nav = useNavigate()

  function submit(e) {
    e.preventDefault()
    if (q.trim()) nav(`/search?q=${encodeURIComponent(q.trim())}`)
  }

  return (
    <header className="nav">
      <div className="container nav-inner">
        <Link to="/" className="logo">kis<em>wa</em>.</Link>
        <form className="nav-search" onSubmit={submit}>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search products or stores…"
            aria-label="Search products or stores"
          />
        </form>
        <nav className="nav-links">
          {user?.role === 'OWNER' && <Link to="/owner/dashboard">My store</Link>}
          {user?.role === 'ADMIN' && <Link to="/admin/dashboard">Admin</Link>}
          {user?.role === 'CUSTOMER' && <Link to="/requests">Requests</Link>}
          {user
            ? <button className="btn ghost sm" onClick={() => { logout(); nav('/') }}>Sign out</button>
            : <Link to="/login" className="btn sm">Sign in</Link>}
        </nav>
      </div>
    </header>
  )
}
