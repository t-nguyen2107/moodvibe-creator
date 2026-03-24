'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import {
  MusicalNoteIcon,
  PlayIcon,
  ArrowDownTrayIcon,
  VideoCameraIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowLeftIcon,
  ShareIcon,
  TrashIcon,
  MusicalNoteIcon as MusicIcon
} from '@heroicons/react/24/outline'
import { Song, Playlist as PlaylistType } from '@/lib/store'
import { useLocale, useTranslations } from 'next-intl'

/**
 * Playlist Detail Page - Enhanced with Glassmorphism 2.0
 *
 * Features:
 * - Modern glassmorphism design matching the homepage
 * - Large hero section with playlist artwork
 * - Beautiful song list cards
 * - Enhanced action buttons with gradients
 * - Better form inputs for upload
 * - Consistent design throughout
 */

export default function PlaylistDetailPage() {
  const params = useParams()
  const router = useRouter()
  const locale = useLocale()
  const tCommon = useTranslations('common')
  const tNav = useTranslations('nav')

  const [playlist, setPlaylist] = useState<PlaylistType | null>(null)
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [showUploadWarning, setShowUploadWarning] = useState(false)

  // Generation state
  const [audioPath, setAudioPath] = useState('')
  const [videoPath, setVideoPath] = useState('')
  const [description, setDescription] = useState('')
  const [hashtags, setHashtags] = useState('')

  useEffect(() => {
    if (params.id) {
      loadPlaylist(params.id as string)
    }
  }, [params.id])

  const loadPlaylist = async (id: string) => {
    try {
      const [playlistData, songsData] = await Promise.all([
        api.getPlaylist(Number(id)),
        api.getPlaylistSongs(Number(id))
      ])
      setPlaylist(playlistData)
      setSongs(songsData)

      // Generate initial description and hashtags
      const desc = `${playlistData.mood} music playlist for ${playlistData.genre?.replace('_', ' ')}\n\nSongs:\n${songsData.map((s, i) => `${i + 1}. ${s.title} - ${s.artist}`).join('\n')}`
      setDescription(desc)

      const tags = [`#${playlistData.mood}`, `#${playlistData.genre?.replace('_', '')}`, '#music', '#playlist']
      setHashtags(tags.join(' '))
    } catch (error) {
      console.error('Error loading playlist:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleGenerateAudio = async () => {
    setGenerating(true)
    try {
      const audioUrls = songs.map(s => s.audio_url)
      const result = await api.mergeAudio(audioUrls, 5)
      setAudioPath(result.audio_path)
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Có lỗi xảy ra khi tạo audio')
    } finally {
      setGenerating(false)
    }
  }

  const handleGenerateVideo = async () => {
    setGenerating(true)
    try {
      const songList = songs.map(s => `${s.title} - ${s.artist}`)
      const result = await api.generateVideo(
        audioPath,
        playlist?.cover_image_path || '',
        songList,
        playlist?.show_song_list ?? true
      )
      setVideoPath(result.video_path)
    } catch (error) {
      console.error('Error generating video:', error)
      alert('Có lỗi xảy ra khi tạo video')
    } finally {
      setGenerating(false)
    }
  }

  const handleUploadToYouTube = async () => {
    // Check if all songs are royalty free
    const hasCopyrightedSongs = songs.some(s => !s.is_royalty_free)

    if (hasCopyrightedSongs) {
      setShowUploadWarning(true)
      return
    }

    performYouTubeUpload()
  }

  const performYouTubeUpload = async () => {
    try {
      await api.uploadToYouTube(
        videoPath,
        playlist?.name || 'My Playlist',
        `${description}\n\n${hashtags}`,
        hashtags.split(' ')
      )
      alert('Upload thành công lên YouTube!')
      setShowUploadWarning(false)
    } catch (error) {
      console.error('Error uploading to YouTube:', error)
      alert('Có lỗi xảy ra khi upload lên YouTube')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-full blur-2xl opacity-30 animate-pulse" />
            <div className="relative w-20 h-20 border-4 border-slate-200 border-t-primary-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-slate-600 dark:text-slate-400">
            Loading playlist...
          </p>
        </div>
      </div>
    )
  }

  const allRoyaltyFree = songs.every(s => s.is_royalty_free)
  const copyrightedCount = songs.filter(s => !s.is_royalty_free).length

  const localizedHref = (href: string) => `/${locale}${href}`

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Premium Header - Enhanced Glassmorphism */}
      <header className="sticky top-0 z-50 bg-white/85 dark:bg-slate-900/85 backdrop-blur-2xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            {/* Logo - Enhanced with Glow */}
            <div className="flex items-center gap-3.5 group cursor-pointer" onClick={() => router.push(localizedHref('/'))}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-2xl blur-xl opacity-50 group-hover:opacity-70 transition-opacity duration-300 animate-pulse-subtle" />
                <div className="relative p-3 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-2xl shadow-xl group-hover:shadow-2xl group-hover:scale-105 transition-all duration-300">
                  <MusicalNoteIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 bg-clip-text text-transparent">
                  MoodVibe Creator
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">
                  AI-Powered Music Playlist Creator
                </span>
              </div>
            </div>

            {/* Navigation - Enhanced */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push(localizedHref('/library'))}
                className="
                  px-6 py-3 rounded-xl
                  flex items-center gap-2
                  text-sm font-semibold text-slate-600 dark:text-slate-400
                  hover:text-slate-900 dark:hover:text-slate-100
                  hover:bg-slate-100 dark:hover:bg-slate-800
                  hover:scale-105
                  transition-all duration-200
                "
              >
                <ArrowLeftIcon className="h-4 w-4" />
                <span>Back to Library</span>
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Hero Section - Enhanced */}
        <section className="mb-16">
          <div className="
            p-10 rounded-[2.5rem]
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
            relative overflow-hidden
          ">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-orange-500/10 to-rose-500/10 animate-gradient" />

            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row items-center gap-10">
                {/* Playlist Artwork */}
                <div className="relative group flex-shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-orange-500/30 to-rose-500/30 rounded-3xl blur-2xl opacity-50 group-hover:opacity-70 transition-opacity duration-500" />
                  <div className="relative w-64 h-64 rounded-3xl bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 flex items-center justify-center shadow-2xl shadow-blue-600/30 group-hover:scale-105 transition-transform duration-300">
                    <MusicIcon className="h-32 w-32 text-white" />
                  </div>
                </div>

                {/* Playlist Info */}
                <div className="flex-1 text-center lg:text-left space-y-6">
                  <div className="space-y-4">
                    {/* Title */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 dark:text-slate-100 leading-tight">
                      {playlist?.name}
                    </h1>

                    {/* Metadata */}
                    <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                      <span className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-primary-600 text-white text-sm font-bold rounded-full shadow-lg shadow-blue-600/30">
                        {playlist?.mood}
                      </span>
                      <span className="px-5 py-2.5 bg-gradient-to-r from-secondary-500 to-secondary-600 text-white text-sm font-bold rounded-full shadow-lg shadow-secondary-500/30">
                        {playlist?.genre?.replace('_', ' ')}
                      </span>
                      <span className="px-5 py-2.5 bg-gradient-to-r from-accent-500 to-accent-600 text-white text-sm font-bold rounded-full shadow-lg shadow-accent-500/30">
                        {songs.length} songs
                      </span>
                    </div>

                    {/* Royalty Free Badge */}
                    {allRoyaltyFree && (
                      <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-secondary-50 to-secondary-100 dark:from-secondary-950/50 dark:to-secondary-900/50 border-2 border-secondary-200 dark:border-secondary-800 rounded-full shadow-lg shadow-secondary-500/10">
                        <svg className="h-5 w-5 text-secondary-600 dark:text-secondary-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-sm font-bold text-secondary-700 dark:text-secondary-300">
                          All songs are royalty free
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
                    <button
                      className="
                        px-8 py-4 rounded-2xl
                        bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
                        bg-[length:200%_200%]
                        text-white font-black text-base
                        shadow-xl shadow-blue-600/30
                        hover:shadow-2xl hover:shadow-blue-600/40
                        hover:scale-105
                        active:scale-95
                        transition-all duration-300
                        flex items-center justify-center gap-3
                        animate-gradient
                      "
                    >
                      <PlayIcon className="h-5 w-5" />
                      <span>Play All</span>
                    </button>
                    <button
                      className="
                        px-6 py-4 rounded-2xl
                        bg-white dark:bg-slate-800
                        border-2 border-slate-200 dark:border-slate-700
                        text-slate-700 dark:text-slate-300
                        font-bold
                        hover:border-primary-400 dark:hover:border-primary-600
                        hover:shadow-xl hover:shadow-blue-600/10
                        hover:scale-105
                        active:scale-95
                        transition-all duration-300
                        flex items-center justify-center gap-2
                      "
                    >
                      <ShareIcon className="h-5 w-5" />
                      <span>Share</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Songs List - Enhanced */}
        {playlist?.show_song_list && (
          <section className="mb-16">
            <div className="
              p-8 rounded-3xl
              bg-white/80 dark:bg-slate-900/80
              backdrop-blur-2xl
              border-2 border-slate-200/50 dark:border-slate-700/50
              shadow-xl
            ">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600/20 to-primary-600/20 flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <MusicIcon className="h-6 w-6 text-blue-700 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                      Songs
                    </h2>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                      {songs.length} tracks in this playlist
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {songs.map((song, index) => (
                  <div
                    key={song.source_id}
                    className="
                      group
                      p-5 rounded-2xl
                      bg-white/90 dark:bg-slate-800/90
                      backdrop-blur-xl
                      border-2 border-slate-200/50 dark:border-slate-700/50
                      shadow-lg
                      hover:shadow-xl hover:shadow-blue-600/10
                      hover:scale-[1.01]
                      transition-all duration-300
                      flex items-center gap-5
                    "
                  >
                    {/* Track Number */}
                    <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center shadow-lg shadow-blue-600/20 font-bold text-white">
                      {index + 1}
                    </div>

                    {/* Song Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-lg text-slate-900 dark:text-slate-100 truncate group-hover:text-blue-700 dark:group-hover:text-primary-400 transition-colors">
                        {song.title}
                      </p>
                      <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1 truncate">
                        {song.artist}
                      </p>
                    </div>

                    {/* Badge */}
                    {!song.is_royalty_free && (
                      <div className="flex-shrink-0">
                        <span className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-xs font-bold rounded-full shadow-md shadow-orange-500/20">
                          Copyrighted
                        </span>
                      </div>
                    )}

                    {/* Play Button */}
                    <button className="
                      flex-shrink-0 w-12 h-12 rounded-xl
                      bg-gradient-to-br from-blue-600 to-primary-600
                      flex items-center justify-center
                      shadow-lg shadow-blue-600/30
                      hover:scale-110
                      active:scale-95
                      transition-all duration-200
                    ">
                      <PlayIcon className="h-5 w-5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Generation Section - Enhanced */}
        <section className="grid md:grid-cols-2 gap-8 mb-16">
          {/* Generate Audio */}
          <div className="
            group
            p-8 rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
            hover:shadow-2xl hover:shadow-blue-600/20
            hover:border-primary-400 dark:hover:border-primary-600
            hover:-translate-y-1
            transition-all duration-300
            relative overflow-hidden
          ">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-primary-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600/20 to-primary-600/20 flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <PlayIcon className="h-8 w-8 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-700 dark:group-hover:text-primary-400 transition-colors">
                    Generate Audio
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Merge all songs into one file
                  </p>
                </div>
              </div>

              <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Combine {songs.length} songs into a single MP3 file with seamless transitions.
              </p>

              <button
                onClick={handleGenerateAudio}
                disabled={generating || !songs.length}
                className="
                  w-full px-6 py-4
                  bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400
                  bg-[length:200%_200%]
                  text-white font-black text-base rounded-2xl
                  shadow-xl shadow-blue-600/30
                  hover:shadow-2xl hover:shadow-blue-600/40
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  flex items-center justify-center gap-3
                  animate-gradient
                "
              >
                <PlayIcon className="h-5 w-5" />
                <span>{generating ? 'Generating...' : 'Generate MP3'}</span>
              </button>

              {audioPath && (
                <div className="mt-6 p-5 bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-950/20 dark:to-secondary-900/20 border-2 border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-lg shadow-secondary-500/10 flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900 dark:text-secondary-400">Success!</p>
                    <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Audio file generated successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Generate Video */}
          <div className="
            group
            p-8 rounded-3xl
            bg-white/80 dark:bg-slate-900/80
            backdrop-blur-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            shadow-xl
            hover:shadow-2xl hover:shadow-accent-500/20
            hover:border-accent-400 dark:hover:border-accent-600
            hover:-translate-y-1
            transition-all duration-300
            relative overflow-hidden
          ">
            {/* Gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 to-accent-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-500/20 to-accent-600/20 flex items-center justify-center shadow-lg shadow-accent-500/20 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <VideoCameraIcon className="h-8 w-8 text-accent-600 dark:text-accent-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 group-hover:text-accent-600 dark:group-hover:text-accent-400 transition-colors">
                    Generate Video
                  </h3>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Create video with cover art
                  </p>
                </div>
              </div>

              <p className="text-base font-medium text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                Transform your audio into a stunning MP4 video with playlist artwork.
              </p>

              <button
                onClick={handleGenerateVideo}
                disabled={generating || !audioPath}
                className="
                  w-full px-6 py-4
                  bg-gradient-to-r from-accent-500 via-accent-600 to-rose-500
                  bg-[length:200%_200%]
                  text-white font-black text-base rounded-2xl
                  shadow-xl shadow-accent-500/30
                  hover:shadow-2xl hover:shadow-accent-500/40
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                  flex items-center justify-center gap-3
                  animate-gradient
                "
              >
                <VideoCameraIcon className="h-5 w-5" />
                <span>{generating ? 'Generating...' : 'Generate MP4'}</span>
              </button>

              {videoPath && (
                <div className="mt-6 p-5 bg-gradient-to-br from-secondary-50 to-secondary-100/50 dark:from-secondary-950/20 dark:to-secondary-900/20 border-2 border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-lg shadow-secondary-500/10 flex items-center gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-lg">
                    <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold text-secondary-900 dark:text-secondary-400">Success!</p>
                    <p className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">Video file generated successfully</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Download Section - Enhanced */}
        {(audioPath || videoPath) && (
          <section className="mb-16">
            <div className="
              p-8 rounded-3xl
              bg-white/80 dark:bg-slate-900/80
              backdrop-blur-2xl
              border-2 border-slate-200/50 dark:border-slate-700/50
              shadow-xl
            ">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary-500/20 to-secondary-600/20 flex items-center justify-center shadow-lg shadow-secondary-500/20">
                  <ArrowDownTrayIcon className="h-7 w-7 text-secondary-600 dark:text-secondary-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    Download Files
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Save your generated content
                  </p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {audioPath && (
                  <a
                    href={`http://localhost:8899/${audioPath}`}
                    download
                    className="
                      group
                      p-6 rounded-2xl
                      bg-gradient-to-br from-blue-50 to-primary-100
                      dark:from-blue-950/50 dark:to-blue-900/50
                      border-2 border-blue-200 dark:border-blue-800
                      shadow-lg shadow-blue-600/10
                      hover:shadow-xl hover:shadow-blue-600/20
                      hover:scale-105
                      transition-all duration-300
                      flex items-center justify-center gap-4
                    "
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-primary-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-xl text-primary-900 dark:text-blue-400">Download MP3</p>
                      <p className="text-sm font-semibold text-primary-700 dark:text-primary-300 mt-1">Audio file</p>
                    </div>
                  </a>
                )}

                {videoPath && (
                  <a
                    href={`http://localhost:8899/${videoPath}`}
                    download
                    className="
                      group
                      p-6 rounded-2xl
                      bg-gradient-to-br from-accent-50 to-accent-100
                      dark:from-accent-950/50 dark:to-accent-900/50
                      border-2 border-accent-200 dark:border-accent-800
                      shadow-lg shadow-accent-500/10
                      hover:shadow-xl hover:shadow-accent-500/20
                      hover:scale-105
                      transition-all duration-300
                      flex items-center justify-center gap-4
                    "
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200">
                      <ArrowDownTrayIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-black text-xl text-accent-900 dark:text-accent-400">Download MP4</p>
                      <p className="text-sm font-semibold text-accent-700 dark:text-accent-300 mt-1">Video file</p>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Upload Section - Enhanced */}
        {videoPath && (
          <section>
            <div className="
              p-8 rounded-3xl
              bg-white/80 dark:bg-slate-900/80
              backdrop-blur-2xl
              border-2 border-slate-200/50 dark:border-slate-700/50
              shadow-xl
            ">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600/20 to-primary-600/20 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <ShareIcon className="h-7 w-7 text-blue-700 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-slate-100">
                    Upload to Social Media
                  </h2>
                  <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-1">
                    Share your playlist with the world
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Description */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter a description for your video..."
                    className="
                      w-full px-6 py-4
                      bg-white/90 dark:bg-slate-800/90
                      backdrop-blur-xl
                      border-2 border-slate-200/50 dark:border-slate-700/50
                      rounded-2xl
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400
                      font-medium
                      focus:outline-none
                      focus:border-primary-400 dark:focus:border-primary-600
                      focus:ring-2 focus:ring-primary-500/20
                      hover:border-primary-300 dark:hover:border-primary-700
                      transition-all duration-200
                      shadow-lg
                      resize-none
                      h-32
                    "
                  />
                </div>

                {/* Hashtags */}
                <div className="space-y-3">
                  <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                    Hashtags
                  </label>
                  <input
                    type="text"
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    placeholder="Enter hashtags separated by spaces..."
                    className="
                      w-full px-6 py-4
                      bg-white/90 dark:bg-slate-800/90
                      backdrop-blur-xl
                      border-2 border-slate-200/50 dark:border-slate-700/50
                      rounded-2xl
                      text-slate-900 dark:text-slate-100
                      placeholder:text-slate-400
                      font-medium
                      focus:outline-none
                      focus:border-primary-400 dark:focus:border-primary-600
                      focus:ring-2 focus:ring-primary-500/20
                      hover:border-primary-300 dark:hover:border-primary-700
                      transition-all duration-200
                      shadow-lg
                    "
                  />
                </div>

                {/* Upload Buttons */}
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={handleUploadToYouTube}
                    disabled={!videoPath}
                    className="
                      px-8 py-5
                      bg-gradient-to-r from-red-500 via-red-600 to-red-500
                      bg-[length:200%_200%]
                      text-white font-black text-lg rounded-2xl
                      shadow-xl shadow-red-500/30
                      hover:shadow-2xl hover:shadow-red-500/40
                      hover:scale-105
                      active:scale-95
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      flex items-center justify-center gap-3
                      animate-gradient
                    "
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                    </svg>
                    <span>Upload to YouTube</span>
                  </button>

                  <button
                    disabled={!videoPath}
                    className="
                      px-8 py-5
                      bg-gradient-to-r from-pink-500 via-pink-600 to-pink-500
                      bg-[length:200%_200%]
                      text-white font-black text-lg rounded-2xl
                      shadow-xl shadow-pink-500/30
                      hover:shadow-2xl hover:shadow-pink-500/40
                      hover:scale-105
                      active:scale-95
                      transition-all duration-300
                      disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                      flex items-center justify-center gap-3
                      animate-gradient
                    "
                    onClick={() => alert('TikTok upload chưa được implement')}
                  >
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                    </svg>
                    <span>Upload to TikTok</span>
                  </button>
                </div>

                {/* Copyright Warning */}
                {!allRoyaltyFree && (
                  <div className="p-6 bg-gradient-to-br from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/20 border-2 border-orange-200 dark:border-orange-800 rounded-2xl shadow-xl shadow-orange-500/10">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                        <ExclamationTriangleIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl text-orange-900 dark:text-orange-400 mb-2">
                          Copyright Warning
                        </h3>
                        <p className="text-base font-medium text-orange-800 dark:text-orange-300 leading-relaxed">
                          This playlist contains {copyrightedCount} copyrighted song(s). You can download for personal use, but uploading to YouTube/TikTok may violate copyright policies.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </main>

      {/* Upload Warning Modal - Enhanced */}
      {showUploadWarning && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="
            max-w-lg w-full
            p-10 rounded-[2rem]
            bg-white dark:bg-slate-900
            shadow-2xl
            border-2 border-slate-200/50 dark:border-slate-700/50
            animate-in fade-in zoom-in duration-300
          ">
            <div className="flex items-start gap-5 mb-8">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-xl shadow-orange-500/30">
                <ExclamationTriangleIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-orange-900 dark:text-orange-400 mb-3">
                  Copyright Warning
                </h3>
                <p className="text-base font-medium text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                  This playlist contains {copyrightedCount} copyrighted song(s). You can download for personal use, but uploading to YouTube/TikTok may violate copyright policies.
                </p>
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                  You are responsible for your actions.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setShowUploadWarning(false)}
                className="
                  px-6 py-4
                  bg-white dark:bg-slate-800
                  border-2 border-slate-200 dark:border-slate-700
                  text-slate-700 dark:text-slate-300
                  font-bold rounded-2xl
                  hover:border-slate-300 dark:hover:border-slate-600
                  hover:shadow-lg
                  hover:scale-105
                  active:scale-95
                  transition-all duration-200
                "
              >
                Cancel
              </button>
              <button
                onClick={performYouTubeUpload}
                className="
                  px-6 py-4
                  bg-gradient-to-r from-orange-500 via-orange-600 to-orange-500
                  bg-[length:200%_200%]
                  text-white font-black rounded-2xl
                  shadow-xl shadow-orange-500/30
                  hover:shadow-2xl hover:shadow-orange-500/40
                  hover:scale-105
                  active:scale-95
                  transition-all duration-300
                  animate-gradient
                "
              >
                Upload Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer - Enhanced */}
      <footer className="border-t-2 border-slate-200/50 dark:border-slate-700/50 mt-24 relative z-10 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300" />
                <div className="relative p-4 bg-gradient-to-br from-blue-400 via-rose-400 to-orange-400 rounded-2xl shadow-xl">
                  <MusicalNoteIcon className="h-7 w-7 text-white" />
                </div>
              </div>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100">
                MoodVibe Creator
              </span>
            </div>
            <p className="text-base font-medium text-slate-500 dark:text-slate-400">
              © 2025 MoodVibe Creator. All rights reserved.
            </p>
            <div className="flex items-center gap-8">
              <a href="#" className="text-base font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-primary-400 transition-colors duration-200">
                Privacy
              </a>
              <a href="#" className="text-base font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-primary-400 transition-colors duration-200">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
