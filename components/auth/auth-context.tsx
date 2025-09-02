// components/auth/auth-context.tsx
"use client"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { type User } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isRoleLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  isAdmin: boolean
  userRole: string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRoleLoading, setIsRoleLoading] = useState(true)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const supabase = createBrowserClient()

  // Function to fetch user role from users table
  const fetchUserRole = useCallback(async (email: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('email', email)
        .single()
      
      if (error) {
        console.error("Error fetching user role:", error)
        return null
      }
      
      return data?.role || null
    } catch (err) {
      console.error("Exception while fetching user role:", err)
      return null
    }
  }, [supabase])

  // Function to handle user session and fetch role
  const handleUserSession = useCallback(async (sessionUser: User | null) => {
    setUser(sessionUser)
    
    if (sessionUser?.email) {
      setIsRoleLoading(true)
      
      // Check if we have a cached role in localStorage first
      const cachedRole = localStorage.getItem(`userRole_${sessionUser.email}`)
      if (cachedRole) {
        setUserRole(cachedRole)
        setIsAdmin(cachedRole === "admin")
        setIsRoleLoading(false)
        console.log("Using cached role from localStorage:", cachedRole)
      }
      
      // Always fetch fresh role from database (but don't wait for it to render)
      fetchUserRole(sessionUser.email).then(role => {
        if (role) {
          setUserRole(role)
          setIsAdmin(role === "admin")
          // Cache the role in localStorage for future use
          localStorage.setItem(`userRole_${sessionUser.email}`, role)
          console.log("Fresh role fetched from database:", role)
        }
        setIsRoleLoading(false)
      }).catch(err => {
        console.error("Error fetching fresh role:", err)
        setIsRoleLoading(false)
      })
      
    } else {
      setUserRole(null)
      setIsAdmin(false)
      setIsRoleLoading(false)
      console.log("No user, signed out or session expired")
    }
    
    setIsLoading(false)
  }, [fetchUserRole])

  useEffect(() => {
    let isMounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (isMounted) {
          await handleUserSession(session?.user ?? null)
        }
      } catch (error) {
        console.error("Error getting initial session:", error)
        if (isMounted) {
          setIsLoading(false)
          setIsRoleLoading(false)
        }
      }
    }
    
    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event)
        if (isMounted) {
          await handleUserSession(session?.user ?? null)
        }
      }
    )

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [supabase.auth, handleUserSession])

  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) {
      throw error
    }
  }

  const logout = async () => {
    // Clear cached role from localStorage on logout
    if (user?.email) {
      localStorage.removeItem(`userRole_${user.email}`)
    }
    
    const { error } = await supabase.auth.signOut()
    if (error) {
      throw error
    }
    
    setUserRole(null)
    setIsAdmin(false)
    setIsRoleLoading(false)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isRoleLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin,
    userRole,
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