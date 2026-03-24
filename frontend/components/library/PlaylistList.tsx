'use client'

import React from 'react'
import { Playlist } from '@/lib/store'
import { PlaylistItem } from './PlaylistItem'

interface PlaylistListProps {
  playlists: Playlist[]
  onView: (id: number) => void
  onDelete: (id: number) => void
}

export function PlaylistList({ playlists, onView, onDelete }: PlaylistListProps) {
  return (
    <section className="px-4 pt-6 pb-4">
      <div className="container mx-auto max-w-4xl">
        {/* Simple Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <h2 className="text-lg font-bold text-slate-700 dark:text-slate-300">
            Your Playlists ({playlists.length})
          </h2>
        </div>

        {/* Playlist List */}
        <div className="space-y-2">
          {playlists.map((playlist) => (
            <PlaylistItem
              key={playlist.id}
              playlist={playlist}
              onView={onView}
              onDelete={onDelete}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
