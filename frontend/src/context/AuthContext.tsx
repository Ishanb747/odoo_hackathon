/**
 * context/AuthContext.tsx — Phase 1 (Dev)
 * React context for authentication state.
 * Hydrates from localStorage on mount; exposes login/logout/user.
 */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  apiFetchMe,
  apiLogin,
  apiSignup,
  clearStoredToken,
  getStoredToken,
  setStoredToken,
  type UserOut,
} from '../api/auth'

// ── Context shape ─────────────────────────────────────────────

interface AuthContextValue {
  user: UserOut | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserOut | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const token = getStoredToken()
    if (!token) {
      setIsLoading(false)
      return
    }
    apiFetchMe(token)
      .then(setUser)
      .catch(() => clearStoredToken())   // token expired / invalid
      .finally(() => setIsLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password)
    setStoredToken(res.access_token)
    setUser(res.user)
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    const res = await apiSignup(name, email, password)
    setStoredToken(res.access_token)
    setUser(res.user)
  }, [])

  const logout = useCallback(() => {
    clearStoredToken()
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: user !== null,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
