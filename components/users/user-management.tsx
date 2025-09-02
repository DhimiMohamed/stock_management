"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Switch } from "@/components/ui/switch"
import { Users, Plus, Edit, Trash2, AlertCircle, Key, Mail, UserIcon } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"

type User = {
  id: string
  username: string
  email: string
  role: string
  is_active: boolean
  lastLogin?: string
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "user" as "admin" | "user",
    is_active: true,
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    setIsLoading(true)
    setError("")
    try {
      const supabase = createBrowserClient()
      const { data, error } = await supabase.from('users').select('*')
      if (error) throw error
      setUsers(data || [])
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError("Le nom d'utilisateur est requis")
      return false
    }
    if (!formData.email.trim()) {
      setError("L'email est requis")
      return false
    }
    if (!formData.password.trim()) {
      setError("Le mot de passe est requis")
      return false
    }
    if (formData.password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      return false
    }
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError("Format d'email invalide")
      return false
    }
    return true
  }

  const handleCreateUser = async () => {
  if (!validateForm()) return

  setIsSubmitting(true)
  setError("")
  
  try {
    const supabase = createBrowserClient()
    
    // Check if username already exists in your custom users table
    const { data: existingUsers, error: checkError } = await supabase
      .from('users')
      .select('username')
      .eq('username', formData.username)
    
    if (checkError) throw checkError
    
    if (existingUsers && existingUsers.length > 0) {
      setError("Ce nom d'utilisateur existe déjà")
      return
    }

    // Step 1: Create the authentication user using Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      options: {
        data: {
          username: formData.username.trim(),
          role: formData.role,
        }
      }
    })

    if (authError) {
      // Handle specific auth errors
      if (authError.message.includes('already registered')) {
        setError("Cet email est déjà utilisé")
      } else {
        setError(authError.message || "Erreur lors de la création du compte")
      }
      return
    }

    if (!authData.user) {
      setError("Erreur lors de la création du compte utilisateur")
      return
    }

    // Step 2: Create the user record in your custom users table
    const userData = {
      id: authData.user.id, // Use the auth user's ID
      username: formData.username.trim(),
      email: formData.email.trim().toLowerCase(),
      role: formData.role,
      is_active: formData.is_active,
      created_at: new Date().toISOString()
    }

    const { data: userRecord, error: userError } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (userError) {
      // If user table creation fails, we should delete the auth user
      // Note: This requires admin privileges or RLS policies that allow it
      console.error("Failed to create user record, auth user created:", userError)
      setError("Erreur lors de la création des données utilisateur")
      return
    }

    // Add the new user to the local state
    setUsers(prevUsers => [...prevUsers, userRecord])
    
    // Reset form and close dialog
    resetForm()
    setIsCreateDialogOpen(false)
    
    console.log("Utilisateur créé avec succès:", userRecord)
    
  } catch (err: any) {
    console.error("Error creating user:", err)
    setError(err.message || "Erreur lors de la création de l'utilisateur")
  } finally {
    setIsSubmitting(false)
  }
}

  // You can implement user update via Supabase here if needed
  const handleUpdateUser = async () => {
    setError("Modification d'utilisateur non implémentée côté Supabase.")
  }

  // You can implement user deletion via Supabase here if needed
  const handleDeleteUser = async () => {
    setError("Suppression d'utilisateur non implémentée côté Supabase.")
  }

  const resetForm = () => {
    setFormData({
      username: "",
      email: "",
      password: "",
      role: "user",
      is_active: true,
    })
    setSelectedUser(null)
    setError("")
  }

  const openEditDialog = (user: User) => {
    setSelectedUser(user)
    setFormData({
      username: user.username,
      email: user.email,
      password: "",
      role: user.role as "user" | "admin",
      is_active: user.is_active,
    })
    setIsEditDialogOpen(true)
  }

  const openDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance flex items-center gap-2">
            <Users className="h-8 w-8 text-primary" />
            Gestion des Utilisateurs
          </h1>
          <p className="text-muted-foreground">Gérez les comptes utilisateurs et leurs permissions</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={(open) => {
          setIsCreateDialogOpen(open)
          if (!open) resetForm()
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="h-4 w-4 mr-2" />
              Nouvel Utilisateur
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
              <DialogDescription>
                Remplissez les informations pour créer un nouveau compte utilisateur.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="create-username">Nom d'utilisateur</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="create-username"
                    placeholder="johndoe"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="create-email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-password">Mot de passe</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="create-password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="pl-10"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-role">Rôle</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="create-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                  disabled={isSubmitting}
                />
                <Label htmlFor="create-active">Compte actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsCreateDialogOpen(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button 
                onClick={handleCreateUser} 
                className="bg-primary hover:bg-primary/90"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Création..." : "Créer"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Utilisateurs</CardTitle>
          <CardDescription>
            {users.length} utilisateur{users.length > 1 ? "s" : ""} enregistré{users.length > 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Dernière connexion</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                      {user.role === "admin" ? "Admin" : "Utilisateur"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.is_active ? "default" : "destructive"}>
                      {user.is_active ? "Actif" : "Inactif"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("fr-FR") : "Jamais"}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(user)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openDeleteDialog(user)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
            <DialogDescription>
              Modifiez les informations de l'utilisateur. Laissez le mot de passe vide pour ne pas le changer.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <div className="space-y-2">
              <Label htmlFor="edit-username">Nom d'utilisateur</Label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-password">Nouveau mot de passe (optionnel)</Label>
              <div className="relative">
                <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="edit-password"
                  type="password"
                  placeholder="Laisser vide pour ne pas changer"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={formData.role}
                onValueChange={(value: "admin" | "user") => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="admin">Administrateur</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="edit-active">Compte actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateUser} className="bg-primary hover:bg-primary/90">
              Sauvegarder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{selectedUser?.username}</strong> ? Cette action
              est irréversible.
            </DialogDescription>
          </DialogHeader>
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}