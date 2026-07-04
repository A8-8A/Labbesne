import { createContext, useContext, useState } from 'react'
import { api } from '../api/client.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('labbesne_user')
    return raw ? JSON.parse(raw) : null
  })

  function store(auth) {
    localStorage.setItem('labbesne_token', auth.token)
    const u = { id: auth.userId, name: auth.name, email: auth.email, role: auth.role }
    localStorage.setItem('labbesne_user', JSON.stringify(u))
    setUser(u)
    return u
  }

  return (
    <AuthContext.Provider value={{
      user,
      login: async (email, password) => store(await api.post('/api/auth/login', { email, password })),
      register: async (payload) => store(await api.post('/api/auth/register', payload)),
      logout: () => { localStorage.removeItem('labbesne_token'); localStorage.removeItem('labbesne_user'); setUser(null) },
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
