'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import {
  MusicalNoteIcon,
  PlayIcon,
  PauseIcon,
  SparklesIcon,
  ArrowLeftIcon,
  TrashIcon,
  ClockIcon,
  HeartIcon,
  BackwardIcon,
  ForwardIcon,
  XMarkIcon
} from '@heroicons/react/24/outline'
import { formatDuration } from '@/lib/api/music'
import { Footer } from '@/components/Footer'

interface Song {
  id: number
  title: string
  artist?: string
  source: string
  source_id: string
  duration?: number
  audio_url?: string
  thumbnail_url?: string
  is_royalty_free?: boolean
  position?: number
}

interface Playlist {
  id: number
  name: string
  mood?: string
  genre?: string
  description?: string
  is_royalty_free: boolean
  show_song_list: boolean
  created_at: string
}

export default function PlaylistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()

  const [playlist, setPlaylist] = useState<Playlist | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [currentSongIndex, setCurrentSongIndex] = useState<number>(-1)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isPlayerVisible, setIsPlayerVisible] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)

  // Download states
  const [mp3Download, setMp3Download] = useState<{
    progress: number
    status: string
    taskId: string | null
    fileInfo: { filename: string; size: number; songCount: number } | null
  }>({
    progress: 0,
    status: 'idle', // idle, processing, completed, error
    taskId: null,
    fileInfo: null
  })
  const [mp4Download, setMp4Download] = useState<{ progress: number; status: string; taskId: string | null; fileUrl: string | null }>({
    progress: 0,
    status: 'idle',
    taskId: null,
    fileUrl: null
  })

  const localizedHref = (href: string) => `/${locale}${href}`

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    if (params.id) {
      loadPlaylist(params.id as string)
    }
  }, [params.id])

  const loadPlaylist = async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const [playlistRes, songsRes] = await Promise.all([
        fetch(`http://localhost:8899/api/playlists/${id}`),
        fetch(`http://localhost:8899/api/playlists/${id}/songs`)
      ])

      if (!playlistRes.ok) throw new Error('Failed to load playlist')
      if (!songsRes.ok) throw new Error('Failed to load songs')

      const playlistData = await playlistRes.json()
      const songsData = await songsRes.json()

      setPlaylist(playlistData)
      setSongs(songsData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load playlist')
    } finally {
      setLoading(false)
    }
  }

  const handlePlay = async (song: Song, index: number) => {
    if (playingId === song.source_id && audio) {
      audio.pause()
      setPlayingId(null)
      setIsPlayerVisible(false)
      return
    }

    if (audio) {
      audio.pause()
    }

    setIsLoading(true)
    setIsPlayerVisible(true)
    setCurrentSongIndex(index)

    try {
      // Try stream endpoint first
      const streamUrl = `http://localhost:8899/api/music/stream-audio/${song.source}/${song.source_id}`
      const newAudio = new Audio(streamUrl)

      newAudio.addEventListener('loadedmetadata', () => {
        setIsLoading(false)
        setDuration(newAudio.duration)
      })

      newAudio.addEventListener('timeupdate', () => {
        if (newAudio.duration) {
          setProgress((newAudio.currentTime / newAudio.duration) * 100)
          setCurrentTime(newAudio.currentTime)
        }
      })

      newAudio.addEventListener('ended', () => {
        // Auto-play next song
        if (index < songs.length - 1) {
          handlePlay(songs[index + 1], index + 1)
        } else {
          setPlayingId(null)
          setIsPlayerVisible(false)
          setProgress(0)
          setCurrentTime(0)
        }
      })

      newAudio.addEventListener('error', () => {
        setIsLoading(false)
        console.error('Failed to play audio')
      })

      await newAudio.play()
      setAudio(newAudio)
      setPlayingId(song.source_id)
    } catch (err) {
      setIsLoading(false)
      console.error('Failed to play audio:', err)
    }
  }

  const handlePlayAll = async () => {
    if (songs.length === 0) return

    // Play first song
    await handlePlay(songs[0], 0)
  }

  const handleNext = () => {
    if (currentSongIndex < songs.length - 1) {
      handlePlay(songs[currentSongIndex + 1], currentSongIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentSongIndex > 0) {
      handlePlay(songs[currentSongIndex - 1], currentSongIndex - 1)
    }
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audio) return
    const seekTime = (parseFloat(e.target.value) / 100) * audio.duration
    audio.currentTime = seekTime
    setProgress(parseFloat(e.target.value))
    setCurrentTime(seekTime)
  }

  const handleDownloadMP3 = async () => {
    if (!playlist || mp3Download.status === 'processing') return

    setMp3Download({ progress: 0, status: 'processing', taskId: null, fileInfo: null })

    try {
      const response = await fetch(`http://localhost:8899/api/playlists-download/${playlist.id}/mp3`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to download MP3')
      }

      const result = await response.json()

      // The new endpoint returns synchronous result
      if (result.status === 'completed') {
        setMp3Download({
          progress: 100,
          status: 'completed',
          taskId: null,
          fileInfo: {
            filename: result.output_filename,
            size: result.file_size_mb,
            songCount: result.song_count
          }
        })

        // Auto download the file
        const link = document.createElement('a')
        link.href = `http://localhost:8899${result.download_url}`
        link.download = result.output_filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Reset after delay
        setTimeout(() => setMp3Download({ progress: 0, status: 'idle', taskId: null, fileInfo: null }), 5000)
      } else {
        throw new Error(result.error || 'Download failed')
      }
    } catch (err) {
      console.error('Failed to download MP3:', err)
      setMp3Download({ progress: 0, status: 'error', taskId: null, fileInfo: null })
      setTimeout(() => setMp3Download({ progress: 0, status: 'idle', taskId: null, fileInfo: null }), 3000)
    }
  }

  const handleGenerateVideo = async () => {
    if (!playlist || mp4Download.status === 'processing') return

    setMp4Download({ progress: 0, status: 'processing', taskId: null, fileUrl: null })

    try {
      const response = await fetch(`http://localhost:8899/api/playlists/${playlist.id}/generate-video`, {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Failed to generate video')
      }

      const result = await response.json()

      // The endpoint returns synchronous result
      if (result.status === 'completed') {
        setMp4Download({
          progress: 100,
          status: 'completed',
          taskId: null,
          fileUrl: `http://localhost:8899${result.download_url}`
        })

        // Auto download the file
        const link = document.createElement('a')
        link.href = `http://localhost:8899${result.download_url}`
        link.download = result.output_filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        // Reset after delay
        setTimeout(() => setMp4Download({ progress: 0, status: 'idle', taskId: null, fileUrl: null }), 5000)
      } else {
        throw new Error(result.error || 'Video generation failed')
      }
    } catch (err) {
      console.error('Failed to generate video:', err)
      setMp4Download({ progress: 0, status: 'error', taskId: null, fileUrl: null })
      setTimeout(() => setMp4Download({ progress: 0, status: 'idle', taskId: null, fileUrl: null }), 3000)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this playlist?')) return

    try {
      await fetch(`http://localhost:8899/api/playlists/${playlist?.id}`, {
        method: 'DELETE'
      })
      router.push(localizedHref('/library'))
    } catch (err) {
      alert('Failed to delete playlist')
    }
  }

  const totalDuration = songs.reduce((acc, song) => acc + (song.duration || 0), 0)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-16 h-16 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-lg font-semibold text-slate-600 dark:text-slate-400">Loading playlist...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-3xl shadow-2xl border-2 border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-semibold text-center">{error}</p>
          <button
            onClick={() => router.push(localizedHref('/library'))}
            className="mt-6 w-full px-6 py-3 bg-gradient-to-r from-orange-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all"
          >
            Back to Library
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <div
              onClick={() => router.push(localizedHref('/'))}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
                <div className="relative p-3 bg-gradient-to-br from-orange-500 via-orange-600 to-rose-500 rounded-2xl shadow-xl">
                  <MusicalNoteIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 bg-clip-text text-transparent">
                  MoodVibe Creator
                </span>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push(localizedHref('/library'))}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Library</span>
              </button>
              <button
                onClick={handleDelete}
                className="p-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400 transition-all"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section - Simplified */}
        <div className="mb-8">
          <div className="relative p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
            <div className="relative z-10">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-slate-100 mb-4 leading-tight">
                {playlist?.name}
              </h1>

              {/* Metadata Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                {playlist?.mood && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-sm font-bold rounded-full shadow-lg shadow-orange-500/30 capitalize">
                    {playlist.mood}
                  </span>
                )}
                {playlist?.genre && (
                  <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-500/30 capitalize">
                    {playlist.genre.replace('_', ' ')}
                  </span>
                )}
                <span className="px-3 py-1.5 bg-gradient-to-r from-purple-500 to-purple-600 text-white text-sm font-bold rounded-full shadow-lg shadow-purple-500/30">
                  {songs.length} songs
                </span>
              </div>

              {/* Description */}
              {playlist?.description && (
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-3xl">
                  {playlist.description}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Songs Section */}
        <div className="p-8 rounded-3xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-2xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30">
                <MusicalNoteIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Songs</h2>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  {songs.length} track{songs.length > 1 ? 's' : ''} in playlist • {formatDuration(totalDuration)}
                </p>
              </div>
            </div>

            {/* Play All Button */}
            {songs.length > 0 && (
              <button
                onClick={handlePlayAll}
                disabled={isLoading}
                className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 text-white font-bold rounded-xl shadow-xl shadow-orange-500/30 hover:shadow-2xl hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm">Loading...</span>
                  </>
                ) : (
                  <>
                    <PlayIcon className="h-5 w-5" />
                    <span className="text-sm">Play All</span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Songs List */}
          {songs.length === 0 ? (
            <div className="py-16 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 mb-4">
                <MusicalNoteIcon className="h-10 w-10 text-slate-400 dark:text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-2">No songs yet</h3>
              <p className="text-slate-600 dark:text-slate-400">This playlist doesn't have any songs</p>
            </div>
          ) : (
            <div className="space-y-3">
              {songs.map((song, index) => (
                <div
                  key={song.source_id || song.id}
                  className="group p-5 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl border-2 border-slate-200/50 dark:border-slate-700/50 shadow-lg hover:shadow-xl hover:shadow-orange-600/10 hover:scale-[1.01] hover:border-orange-300/50 dark:hover:border-orange-700/50 transition-all duration-300 flex items-center gap-5"
                >
                  {/* Track Number */}
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg shadow-orange-500/30 font-bold text-white">
                    {index + 1}
                  </div>

                  {/* Thumbnail */}
                  {song.thumbnail_url ? (
                    <img
                      src={song.thumbnail_url}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shadow-md flex-shrink-0"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center flex-shrink-0">
                      <MusicalNoteIcon className="h-7 w-7 text-slate-400" />
                    </div>
                  )}

                  {/* Song Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate leading-tight mb-1">
                      {song.title}
                    </p>
                    <div className="flex items-center gap-3">
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 truncate">
                        {song.artist || 'Unknown Artist'}
                      </p>
                      {song.duration && (
                        <>
                          <span className="text-slate-400">•</span>
                          <span className="text-sm font-medium text-slate-500 dark:text-slate-500">
                            {formatDuration(song.duration)}
                          </span>
                        </>
                      )}
                      <span className="text-slate-400">•</span>
                      <span className="text-sm font-medium capitalize text-slate-500 dark:text-slate-500">
                        {song.source}
                      </span>
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="flex items-center gap-2">
                    {song.is_royalty_free && (
                      <span className="text-xs font-bold px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-green-500 text-white shadow-sm">
                        RF
                      </span>
                    )}
                  </div>

                  {/* Play Button */}
                  <button
                    onClick={() => handlePlay(song, index)}
                    className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${
                      playingId === song.source_id
                        ? 'bg-gradient-to-br from-rose-500 to-pink-500 shadow-lg shadow-rose-500/30'
                        : 'bg-gradient-to-br from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 shadow-lg shadow-orange-500/30 hover:shadow-xl hover:scale-110'
                    }`}
                  >
                    {playingId === song.source_id ? (
                      <PauseIcon className="h-5 w-5 text-white" />
                    ) : (
                      <PlayIcon className="h-5 w-5 text-white ml-0.5" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Section */}
        {songs.length > 0 && (
          <div className="mt-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-500 via-rose-500 to-purple-600 shadow-2xl">
            {/* Animated Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 animate-pulse" />
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2 animate-pulse" style={{ animationDelay: '1s' }} />
            </div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJ2LTJoMnYyem0wIDJoLTJ2LTJoMnYyem0wIDJoLTJ2LTJoMnYyem0tMiAwaC0ydjJoMnYtMnptMCAyaC0ydjJoMnYtMnptMCAyaC0ydjJoMnYtMnptLTItMGgtMnYyaDJ2LTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />

            <div className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
                {/* Left Content */}
                <div className="flex-1 text-center lg:text-left">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full border border-white/30 mb-4">
                    <SparklesIcon className="h-4 w-4 text-yellow-300" />
                    <span className="text-sm font-bold text-white">Almost There!</span>
                  </div>

                  {/* Heading */}
                  <h3 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                    🎉 Ready to Share Your Vibe?
                  </h3>

                  {/* Description */}
                  <p className="text-lg text-white/90 max-w-xl mb-6">
                    Transform your playlist into a stunning video or download the audio. Share your creation with the world!
                  </p>

                  {/* Stats */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <MusicalNoteIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Songs</p>
                        <p className="text-lg font-bold text-white">{songs.length}</p>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/30" />
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <ClockIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">Duration</p>
                        <p className="text-lg font-bold text-white">{formatDuration(totalDuration)}</p>
                      </div>
                    </div>
                    <div className="w-px h-10 bg-white/30" />
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                        <HeartIcon className="h-5 w-5 text-white" />
                      </div>
                      <div className="text-left">
                        <p className="text-xs font-semibold text-white/70 uppercase tracking-wide">License</p>
                        <p className="text-lg font-bold text-white">
                          {playlist?.is_royalty_free ? 'Royalty Free' : 'Standard'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Content - Action Buttons */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex flex-col sm:flex-row gap-4">
                    {/* Download MP3 Button */}
                    <button
                      onClick={handleDownloadMP3}
                      disabled={mp3Download.status === 'processing'}
                      className={`group relative px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl shadow-lg transition-all duration-200 min-w-[160px] sm:min-w-[200px] ${
                        mp3Download.status === 'processing'
                          ? 'bg-orange-50 text-orange-500 cursor-wait'
                          : 'bg-white text-orange-600 hover:bg-orange-50 hover:text-orange-700 active:scale-95'
                      } disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100`}
                    >
                      <div className="relative flex items-center justify-center gap-2">
                        {mp3Download.status === 'processing' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm">Creating MP3...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            <span className="text-sm">Download MP3</span>
                          </>
                        )}
                      </div>
                    </button>

                    {/* Generate Video Button */}
                    <button
                      onClick={handleGenerateVideo}
                      disabled={mp4Download.status === 'processing'}
                      className={`group relative px-6 sm:px-8 py-3 sm:py-4 font-semibold rounded-xl shadow-lg transition-all duration-200 min-w-[160px] sm:min-w-[200px] ${
                        mp4Download.status === 'processing'
                          ? 'bg-purple-50 text-purple-500 cursor-wait'
                          : 'bg-white text-purple-600 hover:bg-purple-50 hover:text-purple-700 active:scale-95'
                      } disabled:opacity-60 disabled:cursor-not-allowed disabled:active:scale-100`}
                    >
                      <div className="relative flex items-center justify-center gap-2">
                        {mp4Download.status === 'processing' ? (
                          <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span className="text-sm">Creating Video...</span>
                          </>
                        ) : (
                          <>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm">Generate Video</span>
                          </>
                        )}
                      </div>
                    </button>
                  </div>

                  {/* Success Messages */}
                  <div className="w-full sm:w-[420px] space-y-2">
                    {mp3Download.status === 'completed' && mp3Download.fileInfo && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50 shadow-sm">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-900">
                            MP3 created successfully
                          </p>
                          <p className="text-xs text-emerald-600">
                            {mp3Download.fileInfo.size} MB • {mp3Download.fileInfo.songCount} songs
                          </p>
                        </div>
                      </div>
                    )}

                    {mp4Download.status === 'completed' && mp4Download.fileUrl && (
                      <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50 shadow-sm">
                        <div className="flex-shrink-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-500">
                            <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-emerald-900">
                            Video ready!
                          </p>
                          <a
                            href={mp4Download.fileUrl}
                            download={`playlist-${params.id}.mp4`}
                            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 underline underline-offset-2"
                            onClick={(e) => e.stopPropagation()}
                          >
                            Click to download
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Info Bar */}
              <div className="mt-8 pt-6 border-t border-white/20">
                <div className="flex flex-col md:flex-row items-center justify-center gap-6 text-sm text-white/80">
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>High quality audio</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>AI-powered video generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="h-5 w-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span>One-click upload</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Awesome Player Bar */}
      {isPlayerVisible && currentSongIndex >= 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom-4 duration-300">
          <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-orange-500/50 shadow-2xl backdrop-blur-xl">
            <div className="container mx-auto px-4 py-3">
              <div className="flex items-center gap-4">
                {/* Progress Bar - Full Width Interactive */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-700 group cursor-pointer">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 via-orange-600 to-rose-500 transition-all duration-300 relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={progress}
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={!audio || isLoading}
                  />
                </div>

                {/* Current Song Info */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {songs[currentSongIndex]?.thumbnail_url ? (
                    <img
                      src={songs[currentSongIndex].thumbnail_url}
                      alt=""
                      className="w-14 h-14 rounded-lg object-cover shadow-lg"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-500 to-rose-500 flex items-center justify-center shadow-lg">
                      <MusicalNoteIcon className="h-7 w-7 text-white" />
                    </div>
                  )}
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold text-white truncate max-w-[200px]">
                      {songs[currentSongIndex]?.title}
                    </p>
                    <p className="text-xs font-medium text-slate-400 truncate max-w-[200px]">
                      {songs[currentSongIndex]?.artist || 'Unknown Artist'}
                    </p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 flex-1 justify-center">
                  {/* Previous */}
                  <button
                    onClick={handlePrevious}
                    disabled={currentSongIndex === 0 || isLoading}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                  >
                    <BackwardIcon className="h-5 w-5" />
                  </button>

                  {/* Play/Pause */}
                  <button
                    onClick={() => {
                      const song = songs[currentSongIndex]
                      if (song) handlePlay(song, currentSongIndex)
                    }}
                    disabled={isLoading}
                    className="p-3 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-xl hover:shadow-2xl hover:scale-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : playingId ? (
                      <PauseIcon className="h-6 w-6" />
                    ) : (
                      <PlayIcon className="h-6 w-6 ml-0.5" />
                    )}
                  </button>

                  {/* Next */}
                  <button
                    onClick={handleNext}
                    disabled={currentSongIndex === songs.length - 1 || isLoading}
                    className="p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all disabled:opacity-30 disabled:cursor-not-allowed hover:scale-110"
                  >
                    <ForwardIcon className="h-5 w-5" />
                  </button>
                </div>

                {/* Song Position */}
                <div className="flex-shrink-0 text-right">
                  <p className="text-sm font-bold text-white">
                    {currentSongIndex + 1} / {songs.length}
                  </p>
                  <p className="text-xs font-medium text-slate-400">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </p>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => {
                    if (audio) {
                      audio.pause()
                      setAudio(null)
                    }
                    setPlayingId(null)
                    setIsPlayerVisible(false)
                    setProgress(0)
                    setCurrentSongIndex(-1)
                  }}
                  className="p-2 rounded-full text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-all hover:scale-110 flex-shrink-0"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
