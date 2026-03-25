'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuthStore } from '@/lib/auth'

// Routes that require authentication
const PROTECTED_ROUTES = [
  '/create',
  '/library',
  '/settings',
  '/playlist'
]

// Routes that should redirect if already logged in
const AUTH_ROUTES = [
  '/login',
  '/register'
]

export function useAuthGuard() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const { isAuthenticated, isLoading, token } = useAuthStore()

  useEffect(() => {
    // Skip if still loading
    if (isLoading) return

    // Remove locale from pathname
    const pathWithoutLocale = pathname.replace(`/${locale}`, '') || '/'

    // Check if current route is protected
    const isProtectedRoute = PROTECTED_ROUTES.some(route => 
      pathWithoutLocale.startsWith(route)
    )

    // Check if current route is auth route
    const isAuthRoute = AUTH_ROUTES.some(route => 
      pathWithoutLocale.startsWith(route)
    )

    // Redirect to login if accessing protected route without auth
    if (isProtectedRoute && !isAuthenticated) {
      router.push(`/${locale}/login?redirect=${encodeURIComponent(pathname)}`)
      return
    }

    // Redirect to home if accessing auth route while logged in
    if (isAuthRoute && isAuthenticated) {
      router.push(`/${locale}/library`)
      return
    }
  }, [isAuthenticated, isLoading, pathname, locale, router])

  return { isAuthenticated, isLoading }
}
