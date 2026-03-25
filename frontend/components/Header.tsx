'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { MusicalNoteIcon, CogIcon, Bars3Icon, XMarkIcon, UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import { NavLink } from './NavLink'
import type { Locale } from '@/lib/i18n'
import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '@/lib/auth'

const LANGUAGES: Record<Locale, { label: string; shorthand: string }> = {
  en: { label: 'English', shorthand: 'EN' },
  vi: { label: 'Tiếng Việt', shorthand: 'VI' },
  zh: { label: '中文', shorthand: 'ZH' }
}

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const locale = useLocale()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const { user, isAuthenticated, logout } = useAuthStore()

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  // Determine active page based on pathname
  const getActivePage = () => {
    const path = pathname.split(`/${locale}`)[1] || '/'
    if (path === '/create' || path.startsWith('/create')) return 'create'
    if (path === '/library' || path.startsWith('/library')) return 'library'
    if (path === '/settings' || path.startsWith('/settings')) return 'settings'
    return 'home'
  }

  const activePage = getActivePage()

  const navButtonClass = (isActive: boolean) =>
    `px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-semibold transition-all duration-200 hover:scale-105 ${
      isActive
        ? 'text-blue-700 dark:text-blue-400 bg-gradient-to-br from-blue-50 to-primary-100 dark:from-blue-950/50 dark:to-blue-900/50 border border-blue-200 dark:border-blue-800 shadow-sm font-bold'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`

  return (
    <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <nav className="flex items-center justify-between">
          {/* Logo - Responsive */}
          <NavLink href="/" className="flex items-center gap-2.5 md:gap-3.5 flex-shrink-0">
            <div className="relative w-10 h-10 md:w-12 md:h-12 flex-shrink-0">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-0.5">
                <div className="relative w-full h-full rounded-lg overflow-hidden bg-white dark:bg-slate-800">
                  <img
                    src="/logo.png"
                    alt="MoodVibe Creator"
                    className="w-full h-full object-contain p-1.5"
                  />
                </div>
              </div>
            </div>
            <div className="hidden sm:flex flex-col">
              <span className="text-lg md:text-2xl font-black font-google-sans bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent leading-tight tracking-tight">
                MoodVibe Creator
              </span>
              <span className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide hidden lg:block font-inter">
                AI-Powered Music Playlist Creator
              </span>
            </div>
          </NavLink>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            <NavLink href="/create" className={navButtonClass(activePage === 'create')}>
              Create
            </NavLink>
            <NavLink href="/library" className={navButtonClass(activePage === 'library')}>
              Library
            </NavLink>
            <NavLink href="/settings" className={navButtonClass(activePage === 'settings')}>
              <CogIcon className="h-5 w-5" />
            </NavLink>

            {/* Language Switcher */}
            <div className="w-px h-10 bg-slate-200 dark:border-slate-700 mx-2" />
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value as Locale)}
              className="px-4 md:px-5 py-2.5 md:py-3 rounded-lg md:rounded-xl text-xs md:text-sm font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-primary-300 dark:hover:border-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 cursor-pointer hover:scale-105"
            >
              {Object.entries(LANGUAGES).map(([code, { label, shorthand }]) => (
                <option key={code} value={code}>
                  {shorthand} - {label}
                </option>
              ))}
            </select>

            {/* User Menu */}
            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  {user.avatar_url ? (
                    <img
                      src={user.avatar_url}
                      alt={user.name || 'User'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                      <UserIcon className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden xl:block">
                    {user.name || 'User'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-2 z-50">
                    <NavLink
                      href="/profile"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <UserIcon className="w-4 h-4" />
                      Profile
                    </NavLink>
                    <NavLink
                      href="/settings"
                      className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      <CogIcon className="w-4 h-4" />
                      Settings
                    </NavLink>
                    <hr className="my-2 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={() => {
                        setIsUserMenuOpen(false)
                        logout()
                        router.push(`/${locale}`)
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      <ArrowRightOnRectangleIcon className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <NavLink
                href="/login"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium transition-colors"
              >
                Sign In
              </NavLink>
            )}
          </div>

          {/* Mobile/Tablet Navigation */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Language Switcher - Mobile */}
            <select
              value={locale}
              onChange={(e) => switchLocale(e.target.value as Locale)}
              className="px-2 py-2 rounded-lg text-xs font-bold border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 cursor-pointer"
            >
              {Object.entries(LANGUAGES).map(([code, lang]) => (
                <option key={code} value={code}>
                  {lang.shorthand}
                </option>
              ))}
            </select>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-3 pb-3 border-t border-slate-200 dark:border-slate-700 pt-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex flex-col gap-2">
              <NavLink
                href="/create"
                className={navButtonClass(activePage === 'create')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span>Create</span>
                  {activePage === 'create' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </NavLink>
              <NavLink
                href="/library"
                className={navButtonClass(activePage === 'library')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span>Library</span>
                  {activePage === 'library' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </NavLink>
              <NavLink
                href="/settings"
                className={navButtonClass(activePage === 'settings')}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center gap-3">
                  <span>Settings</span>
                  <CogIcon className="h-5 w-5" />
                  {activePage === 'settings' && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-blue-500" />
                  )}
                </div>
              </NavLink>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
