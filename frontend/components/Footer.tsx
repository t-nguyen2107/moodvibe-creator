'use client'

import { MusicalNoteIcon } from '@heroicons/react/24/outline'
import { NavLink } from './NavLink'
import { useTranslations } from 'next-intl'

interface FooterProps {
  variant?: 'simple' | 'enhanced'
}

export function Footer({ variant = 'simple' }: FooterProps) {
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')

  if (variant === 'enhanced') {
    return (
      <footer className="border-t-2 border-slate-200/50 dark:border-slate-700/50 mt-16 md:mt-24 bg-gradient-to-br from-white/80 via-blue-50/50 to-orange-50/50 dark:from-slate-900/80 dark:via-slate-800/50 dark:to-orange-950/30 backdrop-blur-xl relative z-10 py-10 md:py-16">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-10 mb-8 md:mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-7">
                <div className="relative w-14 h-14 md:w-16 md:h-16 flex-shrink-0">
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 p-1">
                    <div className="relative w-full h-full rounded-xl overflow-hidden bg-white dark:bg-slate-800">
                      <img
                        src="/logo.png"
                        alt="MoodVibe Creator"
                        className="w-full h-full object-cover p-2"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl md:text-2xl font-black font-google-sans bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent tracking-tight leading-none mb-1">
                    MoodVibe Creator
                  </h3>
                  <p className="text-xs md:text-sm font-semibold text-slate-600 dark:text-slate-400 font-inter">AI-Powered Music Playlist Creator</p>
                </div>
              </div>
              <p className="text-sm md:text-base font-semibold text-slate-700 dark:text-slate-300 leading-relaxed max-w-md mb-4 md:mb-6">
                Create beautiful music playlists from multiple sources. Discover, combine, and share your perfect vibe with AI-powered technology.
              </p>
              {/* Social Links */}
              <div className="flex items-center gap-2 md:gap-3">
                <a href="#" className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-orange-500/10 hover:from-blue-500 hover:to-orange-500 text-slate-600 hover:text-white dark:text-slate-400 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-orange-500/10 hover:from-blue-500 hover:to-orange-500 text-slate-600 hover:text-white dark:text-slate-400 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                </a>
                <a href="#" className="p-2 md:p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-orange-500/10 hover:from-blue-500 hover:to-orange-500 text-slate-600 hover:text-white dark:text-slate-400 transition-all duration-300 hover:scale-110 shadow-md hover:shadow-lg">
                  <svg className="h-4 w-4 md:h-5 md:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 md:mb-6 text-base md:text-lg flex items-center gap-2">
                <span className="w-6 md:w-8 h-1 bg-gradient-to-r from-blue-400 to-rose-400 rounded-full"></span>
                Quick Links
              </h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <NavLink href="/create" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {tNav('create')}
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/library" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {tNav('library')}
                  </NavLink>
                </li>
                <li>
                  <NavLink href="/settings" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-orange-600 dark:hover:text-orange-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    {tNav('settings')}
                  </NavLink>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h4 className="font-bold text-slate-900 dark:text-slate-100 mb-4 md:mb-6 text-base md:text-lg flex items-center gap-2">
                <span className="w-6 md:w-8 h-1 bg-gradient-to-r from-orange-500 to-rose-500 rounded-full"></span>
                Resources
              </h4>
              <ul className="space-y-2 md:space-y-3">
                <li>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    YouTube
                  </a>
                </li>
                <li>
                  <a href="https://soundcloud.com" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    SoundCloud
                  </a>
                </li>
                <li>
                  <a href="https://pixabay.com" target="_blank" rel="noopener noreferrer" className="text-sm md:text-base font-semibold text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-all duration-200 hover:pl-2 hover:font-bold flex items-center gap-2 group">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                    Pixabay
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-6 md:pt-10 border-t-2 border-slate-200/50 dark:border-slate-700/50">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
              <p className="text-xs md:text-base font-semibold text-slate-700 dark:text-slate-300 text-center md:text-left">
                © 2025 MoodVibe Creator. Made with <span className="text-rose-500">❤</span> using AI-powered technology.
              </p>
              <div className="flex items-center justify-center gap-4 md:gap-6 flex-wrap">
                <a href="#" className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
                  Privacy Policy
                </a>
                <a href="#" className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
                  Terms of Service
                </a>
                <a href="#" className="text-xs md:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 hover:scale-105">
                  Contact
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    )
  }

  return (
    <footer className="border-t-2 border-slate-200/50 dark:border-slate-700/50 mt-16 md:mt-24 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 md:px-6 py-10 md:py-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-10">
          {/* Brand */}
          <div className="flex items-center gap-3 md:gap-5">
            <div className="p-3 md:p-4 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-xl md:rounded-2xl shadow-lg md:shadow-xl shadow-blue-600/30">
              <MusicalNoteIcon className="h-5 w-5 md:h-7 md:w-7 text-white" />
            </div>
            <span className="text-base md:text-xl font-black text-slate-900 dark:text-slate-100">
              MoodVibe Creator
            </span>
          </div>

          {/* Copyright */}
          <p className="text-xs md:text-base font-medium text-slate-500 dark:text-slate-400 text-center md:text-left">
            © 2025 MoodVibe Creator. All rights reserved.
          </p>

          {/* Links */}
          <div className="flex items-center gap-4 md:gap-8 justify-center">
            <a href="#" className="text-xs md:text-base font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-primary-400 transition-colors duration-200">
              Privacy
            </a>
            <a href="#" className="text-xs md:text-base font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-primary-400 transition-colors duration-200">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
