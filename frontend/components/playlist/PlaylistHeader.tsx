'use client'

import React from 'react'
import { MusicalNoteIcon, ClockIcon, HeartIcon } from '@heroicons/react/24/outline'
import { Playlist } from '@/app/[locale]/playlist/[id]/page'

interface PlaylistHeaderProps {
  playlist: Playlist
  totalDuration: number
  songCount: number
}

export function PlaylistHeader({ playlist, totalDuration, songCount }: PlaylistHeaderProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="p-8 md:p-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
        {/* Cover Art */}
        <div className="relative group flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-3xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-subtle" />
          <div className="relative w-48 h-48 md:w-64 md:h-64 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-3xl shadow-2xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <MusicalNoteIcon className="h-24 w-24 md:h-32 md:w-32 text-white" />
          </div>
        </div>

        {/* Playlist Info */}
        <div className="flex-1 text-center md:text-left space-y-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 leading-tight">
              {playlist.name}
            </h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <span className="px-4 py-2 bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 text-white font-bold rounded-full shadow-lg text-sm">
                {playlist.mood}
              </span>
              {playlist.genre && (
                <span className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold rounded-full text-sm">
                  {playlist.genre.replace('_', ' ')}
                </span>
              )}
              {playlist.is_royalty_free && (
                <span className="px-4 py-2 bg-gradient-to-r from-green-400 to-emerald-500 text-white font-bold rounded-full shadow-lg text-sm flex items-center gap-1.5">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Royalty Free
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-white/80 text-sm font-medium">
            <div className="flex items-center gap-2">
              <MusicalNoteIcon className="h-5 w-5" />
              <span>{songCount} songs</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              <span>{formatTime(totalDuration)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
