'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { XMarkIcon, MusicalNoteIcon, PlayIcon, ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/outline'
import { usePlaylistStore } from '@/lib/store'
import { formatDuration } from '@/lib/api/music'
import { CreatePlaylistModal } from '@/components/CreatePlaylistModal'

/**
 * Playlist Preview Component
 * Features:
 * - Desktop: Inline panel in right column
 * - Mobile: Bottom sheet (collapsed/expanded)
 * - Compact card layout with duration inline with artist
 * - Shows selected song count: "5/20 songs selected"
 * - Mini player: Hover to preview any selected song
 * - Quick remove: X button on each song
 * - Total duration display
 * - "Create Playlist" CTA always visible
 * - Smooth slide-in animation when first song added
 */

export function PlaylistPreview() {
  const router = useRouter()
  const { selectedSongs, removeSong } = usePlaylistStore()
  const [isMobileExpanded, setIsMobileExpanded] = useState(false)
  const [previewingSongId, setPreviewingSongId] = useState<string | null>(null)
  const [audioRef, setAudioRef] = useState<HTMLAudioElement | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [loadingSongId, setLoadingSongId] = useState<string | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const totalDuration = selectedSongs.reduce((acc, song) => acc + (song.duration || 0), 0)
  const hasSongs = selectedSongs.length > 0

  // Handle create playlist success
  const handleCreateSuccess = (playlistId: number) => {
    // Clear all selected songs
    selectedSongs.forEach(song => removeSong(song.source_id))

    // Redirect to playlist detail page
    router.push(`/playlist/${playlistId}`)
  }



  const handleSongRemove = (sourceId: string) => {
    removeSong(sourceId)
    if (previewingSongId === sourceId) {
      setPreviewingSongId(null)
      if (audioRef) {
        audioRef.pause()
        setIsPlaying(false)
      }
    }
    if (loadingSongId === sourceId) {
      setLoadingSongId(null)
    }
  }

  const handlePreview = async (sourceId: string, source: string, audioUrl: string) => {
    // Nếu đang preview bài này → pause
    if (previewingSongId === sourceId && isPlaying) {
      if (audioRef) {
        audioRef.pause()
        setIsPlaying(false)
      }
      return
    }

    // Nếu đang preview bài khác → dừng và play bài mới
    if (audioRef && previewingSongId !== sourceId) {
      audioRef.pause()
    }

    // Show loading NGAY lập tức khi click
    setLoadingSongId(sourceId)
    setIsPlaying(false)

    // Check cache trước (localStorage để lần sau instant)
    const cacheKey = `audio_url_${source}_${sourceId}`
    const cachedUrl = localStorage.getItem(cacheKey)

    const playAudio = (url: string) => {
      const audio = new Audio(url)
      audio.crossOrigin = "anonymous"
      setAudioRef(audio)

      audio.play().then(() => {
        setPreviewingSongId(sourceId)
        setIsPlaying(true)
        setLoadingSongId(null) // Clear loading state
        // Cache URL for next time
        try {
          localStorage.setItem(cacheKey, url)
        } catch (e) {
          console.warn('Failed to cache audio URL:', e)
        }
      }).catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
        setLoadingSongId(null) // Clear loading state on error
      })

      // Auto-stop khi kết thúc
      audio.addEventListener('ended', () => {
        setPreviewingSongId(null)
        setIsPlaying(false)
      })

      // Auto-stop khi error
      audio.addEventListener('error', () => {
        console.error('Audio playback error')
        setIsPlaying(false)
        setLoadingSongId(null) // Clear loading state on error
      })
    }

    // Nếu có cache → play ngay (vẫn có loading vì audio cần time để load)
    if (cachedUrl) {
      // Add small delay to ensure loading state shows
      setTimeout(() => playAudio(cachedUrl), 100)
      return
    }

    // Không có cache → stream audio directly from backend (bypass CORS)
    try {
      // Use the stream-audio endpoint which returns audio data directly
      const streamUrl = `http://localhost:8899/api/music/stream-audio/${source}/${sourceId}`
      playAudio(streamUrl)

    } catch (error) {
      console.error('Failed to stream audio:', error)
      setIsPlaying(false)
      setLoadingSongId(null) // Clear loading state on error
    }
  }

  return (
    <>
      {/* Desktop: Inline Panel in Right Column */}
      <div className="hidden lg:block w-full h-full">
        <div className="
          bg-white/95 dark:bg-slate-900/95
          backdrop-blur-2xl
          border-2 border-slate-200/50 dark:border-slate-700/50
          rounded-3xl
          shadow-2xl
          flex flex-col
          sticky top-28
          max-h-full
        ">
          {/* Header - Enhanced */}
          <div className="p-4 border-b border-slate-200/50 dark:border-slate-700/50 text-left">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">Playlist</h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                  {selectedSongs.length}/20 songs
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-br from-orange-50 to-rose-50 dark:from-orange-950/50 dark:to-rose-950/50 rounded-lg border border-orange-200 dark:border-orange-800">
                <svg className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {selectedSongs.length}/20
                </span>
              </div>
            </div>
          </div>

          {/* Song List - Compact Cards */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {!hasSongs? (
              <div className="text-center py-10">
                <MusicalNoteIcon className="h-12 w-12 mx-auto text-slate-400" />
                <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
                  No songs selected yet
                </p>
              </div>
            ) : null}

            {selectedSongs.map((song, index) => (
              <div
                key={song.source_id}
                className="
                  group relative p-3 rounded-xl
                  bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50
                  hover:from-orange-50/50 hover:to-rose-50/50 dark:hover:from-orange-950/30 dark:hover:to-rose-950/30
                  border border-slate-200/50 dark:border-slate-700/50
                  hover:border-orange-300/50 dark:hover:border-orange-700/50
                  transition-all duration-200
                  hover:scale-[1.01]
                "
              >
                <div className="flex items-center gap-2">
                  {/* Play/Pause Button */}
                  <button
                    onClick={() => song.source && handlePreview(song.source_id, song.source, song.audio_url || '')}
                    className={`
                      flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-md transition-all duration-200
                      bg-orange-500 hover:bg-orange-600 hover:shadow-lg hover:scale-110 active:scale-95
                    `}
                    aria-label="Preview song"
                  >
                    {loadingSongId === song.source_id ? (
                      // Loading spinner
                      <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : previewingSongId === song.source_id && isPlaying ? (
                      <PauseIcon className="h-4 w-4" />
                    ) : (
                      <PlayIcon className="h-4 w-4 ml-0.5" />
                    )}
                  </button>

                  {/* Song Info - Compact */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate leading-tight">
                      {song.title}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                        {song.artist || 'Unknown Artist'}
                      </p>
                      {song.duration && (
                        <>
                          <span className="text-slate-400 dark:text-slate-600">•</span>
                          <p className="text-xs font-medium text-slate-500 dark:text-slate-500">
                            {formatDuration(song.duration)}
                          </p>
                        </>
                      )}
                    </div>
                  </div>

                  {/* RF Badge & Remove */}
                  <div className="flex items-center gap-1.5">
                    {song.is_royalty_free && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm flex-shrink-0">
                        RF
                      </span>
                    )}
                    <button
                      onClick={() => handleSongRemove(song.source_id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 active:scale-95 flex-shrink-0"
                      aria-label="Remove song"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer with Total Duration & CTA */}
          <div className="p-4 border-t border-slate-200/50 dark:border-slate-700/50 space-y-3">
            {/* Total Duration */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Total:</span>
              <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {formatDuration(totalDuration)}
              </span>
            </div>

            {/* Create Playlist CTA */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="
                w-full px-5 py-3
                bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500
                bg-[length:200%_200%]
                text-white font-bold rounded-xl
                shadow-lg shadow-orange-500/30
                hover:shadow-xl hover:shadow-orange-500/40
                hover:scale-[1.02]
                hover:bg-[position:100%_0]
                active:scale-[0.98]
                transition-all duration-300
                flex items-center justify-center gap-2
              "
              aria-label="Create playlist with selected songs"
            >
              <MusicalNoteIcon className="h-4 w-4" />
              <span className="text-sm">Create Playlist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile: Bottom Sheet - Enhanced */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        {/* Collapsed Bar - Enhanced */}
        {!isMobileExpanded && (
          <button
            onClick={() => setIsMobileExpanded(true)}
            className="
              w-full px-5 py-4
              bg-white/95 dark:bg-slate-900/95
              backdrop-blur-2xl
              border-t-2 border-slate-200/50 dark:border-slate-700/50
              shadow-2xl
              flex items-center justify-between
              hover:bg-white dark:hover:bg-slate-900
              transition-all duration-200
            "
            aria-label="Expand playlist preview"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                <MusicalNoteIcon className="h-6 w-6" />
              </div>
              <div className="text-left space-y-1">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  {selectedSongs.length} songs selected
                </p>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {formatDuration(totalDuration)}
                </p>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              <ChevronUpIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
            </div>
          </button>
        )}

        {/* Expanded Bottom Sheet - Enhanced */}
        {isMobileExpanded && (
          <div
            className="
              fixed inset-x-0 bottom-0 top-20
              bg-white/95 dark:bg-slate-900/95
              backdrop-blur-2xl
              border-t-2 border-slate-200/50 dark:border-slate-700/50
              shadow-2xl
              rounded-t-3xl
              animate-in slide-in-from-bottom-4 duration-300
              flex flex-col
            "
          >
            {/* Header - Enhanced */}
            <div className="p-5 border-b border-slate-200/50 dark:border-slate-700/50 text-left">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100">Playlist</h3>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    {selectedSongs.length}/20 songs • {formatDuration(totalDuration)}
                  </p>
                </div>
                <button
                  onClick={() => setIsMobileExpanded(false)}
                  className="p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110 active:scale-95"
                  aria-label="Collapse playlist"
                >
                  <ChevronDownIcon className="h-6 w-6 text-slate-600 dark:text-slate-400" />
                </button>
              </div>
            </div>

            {/* Song List - Enhanced */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {selectedSongs.map((song) => (
                <div
                  key={song.source_id}
                  className="
                    p-4 rounded-2xl
                    bg-gradient-to-br from-slate-50 to-slate-100/50 dark:from-slate-900/50 dark:to-slate-800/50
                    border border-slate-200/50 dark:border-slate-700/50
                    transition-all duration-200
                  "
                >
                  <div className="flex items-center gap-3">
                    {/* Play/Pause Button - Enhanced */}
                    <button
                      onClick={() => song.source && handlePreview(song.source_id, song.source, song.audio_url || '')}
                      className={`
                        w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg transition-all duration-200 flex-shrink-0
                        bg-orange-500 hover:bg-orange-600 hover:shadow-xl hover:scale-110 active:scale-95
                      `}
                      aria-label="Preview song"
                    >
                      {loadingSongId === song.source_id ? (
                        // Loading spinner
                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : previewingSongId === song.source_id && isPlaying ? (
                        <PauseIcon className="h-5 w-5" />
                      ) : (
                        <PlayIcon className="h-5 w-5 ml-0.5" />
                      )}
                    </button>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <p className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {song.title}
                      </p>
                      <p className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
                        {song.artist || 'Unknown Artist'}
                      </p>
                    </div>

                    {/* Remove Button - Enhanced */}
                    <button
                      onClick={() => handleSongRemove(song.source_id)}
                      className="p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 active:scale-95"
                      aria-label="Remove song"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Create Playlist CTA - Enhanced */}
            <div className="p-5 border-t border-slate-200/50 dark:border-slate-700/50">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="
                  w-full px-7 py-4
                  bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500
                  bg-[length:200%_200%]
                  text-white font-bold rounded-2xl
                  shadow-xl shadow-orange-500/30
                  hover:shadow-2xl hover:shadow-orange-500/40
                  hover:scale-[1.02]
                  hover:bg-[position:100%_0]
                  active:scale-[0.98]
                  transition-all duration-300
                  flex items-center justify-center gap-2.5
                "
                aria-label="Create playlist with selected songs"
              >
                <MusicalNoteIcon className="h-5 w-5" />
                <span className="text-base">Create Playlist</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        songs={selectedSongs}
        onSuccess={handleCreateSuccess}
      />
    </>
  )
}

// Import PauseIcon
function PauseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6" />
    </svg>
  )
}
