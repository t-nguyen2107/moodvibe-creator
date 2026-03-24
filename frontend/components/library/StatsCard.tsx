'use client'

import React from 'react'
import { MusicalNoteIcon, ClockIcon, SparklesIcon } from '@heroicons/react/24/outline'

interface StatsCardProps {
  totalPlaylists: number
  totalSongs?: number
  totalDuration?: number
  onCreateClick: () => void
}

export function StatsCard({ totalPlaylists, totalSongs = 0, totalDuration = 0, onCreateClick }: StatsCardProps) {
  // Format duration to hours and minutes
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)

    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  return (
    <div className="px-4 pt-6 pb-4">
      <div className="container mx-auto max-w-7xl">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Total Playlists */}
          <div className="
            relative overflow-hidden
            bg-gradient-to-br from-cyan-50 to-magenta-50 dark:from-cyan-950/30 dark:to-magenta-950/30
            border border-cyan-200 dark:border-cyan-800
            rounded-2xl p-5
            shadow-lg
          ">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-cyan-500 to-magenta-500 rounded-xl flex items-center justify-center shadow-lg">
                <MusicalNoteIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-cyan-700 dark:text-cyan-300 mb-1">Playlists</p>
                <p className="text-2xl font-black text-cyan-900 dark:text-cyan-100">{totalPlaylists}</p>
              </div>
            </div>
            {/* Decorative Gradient */}
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-cyan-400/20 to-magenta-400/20 rounded-full blur-2xl" />
          </div>

          {/* Total Songs */}
          <div className="
            relative overflow-hidden
            bg-gradient-to-br from-magenta-50 to-rose-50 dark:from-magenta-950/30 dark:to-rose-950/30
            border border-magenta-200 dark:border-magenta-800
            rounded-2xl p-5
            shadow-lg
          ">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-magenta-500 to-rose-500 rounded-xl flex items-center justify-center shadow-lg">
                <ClockIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-magenta-700 dark:text-magenta-300 mb-1">Songs</p>
                <p className="text-2xl font-black text-magenta-900 dark:text-magenta-100">{totalSongs}</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-magenta-400/20 to-rose-400/20 rounded-full blur-2xl" />
          </div>

          {/* Total Duration */}
          <div className="
            relative overflow-hidden
            bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30
            border border-rose-200 dark:border-rose-800
            rounded-2xl p-5
            shadow-lg
          ">
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-rose-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold text-rose-700 dark:text-rose-300 mb-1">Duration</p>
                <p className="text-2xl font-black text-rose-900 dark:text-rose-100">{formatDuration(totalDuration)}</p>
              </div>
            </div>
            <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br from-rose-400/20 to-pink-400/20 rounded-full blur-2xl" />
          </div>

          {/* Create New CTA */}
          <button
            onClick={onCreateClick}
            className="
              group
              relative overflow-hidden
              bg-gradient-to-br from-cyan-500 via-magenta-500 to-rose-500
              rounded-2xl p-5
              shadow-lg hover:shadow-xl
              hover:scale-[1.02]
              transition-all duration-300
            "
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-transparent to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <div className="flex items-center gap-4 relative z-10">
              <div className="flex-shrink-0 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <SparklesIcon className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm font-semibold text-white/80 mb-1">Quick Action</p>
                <p className="text-lg font-black text-white">Create New</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
