/**
 * Clerk auth shim — drop-in replacement for Wasp's useAuth() + logout
 */
import { useUser } from '@clerk/clerk-react'

export function useAuth() {
  const { user, isLoaded } = useUser()

  if (!isLoaded) return { data: null, isLoading: true, isError: false }
  if (!user) return { data: null, isLoading: false, isError: false }

  return {
    data: {
      id: user.id,
      email: user.primaryEmailAddress?.emailAddress ?? '',
      username: user.username ?? user.primaryEmailAddress?.emailAddress ?? '',
      isAdmin: (user.publicMetadata?.isAdmin as boolean) ?? false,
      createdAt: user.createdAt,
    },
    isLoading: false,
    isError: false,
  }
}

export function logout() {
  // Clerk sign out — callable without hooks (components use useClerk().signOut())
  window.location.href = '/login'
}
