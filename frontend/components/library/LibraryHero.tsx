'use client'

import React from 'react'
import { MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { GradientWaves } from '../GradientWaves'

interface LibraryHeroProps {
  onCreateClick: () => void
}

export function LibraryHero({ onCreateClick }: LibraryHeroProps) {
  return (
    <section className="moodvibe-hero min-h-[70vh] px-4 flex items-center justify-center relative overflow-hidden">
      {/* MoodVibe Gradient Waves */}
      <GradientWaves intensity="medium" />

      <div className="w-full max-w-3xl mx-auto text-center relative z-10">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 dark:from-cyan-950/40 dark:to-magenta-950/40 border border-cyan-300/30 dark:border-cyan-700/50 mb-8 shadow-lg backdrop-blur-sm">
          <SparklesIcon className="h-4 w-4 text-cyan-500 dark:text-cyan-400" />
          <span className="text-sm font-bold text-cyan-700 dark:text-cyan-300">
            AI-Powered Music Creation
          </span>
        </div>

        {/* Large Icon */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 via-magenta-400 to-rose-400 rounded-3xl blur-2xl opacity-50 animate-pulse" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-cyan-400 via-magenta-400 to-rose-400 rounded-3xl flex items-center justify-center shadow-2xl">
              <MusicalNoteIcon className="h-14 w-14 text-white" />
            </div>
          </div>
        </div>

        {/* Title - MoodVibe gradient */}
        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black mb-6 bg-gradient-to-r from-cyan-400 via-magenta-400 to-rose-400 bg-clip-text text-transparent leading-tight">
          Your Playlist Library
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl mx-auto font-medium leading-relaxed">
          Create amazing music playlists with AI. Your collection starts here.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={onCreateClick}
            className="
              px-10 py-5 rounded-2xl
              bg-gradient-to-r from-cyan-400 via-magenta-400 to-rose-400
              text-white font-black text-lg
              shadow-xl hover:shadow-2xl hover:shadow-magenta-500/30
              hover:scale-105
              active:scale-95
              transition-all duration-300
              flex items-center justify-center gap-3
            "
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Create Your First Playlist</span>
          </button>
        </div>
      </div>
    </section>
  )
}
