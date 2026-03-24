'use client'

import React, { useEffect } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useMusicSearchStore } from '@/lib/store'

/**
 * Advanced Filters Popup Component
 * Modal popup for advanced filters with backdrop blur
 */

interface AdvancedFiltersPopupProps {
  isOpen: boolean
  onClose: () => void
}

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
  { id: 'deezer', name: 'Deezer' },
]

export function AdvancedFiltersPopup({ isOpen, onClose }: AdvancedFiltersPopupProps) {
  const { filters, setFilters } = useMusicSearchStore()

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

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
    const currentSources = filters.sources || ['youtube', 'spotify', 'soundcloud', 'deezer']
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
      sources: ['youtube', 'spotify', 'soundcloud', 'deezer'],
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[85vh] overflow-hidden bg-white dark:bg-slate-900 rounded-3xl shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-8 py-6 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              Advanced Filters
            </h2>
            {hasActiveFilters && (
              <span className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-full shadow-lg shadow-emerald-500/30">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="text-sm font-semibold text-slate-500 hover:text-red-500 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/30"
              >
                <XMarkIcon className="h-4 w-4" />
                Reset All
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <XMarkIcon className="h-6 w-6 text-slate-500" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto max-h-[calc(85vh-100px)] p-8 space-y-8">
          {/* Mood Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
              Mood
            </label>
            <div className="flex flex-wrap gap-2.5">
              {MOODS.map((mood) => (
                <button
                  key={mood}
                  onClick={() => handleMoodSelect(mood)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${
                      (filters.moods || []).includes(mood)
                        ? 'bg-gradient-to-r from-blue-400 to-rose-400 text-white shadow-lg shadow-blue-600/30 scale-105'
                        : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600'
                    }
                  `}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          {/* Genre Selection */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
              Genre
            </label>
            <div className="flex flex-wrap gap-2.5">
              {GENRES.slice(0, 12).map((genre) => (
                <button
                  key={genre}
                  onClick={() => handleGenreSelect(genre)}
                  className={`
                    px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${
                      (filters.genres || []).includes(genre)
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30 scale-105'
                        : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600'
                    }
                  `}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Era & Language Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Era Selection */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                Era
              </label>
              <div className="flex flex-wrap gap-2.5">
                {ERAS.map((era) => (
                  <button
                    key={era}
                    onClick={() => handleEraSelect(era)}
                    className={`
                      px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                      ${
                        (filters.eras || []).includes(era)
                          ? 'bg-gradient-to-r from-rose-600 to-rose-700 text-white shadow-lg shadow-rose-600/30 scale-105'
                          : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600'
                      }
                    `}
                  >
                    {era}
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector */}
            <div>
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
                Language
              </label>
              <div className="space-y-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => handleLanguageSelect(lang.code)}
                    className={`
                      w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      flex items-center gap-3
                      ${
                        (filters.languages || []).includes(lang.code)
                          ? 'bg-gradient-to-r from-blue-400 to-rose-400 text-white shadow-lg shadow-blue-600/30'
                          : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600'
                      }
                    `}
                  >
                    <span className="font-medium">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sources */}
          <div>
            <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4 uppercase tracking-wider">
              Music Sources
            </label>
            <div className="space-y-2">
              {SOURCES.map((source) => (
                <button
                  key={source.id}
                  onClick={() => handleSourceToggle(source.id)}
                  className={`
                    w-full px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                    flex items-center gap-3
                    ${
                      (filters.sources || []).includes(source.id)
                        ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg shadow-orange-600/30'
                        : 'bg-slate-100/80 dark:bg-slate-700/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200/80 dark:hover:bg-slate-600/80 border border-slate-200 dark:border-slate-600'
                    }
                  `}
                >
                  <span className="font-medium">{source.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="flex flex-wrap gap-6 pt-6 border-t-2 border-slate-200/70 dark:border-slate-700/70">
            {/* Royalty-Free Only */}
            <button
              onClick={() => setFilters({ royalty_free_only: !filters.royalty_free_only })}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className={`
                relative w-6 h-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                ${
                  filters.royalty_free_only
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-500 shadow-lg shadow-emerald-500/30'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                }
              `}>
                {filters.royalty_free_only && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Royalty-free only
              </span>
            </button>

            {/* Trending This Week */}
            <button
              onClick={() => setFilters({ trending: !filters.trending })}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className={`
                relative w-6 h-6 rounded-xl border-2 transition-all duration-200 flex items-center justify-center
                ${
                  filters.trending
                    ? 'bg-gradient-to-br from-pink-500 to-pink-600 border-pink-500 shadow-lg shadow-pink-500/30'
                    : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50'
                }
              `}>
                {filters.trending && (
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Trending this week
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
