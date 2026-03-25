'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { useAuthStore } from '@/lib/auth'
import { api } from '@/lib/api'
import { EnvelopeIcon, LockClosedIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline'
import { FcGoogle } from 'react-icons/fc'
import { FaFacebook, FaGithub } from 'react-icons/fa'
import { GoogleLogin } from '@react-oauth/google'

export default function LoginPage() {
  const router = useRouter()
  const locale = useLocale()
  
  const { login } = useAuthStore()
  
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const data = await api.login(email, password)
      login(data.access_token, data.user)
      router.push(`/${locale}/library`)
    } catch (err: any) {
      setError(err.message || 'Login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setError('')
    setIsLoading(true)

    try {
      const data = await api.loginWithGoogle(credentialResponse.credential)
      login(data.access_token, data.user)
      router.push(`/${locale}/library`)
    } catch (err: any) {
      setError(err.message || 'Google login failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  const handleFacebookLogin = () => {
    alert('Facebook OAuth - Coming soon!')
  }

  const handleGithubLogin = () => {
    // Use backend URL for GitHub OAuth
    // In production: https://moodvibe-backend.onrender.com
    // In development: http://localhost:8899
    const backendUrl = process.env.NODE_ENV === 'production' 
      ? 'https://moodvibe-backend.onrender.com'
      : 'http://localhost:8899'
    window.location.href = `${backendUrl}/api/auth/github`
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">🎵 MoodVibe Creator</h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 shadow-2xl border border-white/20">
          {/* OAuth Buttons */}
          <div className="space-y-3 mb-6">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              useOneTap
              theme="filled_black"
              shape="rectangular"
              width="100%"
              text="continue_with"
            />
            
            <button
              onClick={handleFacebookLogin}
              className="w-full flex items-center justify-center gap-3 bg-[#1877F2] text-white font-medium py-3 px-4 rounded-xl hover:bg-[#166FE5] transition-colors"
            >
              <FaFacebook className="w-5 h-5" />
              Continue with Facebook
            </button>
            
            <button
              onClick={handleGithubLogin}
              className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white font-medium py-3 px-4 rounded-xl hover:bg-gray-800 transition-colors"
            >
              <FaGithub className="w-5 h-5" />
              Continue with GitHub
            </button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/20"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-transparent text-slate-400">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <div className="relative">
                <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/10 border border-white/20 rounded-xl py-3 pl-10 pr-12 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold py-3 px-4 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <p className="mt-6 text-center text-slate-400 text-sm">
            Don't have an account?{' '}
            <a href={`/${locale}/register`} className="text-purple-400 hover:text-purple-300 font-medium">
              Sign up
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
