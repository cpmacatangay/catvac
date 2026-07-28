import { createContext, useState, useEffect, useCallback } from 'react'
import { api, setOnUnauthorized } from '../lib/api.js'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    setOnUnauthorized(() => { setUser(null); localStorage.removeItem('catvac_session') })
    let cancelled = false
    if (!localStorage.getItem('catvac_session')) {
      setIsLoading(false)
      return
    }
    api('/auth/me')
      .then((data) => { if (!cancelled) setUser(data.user) })
      .catch(() => { localStorage.removeItem('catvac_session') })
      .finally(() => { if (!cancelled) setIsLoading(false) })
    return () => { cancelled = true }
  }, [])

  const login = useCallback(async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('catvac_session', '1')
    setUser(data.user)
    return data.user
  }, [])

  const signup = useCallback(async (email, password) => {
    const data = await api('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
    localStorage.setItem('catvac_session', '1')
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    try {
      await api('/auth/logout', { method: 'POST' })
    } catch {
      // Clear local state regardless of server response
    }
    localStorage.removeItem('catvac_session')
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
