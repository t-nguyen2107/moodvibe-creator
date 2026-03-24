'use client'

import React from 'react'
import { MusicalNoteIcon, PlusIcon } from '@heroicons/react/24/outline'

interface LibraryEmptyProps {
  onCreateClick: () => void
}

export function LibraryEmpty({ onCreateClick }: LibraryEmptyProps) {
  return (
    <div className="min-h-[70vh] px-4 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/20 via-orange-500/20 to-rose-500/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-orange-500/20 via-rose-500/20 to-blue-500/20 rounded-full blur-3xl" />

      <div className="w-full max-w-2xl mx-auto text-center relative z-10">
        {/* Icon */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 rounded-3xl flex items-center justify-center shadow-xl">
            <MusicalNoteIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-slate-100 mb-4">
          No Playlists Yet
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 max-w-lg mx-auto">
          Start your musical journey by creating your first AI-powered playlist
        </p>

        {/* CTA Button */}
        <button
          onClick={onCreateClick}
          className="
            px-10 py-5 rounded-2xl
            bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
            text-white font-black text-lg
            shadow-xl hover:shadow-2xl
            hover:scale-105
            active:scale-95
            transition-all duration-300
            inline-flex items-center justify-center gap-3
          "
        >
          <PlusIcon className="h-6 w-6" />
          <span>Create Playlist</span>
        </button>
      </div>
    </div>
  )
}
