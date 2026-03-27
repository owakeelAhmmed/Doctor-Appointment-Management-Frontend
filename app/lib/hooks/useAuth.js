'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { showToast } from '../utils/toast'

export const useAuth = () => {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isLoading = status === 'loading'
  const isAuthenticated = !!session?.user

  const logout = async () => {
    try {
      await signOut({ redirect: false })
      showToast.success('Logged out successfully')
      router.push('/login')
    } catch (error) {
      showToast.error('Error logging out')
    }
  }

  const user = session?.user

  // Role check functions
  const isPatient = user?.role === 'patient'
  const isDoctor = user?.role === 'doctor'
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin'

  // Redirect if not authenticated
  const requireAuth = (redirectTo = '/login') => {
    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isLoading, isAuthenticated, router, redirectTo])
  }

  // Redirect if authenticated (for login/register pages)
  const redirectIfAuthenticated = (redirectTo = '/') => {
    useEffect(() => {
      if (!isLoading && isAuthenticated) {
        router.push(redirectTo)
      }
    }, [isLoading, isAuthenticated, router, redirectTo])
  }

  return {
    user,
    isLoading,
    isAuthenticated,
    isPatient,
    isDoctor,
    isAdmin,
    logout,
    requireAuth,
    redirectIfAuthenticated
  }
}