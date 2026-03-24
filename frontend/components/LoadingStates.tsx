'use client'

import React from 'react'

/**
 * Loading States Component
 * Provides shimmer loading skeletons for various UI components
 */

export function SearchBarSkeleton() {
  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search bar skeleton */}
      <div className="relative">
        <div className="w-full h-16 bg-slate-200 dark:bg-slate-700 rounded-2xl shimmer animate-pulse" />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-24 h-12 bg-slate-300 dark:bg-slate-600 rounded-xl shimmer" />
      </div>
    </div>
  )
}

export function FilterChipsSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="flex flex-wrap gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-10 w-24 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse"
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  )
}

export function SongCardSkeleton() {
  return (
    <div className="p-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
      <div className="flex items-center gap-4">
        {/* Thumbnail skeleton */}
        <div className="w-20 h-20 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer animate-pulse flex-shrink-0" />

        {/* Song info skeleton */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-5 w-3/4 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
          <div className="h-4 w-1/2 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-6 w-20 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse" />
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
          </div>
        </div>

        {/* Actions skeleton */}
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse" />
          <div className="w-20 h-10 bg-slate-200 dark:bg-slate-700 rounded-xl shimmer animate-pulse" />
        </div>
      </div>
    </div>
  )
}

export function ResultsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <SongCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function PlaylistPreviewSkeleton() {
  return (
    <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-xl">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-32 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
        <div className="h-6 w-6 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse" />
      </div>

      {/* Song list skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-lg shimmer animate-pulse" />
            <div className="flex-1 space-y-1">
              <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
              <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
            </div>
            <div className="w-6 h-6 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse" />
          </div>
        ))}
      </div>

      {/* CTA button skeleton */}
      <div className="mt-4 h-12 w-full bg-slate-200 dark:bg-slate-700 rounded-xl shimmer animate-pulse" />
    </div>
  )
}

export function SuggestionsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl z-50">
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700"
          >
            <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full shimmer animate-pulse" />
            <div className="flex-1 h-4 bg-slate-200 dark:bg-slate-700 rounded shimmer animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Inline loading spinner
 */
export function LoadingSpinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }

  return (
    <div
      className={`${sizeClasses[size]} border-slate-200 dark:border-slate-700 border-t-primary-500 rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

/**
 * Full page loading state
 */
export function FullPageLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <LoadingSpinner size="lg" />
      <p className="text-slate-600 dark:text-slate-400 text-lg font-medium animate-pulse">
        Loading...
      </p>
    </div>
  )
}
