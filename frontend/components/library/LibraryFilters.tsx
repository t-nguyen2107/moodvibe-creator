'use client'

import React from 'react'
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, FunnelIcon } from '@heroicons/react/24/outline'

export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc' | 'songs'
export type FilterMood = 'all' | 'chill' | 'energetic' | 'happy' | 'sad' | 'romantic' | 'focus'

interface LibraryFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
  filterMood: FilterMood
  onFilterMoodChange: (mood: FilterMood) => void
  showFilters: boolean
  onToggleFilters: () => void
}

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name (A-Z)' },
  { value: 'name-desc', label: 'Name (Z-A)' },
  { value: 'songs', label: 'Most Songs' },
]

const moodOptions: { value: FilterMood; label: string; color: string }[] = [
  { value: 'all', label: 'All Moods', color: 'from-slate-500 to-slate-600' },
  { value: 'chill', label: 'Chill', color: 'from-blue-500 to-cyan-500' },
  { value: 'energetic', label: 'Energetic', color: 'from-orange-500 to-red-500' },
  { value: 'happy', label: 'Happy', color: 'from-yellow-500 to-amber-500' },
  { value: 'sad', label: 'Sad', color: 'from-blue-600 to-indigo-600' },
  { value: 'romantic', label: 'Romantic', color: 'from-pink-500 to-rose-500' },
  { value: 'focus', label: 'Focus', color: 'from-emerald-500 to-teal-500' },
]

export function LibraryFilters({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  filterMood,
  onFilterMoodChange,
  showFilters,
  onToggleFilters,
}: LibraryFiltersProps) {
  return (
    <div className="px-4 pt-6 pb-2">
      <div className="container mx-auto max-w-7xl">
        {/* Search and Sort Bar */}
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search playlists..."
              className="
                w-full pl-12 pr-4 py-3
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                rounded-xl
                text-slate-900 dark:text-slate-100
                placeholder:text-slate-400
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                transition-all duration-200
              "
            />
          </div>

          {/* Sort Dropdown */}
          <div className="md:w-64">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as SortOption)}
              className="
                w-full px-4 py-3
                bg-white dark:bg-slate-900
                border border-slate-200 dark:border-slate-700
                rounded-xl
                text-slate-900 dark:text-slate-100
                focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                transition-all duration-200
                appearance-none
                cursor-pointer
              "
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={onToggleFilters}
            className={`
              px-6 py-3
              rounded-xl
              font-semibold text-sm
              transition-all duration-200
              flex items-center justify-center gap-2
              ${
                showFilters
                  ? 'bg-gradient-to-r from-cyan-500 to-magenta-500 text-white'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-cyan-300 dark:hover:border-cyan-600'
              }
            `}
          >
            <AdjustmentsHorizontalIcon className="h-5 w-5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Filter Options */}
        {showFilters && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-3">
              <FunnelIcon className="h-4 w-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Filter by Mood:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {moodOptions.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => onFilterMoodChange(mood.value)}
                  className={`
                    px-4 py-2 rounded-lg
                    font-semibold text-sm
                    transition-all duration-200
                    ${
                      filterMood === mood.value
                        ? `bg-gradient-to-r ${mood.color} text-white shadow-lg scale-105`
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                    }
                  `}
                >
                  {mood.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
