'use client'

import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { usePlaylistStore } from '@/lib/store'
import { AIMusicSearch } from '@/components/AIMusicSearch'
import { SongResultCard, SongResultCardSkeleton } from '@/components/SongResultCard'
import { PlaylistPreview } from '@/components/PlaylistPreview'
import { useMusicSearchStore } from '@/lib/store'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'

/**
 * Create Playlist Page - Natural Language First Search Experience
 *
 * Features:
 * - Single-page experience (no more steps)
 * - Hero section with large, centered search bar
 * - Natural language as primary, filters as secondary
 * - Real-time AI suggestions as user types
 * - Results appear below search bar (infinite scroll)
 * - Floating playlist preview on right (desktop) or bottom (mobile)
 * - Collapsible advanced filters panel
 */

// Detect language from query text
function detectLanguage(query: string): string {
  const vietnameseRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i
  const koreanRegex = /[ㄱ-ㅣ가-힣]/

  if (vietnameseRegex.test(query)) return 'vi'
  if (koreanRegex.test(query)) return 'ko'
  if (/[\u0400-\u04FF]/.test(query)) return 'ru' // Cyrillic (Russian)
  if (/[\u0600-\u06FF]/.test(query)) return 'ar' // Arabic
  if (/[\u4E00-\u9FFF]/.test(query)) return 'zh' // Chinese
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(query)) return 'ja' // Japanese
  if (/[ñáéíóúü]/i.test(query)) return 'es' // Spanish

  // Default to English
  return 'en'
}

export default function CreatePlaylistPage() {
  const t = useTranslations('create')
  const { selectedSongs, addSong, removeSong, updateSongAudioUrl } = usePlaylistStore()
  const { searchResults, isSearching, searchError, searchQuery, setSearchResults, setSearchError } = useMusicSearchStore()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentSearchQuery, setCurrentSearchQuery] = useState('')

  // Store current search query when results change
  useEffect(() => {
    if (searchQuery && searchQuery !== currentSearchQuery) {
      setCurrentSearchQuery(searchQuery)
    }
  }, [searchQuery, currentSearchQuery])

  const handleLoadMore = async () => {
    if (isLoadingMore || isSearching || !currentSearchQuery) return

    setIsLoadingMore(true)

    try {
      const detectedLang = detectLanguage(currentSearchQuery)
      const response = await fetch('http://localhost:8899/api/music/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: currentSearchQuery,
          language: detectedLang,
          limit: 10,
          sources: ['youtube', 'soundcloud', 'deezer'],
          royalty_free_only: false,
          trending: false,
          offset: searchResults.length
        })
      })

      const data = await response.json()

      if (data.songs && data.songs.length > 0) {
        setSearchResults([...searchResults, ...data.songs])
      }
    } catch (error) {
      console.error('Load more error:', error)
      setSearchError('Failed to load more songs')
    } finally {
      setIsLoadingMore(false)
    }
  }

  const handleToggleSong = async (song: any) => {
    const isSelected = selectedSongs.some((s) => s.source_id === song.source_id)
    if (isSelected) {
      removeSong(song.source_id)
    } else {
      if (selectedSongs.length < 20) {
        // Add song to playlist first
        addSong(song)

        // Fetch audio URL in background for instant playback later
        if (song.source === 'youtube' || song.source === 'soundcloud') {
          fetchAudioUrl(song.source, song.source_id)
        }
      }
    }
  }

  // Fetch audio URL in background when song is selected
  const fetchAudioUrl = async (source: string, sourceId: string) => {
    try {
      // Use the stream-audio endpoint URL (no need to call preview anymore)
      const streamUrl = `http://localhost:8899/api/music/stream-audio/${source}/${sourceId}`

      // Update the song in the store with the streaming URL
      updateSongAudioUrl(sourceId, streamUrl)

      // Cache in localStorage for instant playback
      const cacheKey = `audio_url_${source}_${sourceId}`
      try {
        localStorage.setItem(cacheKey, streamUrl)
      } catch (e) {
        console.warn('Failed to cache audio URL:', e)
      }

      console.log(`Pre-fetched stream URL for ${source}:${sourceId}`)
    } catch (error) {
      console.error(`Failed to fetch audio URL for ${source}:${sourceId}:`, error)
    }
  }

  const isSongSelected = (sourceId: string) => {
    return selectedSongs.some((s) => s.source_id === sourceId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative">
        {/* Hero Section with Search Bar & Results */}
        <section className="min-h-screen px-4 pt-10 pb-6 hero-section justify-center relativemin-h-screen px-4 pt-10 pb-6 hero-section flex items-center justify-center relative">
          {/* Animated gradient orbs */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-blue-500/25 via-blue-400/15 to-orange-500/25 rounded-full blur-3xl floating-orb" style={{ animationDelay: '0s' }} />
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-orange-500/25 via-orange-400/15 to-rose-500/25 rounded-full blur-3xl floating-orb" style={{ animationDelay: '5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-rose-500/25 via-rose-400/15 to-blue-500/25 rounded-full blur-3xl floating-orb" style={{ animationDelay: '10s' }} />          
        
          <div className="w-full max-w-7xl mx-auto text-center relative z-10">
            {/* Title - Compact */}
            <div className="mb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent leading-tight mb-4">
                {t('heroTitle')}
              </h1>
              <p className="text-base md:text-lg font-semibold text-slate-600 dark:text-slate-400">
                {t('heroSubtitle')}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-rose-500 font-bold">{t('heroSubtitleHighlight')}</span>{' '}
                {t('heroSubtitleEnd')}{' '}
                <span className="text-orange-600 dark:text-orange-400 italic">{t('heroExample')}</span>
              </p>
            </div>

            {/* AI Search Bar */}
            <div className="mb-4">
              <AIMusicSearch />
            </div>

            {/* Main Content Area - Always 2-column grid on desktop */}
            {/* show if playlist item.length > ) or search results lenght > 0 */}
            {(searchResults.length > 0 || selectedSongs.length > 0) && (
              <div className="w-full mt-20">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  {/* Left Column: Search Results (8 cols) */}
                  <div className="lg:col-span-8">
                    {/* Loading State */}
                    {isSearching && (
                      <div className="space-y-3 pt-3">
                        <ResultsSkeleton />
                      </div>
                    )}

                    {/* Error State */}
                    {searchError && !isSearching && (
                      <div className="max-w-xl mx-auto mt-6 p-6 bg-white dark:bg-slate-800 border-2 border-red-200 dark:border-red-800 rounded-2xl shadow-xl shadow-red-600/10 animate-in fade-in duration-300 ">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
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
                    )}

                    {/* Results */}
                    {!isSearching && !searchError && searchResults.length > 0 && (
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
                              onSelect={() => handleToggleSong(song)}
                              index={index}
                            />
                          ))}
                        </div>

                        {/* Load More Button */}
                        <div className="flex justify-center pt-6">
                          <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore || isSearching || !currentSearchQuery}
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
                    )}
                  </div>

                  {/* Right Column: Playlist Preview (4 cols) - Always visible on desktop */}
                  <div className="hidden lg:block lg:col-span-4">
                    <div className="sticky top-28 h-[calc(100vh-8rem)]">
                      <PlaylistPreview />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
       
        </section>

        {/* Mobile Playlist Preview */}
        <div className="lg:hidden">
          <PlaylistPreview />
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

/**
 * Results Loading Skeleton
 */
function ResultsSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SongResultCardSkeleton key={i} />
      ))}
    </div>
  )
}
