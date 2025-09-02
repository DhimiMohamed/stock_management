"use client"

import { useState, useMemo, useCallback } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
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
import {
  LayoutDashboard,
  Package,
  TrendingUp,
  Settings,
  Menu,
  BarChart3,
  PlusCircle,
  Tags,
  Users,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react"
import { useAuth } from "@/components/auth/auth-context"

// Define types
type NavigationItem = {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

type SidebarContentProps = {
  allNavigation: NavigationItem[]
  pathname: string
  onLinkClick: () => void
  user: any // Using the user object from Supabase auth
  isAdmin: boolean
  logout: () => void
}

// Move navigation arrays outside component to prevent recreation
const navigation: NavigationItem[] = [
  {
    name: "Tableau de Bord",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    name: "Gestion Stock",
    href: "/stock",
    icon: Package,
  },
  {
    name: "Catégories",
    href: "/categories",
    icon: Tags,
  },
  {
    name: "Analyse Financière",
    href: "/financial",
    icon: TrendingUp,
  },
  {
    name: "Saisie de Données",
    href: "/data-entry",
    icon: PlusCircle,
  },
  {
    name: "Rapports",
    href: "/reports",
    icon: BarChart3,
  },
]

const adminNavigation: NavigationItem[] = [
  {
    name: "Utilisateurs",
    href: "/users",
    icon: Users,
  },
]

// Extract SidebarContent as a separate component
function SidebarContent({ allNavigation, pathname, onLinkClick, user, isAdmin, logout }: SidebarContentProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>StockManager</span>
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-4">
        {allNavigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
              onClick={onLinkClick}
            >
              <item.icon className="h-4 w-4" />
              {item.name}
            </Link>
          )
        })}
      </nav>

      {user && (
        <div className="border-t p-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="w-full justify-start gap-3 h-auto p-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                    {user.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{user.email?.split('@')[0] || "Utilisateur"}</span>
                    {isAdmin && (
                      <Badge variant="secondary" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
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
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const { user, logout, isAdmin } = useAuth()

  // Memoize navigation array to prevent recreation
  const allNavigation = useMemo(
    () => (isAdmin ? [...navigation, ...adminNavigation] : navigation),
    [isAdmin]
  )

  // Memoize callback to prevent recreation
  const handleLinkClick = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block md:w-64">
        <SidebarContent 
          allNavigation={allNavigation}
          pathname={pathname}
          onLinkClick={handleLinkClick}
          user={user}
          isAdmin={isAdmin}
          logout={logout}
        />
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden bg-transparent">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="flex flex-col p-0">
          <SidebarContent 
            allNavigation={allNavigation}
            pathname={pathname}
            onLinkClick={handleLinkClick}
            user={user}
            isAdmin={isAdmin}
            logout={logout}
          />
        </SheetContent>
      </Sheet>
    </>
  )
}