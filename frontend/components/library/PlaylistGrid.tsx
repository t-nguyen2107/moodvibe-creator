'use client'

import React from 'react'
import { Playlist } from '@/lib/store'
import { PlaylistCard } from './PlaylistCard'
import { StatsCard } from './StatsCard'

interface PlaylistGridProps {
  playlists: Playlist[]
  onView: (id: number) => void
  onDelete: (id: number) => void
  onCreateClick: () => void
}

export function PlaylistGrid({ playlists, onView, onDelete, onCreateClick }: PlaylistGridProps) {
  // Calculate totals from playlists
  const totalSongs = playlists.reduce((sum, p) => sum + (p.song_count || 0), 0)

  // Calculate total duration (estimated: 3.5 minutes per song average)
  const totalDuration = totalSongs * 210 // 210 seconds = 3.5 minutes

  return (
    <>
      {/* Stats Cards */}
      <StatsCard
        totalPlaylists={playlists.length}
        totalSongs={totalSongs}
        totalDuration={totalDuration}
        onCreateClick={onCreateClick}
      />

      {/* Playlist Grid Section */}
      <section className="px-4 pb-12">
        <div className="container mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="mb-8">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 dark:text-slate-100 mb-2">
              Your Playlists
            </h2>
            <p className="text-slate-600 dark:text-slate-400">
              Click to open and manage your playlists
            </p>
          </div>

          {/* Empty State */}
          {playlists.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex flex-col items-center gap-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                  <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">No playlists created yet</p>
              </div>
            </div>
          ) : (
            /* Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {playlists.map((playlist) => (
                <PlaylistCard
                  key={playlist.id}
                  playlist={playlist}
                  onView={onView}
                  onDelete={onDelete}
                />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
