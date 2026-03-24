'use client'

import React, { useState } from 'react'
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useMusicSearchStore } from '@/lib/store'

/**
 * Advanced Filters Component
 * Features:
 * - Collapsible panel (closed by default)
 * - Mood chips (20 common moods + custom input)
 * - Genre chips (30 genres + custom input)
 * - Era slider (1950s - 2024)
 * - Language selector (EN, VI, KO, ZH, JA, ES)
 * - Source toggle (YouTube, Spotify, SoundCloud, Zing MP3)
 * - Royalty-free only checkbox
 * - Trending this week toggle
 * - Smooth slide-down animation
 */

const MOODS = [
  'chill', 'happy', 'sad', 'energetic', 'romantic', 'focus', 'sleep',
  'party', 'workout', 'relaxed', 'motivating', 'peaceful', 'exciting',
  'nostalgic', 'melancholic', 'upbeat', 'ambient', 'angry', 'hopeful', 'emotional'
]

const GENRES = [
  'pop', 'rock', 'hip-hop', 'r&b', 'jazz', 'classical', 'electronic',
  'edm', 'house', 'techno', 'country', 'folk', 'blues', 'reggae',
  'latin', 'indie', 'metal', 'punk', 'disco', 'funk', 'soul',
  'k-pop', 'v-pop', 'j-pop', 'c-pop', 'ballad', 'instrumental', 'acoustic'
]

const ERAS = ['1950s', '1960s', '1970s', '1980s', '1990s', '2000s', '2010s', '2020s']

const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'vi', name: 'Tiếng Việt' },
  { code: 'ko', name: '한국어' },
  { code: 'zh', name: '中文' },
  { code: 'ja', name: '日本語' },
  { code: 'es', name: 'Español' },
]

const SOURCES = [
  { id: 'youtube', name: 'YouTube' },
  { id: 'spotify', name: 'Spotify' },
  { id: 'soundcloud', name: 'SoundCloud' },
  { id: 'zing', name: 'Zing MP3' },
]

