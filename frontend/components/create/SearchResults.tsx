'use client'

import React from 'react'
import { SongResultCard, SongResultCardSkeleton } from '@/components/SongResultCard'
import { useTranslations } from 'next-intl'
import { ExclamationCircleIcon } from '@heroicons/react/24/outline'

interface SearchResultsProps {
  isSearching: boolean
  searchError: string | null
  searchResults: any[]
  isLoadingMore: boolean
  onLoadMore: () => void
  onSongClick: (song: any) => void
  isSongSelected: (sourceId: string) => boolean
}

export function SearchResults({
  isSearching,
  searchError,
  searchResults,
  isLoadingMore,
  onLoadMore,
  onSongClick,
  isSongSelected
}: SearchResultsProps) {
  const t = useTranslations('search')

  if (isSearching) {
    return <ResultsSkeleton />
  }

  if (searchError && !isSearching) {
    return (
      <div className="max-w-xl mx-auto mt-6 p-6 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-xl shadow-red-600/10 animate-in fade-in duration-300">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
            <ExclamationCircleIcon className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg text-red-900 dark:text-red-400 mb-2">Search Error</h3>
            <p className="text-sm text-red-700 dark:text-red-300 mb-4">{searchError}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-rose-500 text-white font-semibold rounded-xl shadow-md shadow-red-500/30 hover:shadow-lg hover:shadow-red-500/40 hover:scale-105 active:scale-95 transition-all duration-200 text-sm"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!isSearching && !searchError && searchResults.length > 0) {
    return (
      <div className="space-y-5">
        {/* Results Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              {t('searchResults')}
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
              {t('songsFound', { count: searchResults.length })}
            </p>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-3">
          {searchResults.map((song, index) => (
            <SongResultCard
              key={song.source_id}
              song={song}
              isSelected={isSongSelected(song.source_id)}
              onSelect={() => onSongClick(song)}
              index={index}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center pt-6">
          <button
            onClick={onLoadMore}
            disabled={isLoadingMore || isSearching}
            className="
              px-7 py-3
              bg-white dark:bg-slate-800
              border-2 border-slate-200 dark:border-slate-700
              rounded-xl
              font-bold text-sm text-slate-700 dark:text-slate-300
              hover:border-orange-400 dark:hover:border-orange-600
              hover:shadow-lg hover:shadow-orange-600/10
              hover:scale-105
              active:scale-95
              transition-all duration-200
              flex items-center gap-2
              disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
            "
          >
            {isLoadingMore ? (
              <>
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('loading')}
              </>
            ) : (
              <>
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {t('loadMore')}
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  return null
}

function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SongResultCardSkeleton key={i} />
      ))}
    </div>
  )
}
