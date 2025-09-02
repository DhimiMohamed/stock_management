// components/auth/protected-route.tsx
"use client"

import { useAuth } from "./auth-context"
import { SupabaseLoginForm } from "./supabase-login-form"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const { isAuthenticated, isAdmin, isLoading, isRoleLoading, user, userRole } = useAuth()

  console.log("ProtectedRoute state:", { 
    isLoading, 
    isRoleLoading,
    isAuthenticated, 
    isAdmin, 
    requireAdmin, 
    userEmail: user?.email,
    userRole 
  })

  // Show loading state while authentication OR role is being determined
  if (isLoading || (isAuthenticated && isRoleLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">
            {isRoleLoading ? "Vérification des permissions..." : "Chargement de l'authentification..."}
          </p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <SupabaseLoginForm />
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-2">Accès refusé</h1>
          <p className="text-muted-foreground">
            Vous n'avez pas les permissions d'administrateur nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Connecté en tant que: {user?.email} | Rôle: {userRole || "non défini"}
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}