"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { type AuthSession, authService } from "@/lib/auth-service"
import { createBrowserClient } from "@/lib/supabase/client"

interface AuthContextType {
  session: AuthSession | null
  isLoading: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthenticated: boolean
  isAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const currentSession = authService.getCurrentSession()
    setSession(currentSession)
    setIsLoading(false)
  }, [])

  const login = async (username: string, password: string) => {
    const newSession = await authService.login(username, password)
    setSession(newSession)
  }

  const logout = async () => {
    const supabase = createBrowserClient();
    await supabase.auth.signOut();
    setSession(null);
  }

  const value: AuthContextType = {
    session,
    isLoading,
    login,
    logout,
    isAuthenticated: !!session && new Date(session.expiresAt) > new Date(),
    isAdmin: session?.user.role === "admin" || false,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
