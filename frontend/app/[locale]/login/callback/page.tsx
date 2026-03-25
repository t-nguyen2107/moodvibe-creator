'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'

export default function OAuthCallbackPage() {
  const router = useRouter()
  const locale = useLocale()
  const searchParams = useSearchParams()
  const { login } = useAuthStore()
  const [error, setError] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    const errorParam = searchParams.get('error')

    if (errorParam) {
      setError(errorParam)
      setTimeout(() => {
        router.push(`/${locale}/login`)
      }, 2000)
      return
    }

    if (token) {
      // Get user info with token
      api.getCurrentUser(token)
        .then(user => {
          login(token, user)
          router.push(`/${locale}/library`)
        })
        .catch(err => {
          setError('Failed to get user info')
          setTimeout(() => {
            router.push(`/${locale}/login`)
          }, 2000)
        })
    } else {
      setError('No token provided')
      setTimeout(() => {
        router.push(`/${locale}/login`)
      }, 2000)
    }
  }, [searchParams, login, router, locale])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">❌ {error}</div>
          <p className="text-slate-400">Redirecting to login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
        <p className="text-white text-xl">Logging in...</p>
      </div>
    </div>
  )
}
