'use client'

import React, { useState } from 'react'
import { PlayIcon, PauseIcon, CheckIcon, MusicalNoteIcon } from '@heroicons/react/24/outline'
import { Song } from '@/lib/store'
import { formatDuration, formatListenerCount, getTrendingBadgeColor, getTrendingBadgeLabel } from '@/lib/api/music'

/**
 * Song Result Card Component
 * Features:
 * - Album art (80x80px) with play/pause overlay
 * - Song info (title, artist, metadata)
 * - Trending badges (gold/silver/bronze, viral)
 * - Hover effects (scale 1.02, shadow increase)
 * - Selected state (gradient border, checkmark)
 * - Audio preview button
 * - Smooth transitions (300ms)
 */

interface SongResultCardProps {
  song: Song
  isSelected: boolean
  onSelect: () => void
  onPreview?: () => void
  index?: number
}

export function SongResultCard({ song, isSelected, onSelect, onPreview, index = 0 }: SongResultCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handlePreviewClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onPreview) {
      setIsPlaying(!isPlaying)
      onPreview()
    }
  }

  const handleCardClick = () => {
    onSelect()
  }

  return (
    <div
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`
        relative p-5 rounded-2xl border-2 cursor-pointer
        transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1)
        transform-gpu
        ${
          isSelected
            ? 'bg-orange-50 dark:bg-orange-950/50 border-orange-500 shadow-md'
            : 'bg-white/90 dark:bg-slate-800/90 border-slate-200/60 dark:border-slate-700/60 hover:border-orange-400 dark:hover:border-orange-600 hover:shadow-lg hover:scale-[1.01] hover:bg-white dark:hover:bg-slate-800'
        }
      `}
      style={{
        transitionDelay: `${index * 30}ms`,
      }}
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleCardClick()
        }
      }}
    >
      <div className="flex items-center gap-5">
        {/* Album Art with Play/Pause Overlay - Larger (120x120px) */}
        <div className="relative w-28 h-28 flex-shrink-0">
          {/* Album Art Container - Giữ nguyên border khi selected */}
          <div className={`
            w-full h-full rounded-2xl overflow-hidden shadow-lg
            ring-1 ring-slate-200 dark:ring-slate-700
            transition-all duration-300
          `}>
            {song.thumbnail_url ? (
              <img
                src={song.thumbnail_url}
                alt={song.title}
                className="w-full h-full object-cover"
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-slate-100 via-slate-200 to-slate-300 dark:from-slate-700 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
                <MusicalNoteIcon className="h-12 w-12 text-slate-400 dark:text-slate-500" />
              </div>
            )}
          </div>

          {/* Play/Pause Overlay - Enhanced */}
          {onPreview && (
            <button
              onClick={handlePreviewClick}
              className={`
                absolute inset-0 flex items-center justify-center
                bg-black/50 backdrop-blur-md rounded-2xl
                transition-all duration-300
                ${isHovered || isPlaying ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}
              `}
              aria-label={isPlaying ? 'Pause preview' : 'Play preview'}
            >
              <div className={`
                w-14 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl
                transition-transform duration-300
                ${isHovered ? 'scale-110' : 'scale-100'}
              `}>
                {isPlaying ? (
                  <PauseIcon className="h-7 w-7 text-slate-900 dark:text-slate-100" />
                ) : (
                  <PlayIcon className="h-7 w-7 text-slate-900 dark:text-slate-100 ml-1" />
                )}
              </div>
            </button>
          )}
        </div>

        {/* Song Info - Enhanced Typography */}
        <div className="flex-1 min-w-0 space-y-2 text-left">
          {/* Title + Rank Badge Row */}
          <div className="flex items-center gap-2">
            {/* Title */}
            <h3 className={`
              font-bold text-base truncate leading-tight text-left flex-1
              ${isSelected ? 'text-slate-900 dark:text-slate-100' : 'text-slate-900 dark:text-slate-100'}
            `}>
              {song.title}
            </h3>

            {/* AI Rank Badge (Top 3) - Premium Styling */}
            {song.rank_position && song.rank_position <= 3 && (
              <span
                className={`
                  flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md
                  ${
                    song.rank_position === 1
                      ? 'bg-gradient-to-br from-yellow-300 via-yellow-400 to-amber-400 text-yellow-900 border border-yellow-300'
                      : song.rank_position === 2
                      ? 'bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-700 border border-slate-300'
                      : 'bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-amber-900 border border-amber-500'
                  }
                  ${isHovered ? 'scale-105' : 'scale-100'}
                  transition-transform duration-200
                `}
              >
                {song.rank_position === 1 && '🥇'}
                {song.rank_position === 2 && '🥈'}
                {song.rank_position === 3 && '🥉'}
                <span>#{song.rank_position}</span>
              </span>
            )}
          </div>

          {/* Artist + Duration + Source Row */}
          <div className="flex items-center gap-2 flex-wrap text-left">
            {/* Artist */}
            <p className={`
              text-xs font-medium truncate
              ${isSelected ? 'text-slate-600 dark:text-slate-400' : 'text-slate-600 dark:text-slate-400'}
            `}>
              {song.artist || 'Unknown Artist'}
            </p>

            {/* Duration */}
            {song.duration && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 flex-shrink-0">
                • {formatDuration(song.duration)}
              </span>
            )}

            {/* Source Badge */}
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 capitalize border border-slate-200 dark:border-slate-700 flex-shrink-0">
              {song.source}
            </span>

            {/* Trending Badge */}
            {song.trending_rank && song.trending_rank <= 50 && (
              <span
                className={`
                  text-xs font-semibold px-2 py-0.5 rounded-full border flex-shrink-0
                  ${getTrendingBadgeColor(song.trending_rank)}
                `}
              >
                {getTrendingBadgeLabel(song.trending_rank)}
              </span>
            )}

            {/* Viral Badge */}
            {song.is_viral && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-500 text-white border border-pink-500 flex items-center gap-1 flex-shrink-0">
                <span>🔥</span> Viral
              </span>
            )}

            {/* Listeners Count */}
            {song.listeners_count && (
              <span className="text-xs font-medium text-slate-500 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded-full flex-shrink-0">
                {formatListenerCount(song.listeners_count)}
              </span>
            )}

            {/* Royalty Free Badge */}
            {song.is_royalty_free && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-emerald-600 dark:text-emerald-400 border border-emerald-500 dark:border-emerald-600 flex items-center gap-1 flex-shrink-0">
                <span>✓</span> RF
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Selected Checkmark - Góc dưới bên phải (bên trong card) */}
      {isSelected && (
        <div className="absolute bottom-3 right-3 w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-800 animate-in zoom-in duration-200 z-10">
          <CheckIcon className="h-3.5 w-3.5 text-white" />
        </div>
      )}

      {/* Hover Border Effect - Simple */}
      {isHovered && !isSelected && (
        <div className="absolute inset-0 rounded-2xl bg-orange-500/5 pointer-events-none -z-10 transition-opacity duration-300" />
      )}
    </div>
  )
}