export function AdvancedFilters() {
  const {
    showAdvancedFilters,
    toggleFilters,
    filters,
    setFilters,
  } = useMusicSearchStore()

  const handleMoodSelect = (mood: string) => {
    const currentMoods = filters.moods || []
    const newMoods = currentMoods.includes(mood)
      ? currentMoods.filter(m => m !== mood)
      : [...currentMoods, mood]
    setFilters({ moods: newMoods.length > 0 ? newMoods : undefined })
  }

  const handleGenreSelect = (genre: string) => {
    const currentGenres = filters.genres || []
    const newGenres = currentGenres.includes(genre)
      ? currentGenres.filter(g => g !== genre)
      : [...currentGenres, genre]
    setFilters({ genres: newGenres.length > 0 ? newGenres : undefined })
  }

  const handleEraSelect = (era: string) => {
    const currentEras = filters.eras || []
    const newEras = currentEras.includes(era)
      ? currentEras.filter(e => e !== era)
      : [...currentEras, era]
    setFilters({ eras: newEras.length > 0 ? newEras : undefined })
  }

  const handleLanguageSelect = (langCode: string) => {
    const currentLanguages = filters.languages || []
    const newLanguages = currentLanguages.includes(langCode)
      ? currentLanguages.filter(l => l !== langCode)
      : [...currentLanguages, langCode]
    setFilters({ languages: newLanguages.length > 0 ? newLanguages : undefined })
  }

  const handleSourceToggle = (source: string) => {
    const currentSources = filters.sources || ['youtube', 'spotify', 'soundcloud']
    const newSources = currentSources.includes(source)
      ? currentSources.filter(s => s !== source)
      : [...currentSources, source]

    setFilters({ sources: newSources })
  }

  const handleResetFilters = () => {
    setFilters({
      moods: undefined,
      genres: undefined,
      eras: undefined,
      languages: undefined,
      sources: ['youtube', 'spotify', 'soundcloud'],
      royalty_free_only: false,
      trending: false,
    })
  }

  const hasActiveFilters = Boolean(
    (filters.moods && filters.moods.length > 0) ||
    (filters.genres && filters.genres.length > 0) ||
    (filters.eras && filters.eras.length > 0) ||
    (filters.languages && filters.languages.length > 0) ||
    filters.royalty_free_only ||
    filters.trending
  )

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      {/* Toggle Button - Enhanced */}
      <button
        onClick={toggleFilters}
        className="
          w-full max-w-5xl mx-auto
          px-10 py-6
          bg-white/80 dark:bg-slate-800/80
          backdrop-blur-2xl
          border-2 border-slate-200/70 dark:border-slate-700/70
          rounded-2xl
          flex items-center justify-between
          text-slate-700 dark:text-slate-300
          font-bold
          hover:border-orange-500 dark:hover:border-orange-600
          hover:shadow-xl hover:shadow-orange-600/15
          hover:scale-[1.01]
          active:scale-[0.99]
          transition-all duration-300
          group
        "
        aria-expanded={showAdvancedFilters}
        aria-controls="advanced-filters-panel"
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-orange-500 rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity duration-300" />
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-blue-600/10 to-orange-500/10 group-hover:from-blue-600/20 group-hover:to-orange-500/20 transition-all duration-300">
              <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
            </div>
          </div>
          <span className="text-xl">Advanced Filters</span>
          {hasActiveFilters && (
            <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleResetFilters()
              }}
              className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
            >
              <XMarkIcon className="h-4 w-4" />
              Reset
            </button>
          )}
          {showAdvancedFilters ? (
            <ChevronUpIcon className="h-7 w-7 transition-transform duration-200 text-blue-600" />
          ) : (
            <ChevronDownIcon className="h-7 w-7 transition-transform duration-200 text-blue-600" />
          )}
        </div>
      </button>

      {/* Filters Panel - Enhanced */}
      {showAdvancedFilters && (
        <div
          id="advanced-filters-panel"
            className="
            w-full max-w-5xl mx-auto mt-4
            p-8
            bg-white/85 dark:bg-slate-800/85
            backdrop-blur-2xl
            border-2 border-slate-200/70 dark:border-slate-700/70
            rounded-2xl
            shadow-2xl shadow-orange-600/5
            animate-in slide-in-from-top-4 duration-300
          "
        >
          <div className="space-y-6">
            {/* Mood Selection - Enhanced */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-orange-500 rounded-full" />
                Mood
              </label>
              <div className="flex flex-wrap gap-2.5">
                {MOODS.map((mood) => (
                  <button
                    key={mood}
                    onClick={() => handleMoodSelect(mood)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                      ${
                        (filters.moods || []).includes(mood)
                          ? 'bg-gradient-to-r from-blue-400 to-rose-400 text-white shadow-lg shadow-blue-600/30 scale-105 hover:shadow-xl hover:shadow-blue-600/40'
                          : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-300 dark:hover:bg-slate-600/80 hover:scale-105 border border-slate-200 dark:border-slate-600'
                      }
                    `}
                  >
                    {mood}
                  </button>
                ))}
              </div>
            </div>

            {/* Genre Selection - Enhanced */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-orange-600 to-rose-500 rounded-full" />
                Genre
              </label>
              <div className="flex flex-wrap gap-2.5">
                {GENRES.slice(0, 12).map((genre) => (
                  <button
                    key={genre}
                    onClick={() => handleGenreSelect(genre)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                      ${
                        (filters.genres || []).includes(genre)
                          ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30 scale-105 hover:shadow-xl hover:shadow-orange-600/40'
                          : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-300 dark:hover:bg-slate-600/80 hover:scale-105 border border-slate-200 dark:border-slate-600'
                      }
                    `}
                  >
                    {genre}
                  </button>
                ))}
              </div>
            </div>

            {/* Era Selection - Enhanced */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                <div className="w-1 h-4 bg-gradient-to-b from-rose-600 to-blue-500 rounded-full" />
                Era
              </label>
              <div className="flex flex-wrap gap-2.5">
                {ERAS.map((era) => (
                  <button
                    key={era}
                    onClick={() => handleEraSelect(era)}
                    className={`
                      px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                      ${
                        (filters.eras || []).includes(era)
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 scale-105 hover:shadow-xl hover:shadow-rose-600/40'
                          : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-gradient-to-r hover:from-slate-200 hover:to-slate-300 dark:hover:bg-slate-600/80 hover:scale-105 border border-slate-200 dark:border-slate-600'
                      }
                    `}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* Language & Sources Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Language Selector - Enhanced */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-orange-400 rounded-full" />
                  Language
                </label>
                <div className="space-y-2">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => handleLanguageSelect(lang.code)}
                      className={`
                        w-full px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                        flex items-center gap-3
                        ${
                          (filters.languages || []).includes(lang.code)
                            ? 'bg-gradient-to-r from-blue-400 to-rose-400 text-white shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.02]'
                            : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 hover:scale-[1.01] border border-slate-200 dark:border-slate-600'
                        }
                      `}
                    >
                      <span className="font-medium">{lang.name}</span>
                      {(filters.languages || []).includes(lang.code) && (
                        <CheckIcon className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Source Toggle - Enhanced */}
              <div>
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider flex items-center gap-2">
                  <div className="w-1 h-4 bg-gradient-to-b from-orange-600 to-blue-500 rounded-full" />
                  Music Sources
                </label>
                <div className="space-y-2">
                  {SOURCES.map((source) => (
                    <button
                      key={source.id}
                      onClick={() => handleSourceToggle(source.id)}
                      className={`
                        w-full px-5 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200
                        flex items-center gap-3
                        ${
                          (filters.sources || []).includes(source.id)
                            ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30 hover:shadow-xl hover:shadow-orange-600/40 hover:scale-[1.02]'
                            : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 hover:scale-[1.01] border border-slate-200 dark:border-slate-600'
                        }
                      `}
                    >
                      <span className="font-medium">{source.name}</span>
                      {(filters.sources || []).includes(source.id) && (
                        <CheckIcon className="h-4 w-4 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Toggle Options Row - Enhanced */}
            <div className="flex flex-wrap gap-6 pt-6 border-t-2 border-slate-200/70 dark:border-slate-700/70">
              {/* Royalty-Free Only */}
              <button
                onClick={() => setFilters({ royalty_free_only: !filters.royalty_free_only })}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`
                  relative w-7 h-7 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    filters.royalty_free_only
                      ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400 bg-slate-50 dark:bg-slate-800/50'
                  }
                `}>
                  {filters.royalty_free_only && (
                    <CheckIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Royalty-free only
                </span>
              </button>

              {/* Trending This Week */}
              <button
                onClick={() => setFilters({ trending: !filters.trending })}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div className={`
                  relative w-7 h-7 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                  ${
                    filters.trending
                      ? 'bg-gradient-to-br from-pink-500 to-pink-600 border-pink-500 shadow-lg shadow-pink-500/30'
                      : 'border-slate-300 dark:border-slate-600 group-hover:border-pink-400 bg-slate-50 dark:bg-slate-800/50'
                  }
                `}>
                  {filters.trending && (
                    <CheckIcon className="h-4 w-4 text-white" />
                  )}
                </div>
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Trending this week
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Import CheckIcon
function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  )
}
