'use client'

import React from 'react'
import { PlayIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Playlist } from '@/lib/store'

interface PlaylistItemProps {
  playlist: Playlist
  onView: (id: number) => void
  onDelete: (id: number) => void
}

export function PlaylistItem({ playlist, onView, onDelete }: PlaylistItemProps) {
  return (
    <div
      className="
        group
        flex items-center justify-between gap-4
        px-6 py-4
        bg-white dark:bg-slate-900
        border border-slate-200 dark:border-slate-700
        rounded-xl
        hover:border-orange-300 dark:hover:border-orange-700
        hover:shadow-md
        transition-all duration-200
      "
    >
      {/* Left: Playlist Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3">
          {/* Simple indicator */}
          <div className="flex-shrink-0 w-2 h-2 bg-gradient-to-br from-blue-600 to-orange-500 rounded-full" />

          {/* Playlist Name */}
          <h3 className="text-base md:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
            {playlist.name}
          </h3>

          {/* Tags - Only show essential */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded">
              {playlist.mood}
            </span>
            {playlist.is_royalty_free && (
              <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-semibold rounded">
                Free
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onView(playlist.id!)}
          className="
            p-2
            text-slate-600 dark:text-slate-400
            hover:text-orange-600 dark:hover:text-orange-400
            hover:bg-orange-50 dark:hover:bg-orange-950/20
            rounded-lg
            transition-all duration-200
            hover:scale-110
          "
          title="View playlist"
        >
          <PlayIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => onDelete(playlist.id!)}
          className="
            p-2
            text-slate-400 dark:text-slate-600
            hover:text-red-600 dark:hover:text-red-400
            hover:bg-red-50 dark:hover:bg-red-950/20
            rounded-lg
            transition-all duration-200
            hover:scale-110
          "
          title="Delete playlist"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
