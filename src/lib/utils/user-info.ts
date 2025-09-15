// Utility to get user information from Clerk
// This works with the current database structure without requiring a users table

import { useUser } from '@clerk/nextjs'

export interface UserInfo {
  id: string
  username: string
  display_name?: string
  avatar_url?: string
}

export function useUserInfo(userId?: string): UserInfo | null {
  const { user } = useUser()
  
  if (!userId) return null
  
  // If the userId matches the current user, use Clerk's user data
  if (user && user.id === userId) {
    return {
      id: user.id,
      username: user.username || `user_${user.id.slice(0, 8)}`,
      display_name: user.fullName || user.firstName || undefined,
      avatar_url: user.imageUrl || undefined
    }
  }
  
  // For system user or other users, create a basic profile
  if (userId === '00000000-0000-0000-0000-000000000000') {
    return {
      id: userId,
      username: 'system',
      display_name: 'System User',
      avatar_url: undefined
    }
  }
  
  // For other users, create a basic profile
  return {
    id: userId,
    username: `user_${userId.slice(0, 8)}`,
    display_name: undefined,
    avatar_url: undefined
  }
}

// Helper function to get user info without hooks (for server-side use)
export function getUserInfoFromClerk(userId: string, clerkUser?: any): UserInfo {
  if (clerkUser && clerkUser.id === userId) {
    return {
      id: clerkUser.id,
      username: clerkUser.username || `user_${clerkUser.id.slice(0, 8)}`,
      display_name: clerkUser.fullName || clerkUser.firstName || undefined,
      avatar_url: clerkUser.imageUrl || undefined
    }
  }
  
  return {
    id: userId,
    username: `user_${userId.slice(0, 8)}`,
    display_name: undefined,
    avatar_url: undefined
  }
}
