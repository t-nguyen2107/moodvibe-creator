'use client'

import React, { useState } from 'react'
import { XMarkIcon, MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { formatDuration } from '@/lib/api/music'
import { useMusicSearchStore } from '@/lib/store'

interface Song {
  source_id: string
  title: string
  artist?: string
  source: string
  duration?: number
  audio_url?: string
  thumbnail_url?: string
  is_royalty_free?: boolean
}

interface CreatePlaylistModalProps {
  isOpen: boolean
  onClose: () => void
  songs: Song[]
  onSuccess?: (playlistId: number) => void
}

export function CreatePlaylistModal({ isOpen, onClose, songs, onSuccess }: CreatePlaylistModalProps) {
  const [playlistName, setPlaylistName] = useState('')
  const [description, setDescription] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  // Auto-detect mood and genre from songs
  const detectMoodAndGenre = (): { mood: string; genre: string } => {
    // Simple keyword-based detection from song titles
    const titleText = songs.map(s => s.title.toLowerCase()).join(' ')

    // Detect mood
    const moods: { [key: string]: string[] } = {
      'chill': ['chill', 'relax', 'acoustic', 'calm', 'peaceful', 'lo-fi', 'ambient', 'study'],
      'energetic': ['workout', 'gym', 'pump', 'energy', 'upbeat', 'party', 'dance', 'edm', 'electronic'],
      'happy': ['happy', 'joy', 'feel good', 'positive', 'uplifting', 'bright', 'sunny'],
      'sad': ['sad', 'ballad', 'emotional', 'melancholy', 'breakup', 'heartbreak', 'rain'],
      'romantic': ['love', 'romantic', 'valentine', 'sweet', 'couple'],
      'focus': ['focus', 'concentration', 'study', 'work', 'productivity']
    }

    let detectedMood = 'mixed'
    for (const [mood, keywords] of Object.entries(moods)) {
      if (keywords.some(keyword => titleText.includes(keyword))) {
        detectedMood = mood
        break
      }
    }

    // Detect genre
    const genres: { [key: string]: string[] } = {
      'pop': ['pop', 'top', 'hits', 'chart', 'viral', 'tiktok'],
      'rock': ['rock', 'metal', 'punk', 'alternative'],
      'electronic': ['edm', 'electronic', 'house', 'techno', 'dubstep', 'trap'],
      'hip_hop': ['hip hop', 'rap', 'r&b', 'rnb', 'urban'],
      'k-pop': ['k-pop', 'kpop', 'korean'],
      'classical': ['piano', 'classical', 'orchestra', 'symphony'],
      'jazz': ['jazz', 'blues', 'soul'],
      'latin': ['latin', 'reggaeton', 'spanish'],
      'indie': ['indie', 'folk', 'acoustic'],
      'ambient': ['ambient', 'chillout', 'lo-fi', 'downtempo']
    }

    let detectedGenre = 'mixed'
    for (const [genre, keywords] of Object.entries(genres)) {
      if (keywords.some(keyword => titleText.includes(keyword))) {
        detectedGenre = genre
        break
      }
    }

    return { mood: detectedMood, genre: detectedGenre }
  }

  const handleCreate = async () => {
    if (!playlistName.trim()) {
      setError('Please enter a playlist name')
      return
    }

    if (songs.length === 0) {
      setError('Please add at least one song to the playlist')
      return
    }

    setIsCreating(true)
    setError(null)

    // Auto-detect mood and genre from selected songs
    const { mood, genre } = detectMoodAndGenre()

    try {
      const response = await fetch('http://localhost:8899/api/playlists/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: playlistName.trim(),
          mood: mood,
          genre: genre,
          description: description.trim() || `Created with MoodVibe Creator - ${songs.length} songs`,
          show_song_list: true,
          songs: songs.map((song, index) => ({
            title: song.title,
            artist: song.artist,
            source: song.source,
            source_id: song.source_id,
            duration: song.duration,
            audio_url: song.audio_url || '',
            thumbnail_url: song.thumbnail_url,
            is_royalty_free: song.is_royalty_free || false
          }))
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create playlist')
      }

      const playlist = await response.json()

      if (onSuccess) {
        onSuccess(playlist.id)
      }

      onClose()
      setPlaylistName('')
      setDescription('')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create playlist')
    } finally {
      setIsCreating(false)
    }
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Animated Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-800/80 to-orange-900/80 backdrop-blur-md animate-in fade-in duration-300" />

      {/* Decorative Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-br from-orange-500/30 to-rose-500/30 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />

      {/* Modal Container */}
      <div className="relative bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-300 slide-in-from-bottom-4 border border-slate-200/50 dark:border-slate-700/50">

        {/* Header Section with Gradient Background */}
        <div className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 p-8 overflow-hidden text-left">
          {/* Decorative Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-40 h-40 border-4 border-white rounded-full -translate-x-1/2 -translate-y-1/2" />
            <div className="absolute bottom-0 right-0 w-60 h-60 border-4 border-white rounded-full translate-x-1/2 translate-y-1/2" />
          </div>

          {/* Header Content */}
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 rounded-xl hover:bg-white/20 transition-all duration-200 hover:scale-110"
              aria-label="Close"
            >
              <XMarkIcon className="h-6 w-6 text-white" />
            </button>

            <div className="flex items-center gap-4 mb-3">
              <div className="relative">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl border border-white/30">
                  <MusicalNoteIcon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 p-1.5 bg-yellow-400 rounded-full border-2 border-white shadow-lg">
                  <SparklesIcon className="h-3 w-3 text-yellow-800" />
                </div>
              </div>
              <div className="text-left">
                <h2 className="text-2xl font-black text-white">
                  Create Playlist
                </h2>
                <p className="text-sm font-medium text-white/80">
                  Save your music collection
                </p>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <MusicalNoteIcon className="h-4 w-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{songs.length}</p>
                  <p className="text-xs font-medium text-white/70">songs</p>
                </div>
              </div>
              <div className="w-px h-10 bg-white/30" />
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-white/20 rounded-lg">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-white">{formatDuration(totalDuration)}</p>
                  <p className="text-xs font-medium text-white/70">duration</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-8 space-y-6 text-left">
          {/* Playlist Name Input */}
          <div className="space-y-3">
            <label htmlFor="playlist-name" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <MusicalNoteIcon className="h-4 w-4 text-orange-500" />
              Playlist Name
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="playlist-name"
                type="text"
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                placeholder="My Awesome Playlist"
                className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base font-medium shadow-sm text-left"
                maxLength={100}
                autoFocus
              />
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-lg">
                {playlistName.length}/100
              </div>
            </div>
          </div>

          {/* Description Input */}
          <div className="space-y-3">
            <label htmlFor="playlist-description" className="flex items-center gap-2 text-sm font-bold text-slate-700 dark:text-slate-300">
              <svg className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Description
              <span className="text-xs font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="playlist-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's the vibe of this playlist? 🎶"
              rows={3}
              className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all text-base font-medium shadow-sm text-left resize-none"
              maxLength={500}
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 text-right">
              {description.length}/500 characters
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-2 border-red-200 dark:border-red-800 rounded-2xl animate-in slide-in-from-top-2 duration-200">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                <XMarkIcon className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-red-900 dark:text-red-400">Error</p>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 rounded-2xl">
            <div className="flex-shrink-0 p-2 bg-blue-500 rounded-xl shadow-lg shadow-blue-500/30">
              <SparklesIcon className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-blue-900 dark:text-blue-400">
                What's Next?
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                Your playlist will be saved. You can generate a video upload later!
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex gap-3 p-8 pt-0 text-left">
          <button
            onClick={onClose}
            disabled={isCreating}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-slate-300 dark:hover:border-slate-600"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={isCreating || !playlistName.trim()}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 hover:from-orange-600 hover:via-orange-700 hover:to-rose-600 shadow-xl shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-2xl hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-orange-400 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            <span className="relative flex items-center justify-center gap-2">
              {isCreating ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Creating...
                </>
              ) : (
                <>
                  <SparklesIcon className="h-5 w-5" />
                  Create
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
