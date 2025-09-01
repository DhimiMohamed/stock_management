import { UserManagement } from "@/components/users/user-management"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function UsersPage() {
  return (
    <ProtectedRoute requireAdmin={true}>
      <UserManagement />
    </ProtectedRoute>
  )
}
