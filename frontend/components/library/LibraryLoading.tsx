'use client'

import React from 'react'

export function LibraryLoading() {
  return (
    <div className="min-h-screen px-4 flex items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        {/* Animated Spinner */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-full blur-xl opacity-30 animate-pulse" />
          <div className="relative w-16 h-16 border-4 border-slate-200 border-t-orange-500 rounded-full animate-spin" />
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <p className="text-lg font-bold bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
            Loading your playlists...
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Please wait a moment
          </p>
        </div>
      </div>
    </div>
  )
}
