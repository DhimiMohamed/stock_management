"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Settings, LogOut, ChevronDown } from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"

export function UserAccountMenu() {
  const { user, logout, isAdmin, userRole } = useAuth()

  if (!user) return null

  // Get display name - try email name part if no display name
  const getDisplayName = () => {
    if (user.user_metadata?.display_name) {
      return user.user_metadata.display_name
    }
    if (user.user_metadata?.full_name) {
      return user.user_metadata.full_name
    }
    // Fallback to email username part
    return user.email?.split('@')[0] || 'User'
  }

  const displayName = getDisplayName()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 h-auto p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground text-sm">
              {displayName.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-left hidden md:block">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{displayName}</span>
              {isAdmin && (
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              )}
              {userRole && userRole !== "admin" && (
                <Badge variant="outline" className="text-xs capitalize">
                  {userRole}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <ChevronDown className="h-4 w-4 hidden md:block" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profil</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Paramètres</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}