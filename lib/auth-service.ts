// // lib\auth-service.ts
// export interface User {
//   id: string
//   username: string
//   email: string
//   password: string
//   role: "admin" | "user"
//   createdAt: Date
//   lastLogin?: Date
//   isActive: boolean
// }

// export interface AuthSession {
//   user: User
//   token: string
//   expiresAt: Date
// }

// class AuthService {
//   private users: User[] = [
//     {
//       id: "1",
//       username: "admin",
//       email: "admin@stockmanager.com",
//       password: "admin123", // In real app, this would be hashed
//       role: "admin",
//       createdAt: new Date("2024-01-01"),
//       lastLogin: new Date(),
//       isActive: true,
//     },
//   ]

//   private currentSession: AuthSession | null = null

//   async login(username: string, password: string): Promise<AuthSession> {
//     const user = this.users.find(
//       (u) => (u.username === username || u.email === username) && u.password === password && u.isActive,
//     )

//     if (!user) {
//       throw new Error("Nom d'utilisateur ou mot de passe incorrect")
//     }

//     user.lastLogin = new Date()

//     const session: AuthSession = {
//       user: { ...user, password: "" }, // Don't include password in session
//       token: this.generateToken(),
//       expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
//     }

//     this.currentSession = session
//     localStorage.setItem("auth_session", JSON.stringify(session))

//     return session
//   }

//   logout(): void {
//     this.currentSession = null
//     localStorage.removeItem("auth_session")
//   }

//   getCurrentSession(): AuthSession | null {
//     if (this.currentSession) {
//       return this.currentSession
//     }

//     const stored = localStorage.getItem("auth_session")
//     if (stored) {
//       const session = JSON.parse(stored) as AuthSession
//       if (new Date(session.expiresAt) > new Date()) {
//         this.currentSession = session
//         return session
//       } else {
//         localStorage.removeItem("auth_session")
//       }
//     }

//     return null
//   }

//   isAuthenticated(): boolean {
//     const session = this.getCurrentSession()
//     return session !== null && new Date(session.expiresAt) > new Date()
//   }

//   isAdmin(): boolean {
//     const session = this.getCurrentSession()
//     return session?.user.role === "admin"
//   }

//   async createUser(userData: Omit<User, "id" | "createdAt">): Promise<User> {
//     const existingUser = this.users.find((u) => u.username === userData.username || u.email === userData.email)

//     if (existingUser) {
//       throw new Error("Un utilisateur avec ce nom d'utilisateur ou email existe déjà")
//     }

//     const newUser: User = {
//       ...userData,
//       id: Date.now().toString(),
//       createdAt: new Date(),
//     }

//     this.users.push(newUser)
//     return newUser
//   }

//   async updateUser(id: string, updates: Partial<Omit<User, "id" | "createdAt">>): Promise<User> {
//     const userIndex = this.users.findIndex((u) => u.id === id)
//     if (userIndex === -1) {
//       throw new Error("Utilisateur non trouvé")
//     }

//     this.users[userIndex] = { ...this.users[userIndex], ...updates }
//     return this.users[userIndex]
//   }

//   async deleteUser(id: string): Promise<void> {
//     const userIndex = this.users.findIndex((u) => u.id === id)
//     if (userIndex === -1) {
//       throw new Error("Utilisateur non trouvé")
//     }

//     if (this.users[userIndex].role === "admin" && this.users.filter((u) => u.role === "admin").length === 1) {
//       throw new Error("Impossible de supprimer le dernier administrateur")
//     }

//     this.users.splice(userIndex, 1)
//   }

//   getUsers(): User[] {
//     return this.users.map((user) => ({ ...user, password: "" }))
//   }

//   private generateToken(): string {
//     return Math.random().toString(36).substring(2) + Date.now().toString(36)
//   }
// }

// export const authService = new AuthService()

// // Named exports for convenience
// export const login = (username: string, password: string) => authService.login(username, password)
// export const logout = () => authService.logout()
// export const getCurrentSession = () => authService.getCurrentSession()
// export const isAuthenticated = () => authService.isAuthenticated()
// export const isAdmin = () => authService.isAdmin()
// export const createUser = (userData: Omit<User, "id" | "createdAt">) => authService.createUser(userData)
// export const updateUser = (id: string, updates: Partial<Omit<User, "id" | "createdAt">>) =>
//   authService.updateUser(id, updates)
// export const deleteUser = (id: string) => authService.deleteUser(id)
// export const getUsers = () => authService.getUsers()