/**
 * Song Result Card with Loading Skeleton
 */
export function SongResultCardSkeleton() {
  return (
    <div className="relative p-6 rounded-2xl border-2 border-slate-200/60 dark:border-slate-700/60 bg-white/90 dark:bg-slate-800/90">
      <div className="flex items-center gap-5">
        {/* Album Art Skeleton */}
        <div className="relative w-28 h-28 flex-shrink-0">
          <div className="w-full h-full rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 animate-pulse-subtle">
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-white/20 to-white/40 dark:from-white/5 dark:via-white/10 dark:to-white/5" />
          </div>
        </div>

        {/* Song Info Skeleton */}
        <div className="flex-1 min-w-0 space-y-2 text-left">
          {/* Title + Rank Badge Row */}
          <div className="flex items-center gap-2">
            {/* Title */}
            <div className="h-4 w-2/3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-lg animate-pulse-subtle relative overflow-hidden" style={{ animationDelay: '100ms' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            {/* Rank Badge */}
            <div className="h-5 w-10 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-full animate-pulse-subtle flex-shrink-0" style={{ animationDelay: '150ms' }} />
          </div>

          {/* Artist + Duration + Source + Badges Row */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Artist */}
            <div className="h-3 w-1/4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-lg animate-pulse-subtle relative overflow-hidden" style={{ animationDelay: '200ms' }}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" />
            </div>
            {/* Duration */}
            <div className="h-3 w-8 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-lg animate-pulse-subtle" style={{ animationDelay: '250ms' }} />
            {/* Source Badge */}
            <div className="h-4 w-12 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '300ms' }} />
            {/* Trending Badge */}
            <div className="h-4 w-14 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '350ms' }} />
            {/* Viral Badge */}
            <div className="h-4 w-12 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-700/30 dark:to-slate-700/50 rounded-full animate-pulse-subtle" style={{ animationDelay: '400ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
