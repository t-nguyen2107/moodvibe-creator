'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuthStore } from '@/lib/auth'
import { UserIcon, EnvelopeIcon, CalendarIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'

export default function ProfilePage() {
  const router = useRouter()
  const locale = useLocale()
  const { user, logout } = useAuthStore()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logout()
      router.push(`/${locale}/login`)
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (!user) {
    router.push(`/${locale}/login`)
    return null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-slate-400">Manage your account</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.name || 'User'}
                className="w-24 h-24 rounded-full border-4 border-purple-500 object-cover"
              />
            ) : (
              <div className="w-24 h-24 rounded-full border-4 border-purple-500 bg-purple-600 flex items-center justify-center">
                <UserIcon className="w-12 h-12 text-white" />
              </div>
            )}
            
            <div>
              <h2 className="text-2xl font-bold text-white">
                {user.name || 'User'}
              </h2>
              <div className="flex items-center gap-2 text-slate-400 mt-1">
                <EnvelopeIcon className="w-4 h-4" />
                <span>{user.email || 'No email'}</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Member since</div>
              <div className="flex items-center gap-2 text-white">
                <CalendarIcon className="w-5 h-5 text-purple-400" />
                <span>{user.created_at ? formatDate(user.created_at) : 'N/A'}</span>
              </div>
            </div>
            
            <div className="bg-white/5 rounded-xl p-4">
              <div className="text-slate-400 text-sm mb-1">Status</div>
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${user.is_active ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-white">{user.is_active ? 'Active' : 'Inactive'}</span>
              </div>
            </div>
          </div>

          {/* Account Details */}
          <div className="space-y-4 mb-8">
            <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
              Account Details
            </h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-slate-400 mb-1">User ID</div>
                <div className="text-white font-mono">#{user.id}</div>
              </div>
              
              <div>
                <div className="text-slate-400 mb-1">Email Verified</div>
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${
                  user.is_verified 
                    ? 'bg-green-500/20 text-green-300' 
                    : 'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {user.is_verified ? '✓ Verified' : '⏳ Pending'}
                </div>
              </div>
              
              {user.last_login && (
                <div className="col-span-2">
                  <div className="text-slate-400 mb-1">Last Login</div>
                  <div className="text-white">{formatDate(user.last_login)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/${locale}/settings`)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-xl transition-colors"
            >
              Account Settings
            </button>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-center gap-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              {isLoggingOut ? 'Logging out...' : 'Sign Out'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
