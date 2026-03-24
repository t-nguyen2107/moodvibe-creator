'use client'

import React, { useState } from 'react'
import { MusicalNoteIcon, PlayIcon, TrashIcon, ClockIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { Playlist } from '@/lib/store'

interface PlaylistCardProps {
  playlist: Playlist
  songCount?: number
  onView: (id: number) => void
  onDelete: (id: number) => void
}

export function PlaylistCard({ playlist, songCount = 0, onView, onDelete }: PlaylistCardProps) {
  const [imageError, setImageError] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Get cover image URL
  const getCoverImageUrl = () => {
    if (imageError || !playlist.cover_image_path) return null

    // If it's a relative path, convert to full URL
    if (playlist.cover_image_path.startsWith('uploads/')) {
      return `http://localhost:8899/${playlist.cover_image_path}`
    }
    if (playlist.cover_image_path.startsWith('/uploads/')) {
      return `http://localhost:8899${playlist.cover_image_path}`
    }

    return playlist.cover_image_path
  }

  const coverImageUrl = getCoverImageUrl()
  const hasCover = coverImageUrl && !imageError

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (isDeleting) return

    setIsDeleting(true)
    try {
      await onDelete(playlist.id!)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div
      className="group relative cursor-pointer"
      onClick={() => onView(playlist.id!)}
    >
      {/* Card Container */}
      <div className={`
        relative
        bg-white dark:bg-slate-900
        rounded-3xl
        overflow-hidden
        border border-slate-200 dark:border-slate-700
        shadow-lg hover:shadow-2xl
        transition-all duration-300
        hover:scale-[1.02]
        ${isDeleting ? 'opacity-50 pointer-events-none' : ''}
      `}>
        {/* Cover Image Section */}
        <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
          {hasCover ? (
            <>
              <img
                src={coverImageUrl}
                alt={playlist.name}
                className="w-full h-full object-cover"
                onError={() => setImageError(true)}
              />
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          ) : (
            /* Default Cover with MoodVibe Gradient */
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-magenta-500 to-rose-500" />
          )}

          {/* Play Button Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl transform scale-0 group-hover:scale-100 transition-transform duration-300">
              <PlayIcon className="h-8 w-8 text-slate-900 ml-1" />
            </div>
          </div>

          {/* Top Right Badge */}
          <div className="absolute top-4 right-4 flex items-center gap-2">
            {playlist.is_royalty_free && (
              <span className="px-3 py-1 bg-green-500/90 backdrop-blur-sm text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Royalty Free
              </span>
            )}
          </div>

          {/* Mood Tag */}
          {playlist.mood && (
            <div className="absolute bottom-4 left-4">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm dark:bg-slate-900/90 text-slate-900 dark:text-white text-sm font-bold rounded-xl shadow-lg">
                {playlist.mood}
              </span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5">
          {/* Title */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-3 line-clamp-2 min-h-[3rem]">
            {playlist.name}
          </h3>

          {/* Description */}
          {playlist.description && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
              {playlist.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-3 mb-4 text-sm text-slate-600 dark:text-slate-400">
            <div className="flex items-center gap-1.5">
              <MusicalNoteIcon className="h-4 w-4" />
              <span className="font-medium">{songCount || playlist.song_count || 0} songs</span>
            </div>
            {playlist.genre && (
              <>
                <span className="text-slate-300">•</span>
                <span className="font-medium capitalize">{playlist.genre.replace(/_/g, ' ')}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onView(playlist.id!)
              }}
              className="
                flex-1
                px-4 py-2.5
                bg-gradient-to-r from-cyan-500 via-magenta-500 to-rose-500
                text-white font-bold text-sm rounded-xl
                shadow-md hover:shadow-lg hover:shadow-magenta-500/30
                hover:scale-105
                active:scale-95
                transition-all duration-200
                flex items-center justify-center gap-2
              "
            >
              <PlayIcon className="h-4 w-4" />
              <span>Open</span>
            </button>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="
                px-3 py-2.5
                bg-slate-100 dark:bg-slate-800
                border border-slate-200 dark:border-slate-700
                text-slate-600 dark:text-slate-400 rounded-xl
                hover:bg-red-50 dark:hover:bg-red-950/20
                hover:border-red-300 dark:hover:border-red-700
                hover:text-red-600 dark:hover:text-red-400
                hover:scale-110
                active:scale-95
                disabled:opacity-50 disabled:cursor-not-allowed
                transition-all duration-200
              "
            >
              {isDeleting ? (
                <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              ) : (
                <TrashIcon className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
