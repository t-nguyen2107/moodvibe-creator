'use client'

import { useState } from 'react'
import { usePlaylistStore, Song } from '@/lib/store'
import { MusicalNoteIcon, CheckIcon, ArrowRightIcon, MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { useLocale } from 'next-intl'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { locales, type Locale } from '@/i18n'
import { useApi } from '@/contexts/ApiContext'

const MOODS = [
  'chill', 'happy', 'sad', 'energetic', 'romantic', 'focus', 'sleep',
  'party', 'workout', 'relaxed', 'motivating', 'peaceful', 'exciting',
  'nostalgic', 'melancholic', 'upbeat', 'ambient', 'angry', 'hopeful', 'emotional'
]

const GENRES = [
  'hot', 'us_uk', 'korean', 'chinese', 'vietnam', 'japanese',
  'work_music', 'instrumental', 'sleep_music', 'baby_lullabies',
  'edm', 'rock', 'pop', 'jazz', 'classical', 'rnb', 'hiphop',
  'latin', 'indie', 'folk', 'country', 'blues', 'reggae',
  'metal', 'punk', 'disco', 'techno', 'house'
]

export default function CreatePlaylistPage() {
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('create')
  const tNav = useTranslations('nav')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { selectedSongs, addSong, removeSong, setStep, currentStep } = usePlaylistStore()
  const { isSearching, searchResults, searchError, searchMusic: search } = useApi()

  const [mood, setMood] = useState('')
  const [genre, setGenre] = useState('')
  const [customMood, setCustomMood] = useState('')
  const [customGenre, setCustomGenre] = useState('')
  const [playlistName, setPlaylistName] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [royaltyFreeOnly, setRoyaltyFreeOnly] = useState(false)
  const [audioGap, setAudioGap] = useState(5)

  const localizedHref = (href: string) => `/${locale}${href}`

  const switchLocale = (newLocale: Locale) => {
    const segments = pathname.split('/')
    segments[1] = newLocale
    router.push(segments.join('/'))
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return
    await search({
      query: searchQuery,
      mood: mood || customMood,
      genre: genre || customGenre,
      limit: 20,
      royalty_free_only: royaltyFreeOnly
    })
  }

  const handleToggleSong = (song: Song) => {
    const isSelected = selectedSongs.some(s => s.source_id === song.source_id)
    if (isSelected) {
      removeSong(song.source_id)
    } else {
      if (selectedSongs.length < 20) {
        addSong(song)
      }
    }
  }

  const handleNextStep = () => {
    if (currentStep < 3) {
      setStep(currentStep + 1)
    } else {
      router.push(localizedHref('/library'))
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return (mood || customMood) && (genre || customGenre)
      case 2:
        return selectedSongs.length > 0
      case 3:
        return true
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      {/* Modern Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800">
        <div className="container-custom py-4">
          <nav className="flex items-center justify-between">
            {/* Logo */}
            <Link href={localizedHref('/')} className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity duration-300"></div>
                <div className="relative p-2.5 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
                  <MusicalNoteIcon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                  {tCommon('appName')}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Music Playlist Creator</span>
              </div>
            </Link>

            {/* Navigation */}
            <div className="flex items-center gap-2">
              <Link
                href={localizedHref('/create')}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-all duration-200"
              >
                {tNav('create')}
              </Link>
              <Link
                href={localizedHref('/library')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                {tNav('library')}
              </Link>
              <Link
                href={localizedHref('/settings')}
                className="px-5 py-2.5 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                {tNav('settings')}
              </Link>

              {/* Language Switcher */}
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-2"></div>
              <select
                value={locale}
                onChange={(e) => switchLocale(e.target.value as Locale)}
                className="px-4 py-2.5 rounded-xl text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:border-violet-300 dark:hover:border-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-all duration-200 cursor-pointer"
              >
                <option value="en">English</option>
                <option value="vi">Tiếng Việt</option>
                <option value="zh">中文</option>
              </select>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-custom py-12">
        {/* Progress Steps - Redesigned */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 py-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`
                  relative w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-base transition-all duration-300
                  ${currentStep > step
                    ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
                    : currentStep === step
                      ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-xl shadow-violet-500/40 ring-4 ring-violet-500/20 scale-110'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600'
                  }
                `}>
                  {currentStep > step ? <CheckIcon className="h-6 w-6" /> : step}
                  {currentStep === step && (
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl animate-pulse opacity-20"></div>
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-20 h-1 mx-3 rounded-full transition-all duration-300 ${currentStep > step ? 'bg-gradient-to-r from-emerald-400 to-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`} />
                )}
              </div>
            ))}
          </div>

          {/* Step Labels */}
          <div className="flex items-center justify-center gap-20 pb-4">
            {[
              { num: 1, label: 'Mood & Genre' },
              { num: 2, label: 'Select Songs' },
              { num: 3, label: 'Confirm' }
            ].map((item) => (
              <span key={item.num} className={`text-sm font-semibold transition-colors duration-200 ${
                currentStep >= item.num
                  ? 'text-violet-600 dark:text-violet-400'
                  : 'text-slate-400 dark:text-slate-600'
              }`}>
                {item.label}
              </span>
            ))}
          </div>
        </div>

        {/* Step Content */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Define Your Vibe
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Choose the mood and genre for your perfect playlist
              </p>
            </div>

            {/* Playlist Name */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3 uppercase tracking-wide">
                Playlist Name
              </label>
              <input
                type="text"
                placeholder="Enter playlist name..."
                value={playlistName}
                onChange={(e) => setPlaylistName(e.target.value)}
                className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
              />
            </div>

            {/* Mood Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <span className="text-white text-lg">✨</span>
                </span>
                Select Mood
              </h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-3 mb-6">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    onClick={() => {
                      setMood(m)
                      setCustomMood('')
                    }}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${mood === m && !customMood
                        ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/30 scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-102'
                      }
                    `}
                  >
                    {t(`moods.${m}` as any)}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Custom Mood
                </label>
                <input
                  type="text"
                  placeholder="Enter your mood..."
                  value={customMood}
                  onChange={(e) => {
                    setCustomMood(e.target.value)
                    setMood('')
                  }}
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>

            {/* Genre Selection */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-500 flex items-center justify-center">
                  <span className="text-white text-lg">🎵</span>
                </span>
                Select Genre
              </h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
                {GENRES.map((g) => (
                  <button
                    key={g}
                    onClick={() => {
                      setGenre(g)
                      setCustomGenre('')
                    }}
                    className={`
                      px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200
                      ${genre === g && !customGenre
                        ? 'bg-gradient-to-br from-fuchsia-500 to-pink-500 text-white shadow-lg shadow-fuchsia-500/30 scale-105'
                        : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:scale-102'
                      }
                    `}
                  >
                    {t(`genres.${g}` as any)}
                  </button>
                ))}
              </div>

              <div className="pt-6 border-t-2 border-slate-200 dark:border-slate-700">
                <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                  Custom Genre
                </label>
                <input
                  type="text"
                  placeholder="Enter your genre..."
                  value={customGenre}
                  onChange={(e) => {
                    setCustomGenre(e.target.value)
                    setGenre('')
                  }}
                  className="w-full px-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                />
              </div>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Choose Your Songs
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Selected: <span className="font-bold text-violet-600 dark:text-violet-400">{selectedSongs.length}</span>/20 songs
              </p>
            </div>

            {/* Search Bar - Redesigned */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search for songs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="w-full pl-14 pr-5 py-4 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-base placeholder:text-slate-400 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/20 transition-all duration-200"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={isSearching}
                  className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center gap-2"
                >
                  <MagnifyingGlassIcon className="h-5 w-5" />
                  {isSearching ? 'Searching...' : 'Search'}
                </button>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-6">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={royaltyFreeOnly}
                      onChange={(e) => setRoyaltyFreeOnly(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`w-6 h-6 rounded-lg border-2 transition-all duration-200 ${
                      royaltyFreeOnly
                        ? 'bg-emerald-500 border-emerald-500'
                        : 'border-slate-300 dark:border-slate-600 group-hover:border-emerald-400'
                    }`}>
                      {royaltyFreeOnly && <CheckIcon className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    Royalty-free only
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {searchError && (
                <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded-r-xl">
                  <p className="text-sm font-medium text-red-700 dark:text-red-400">
                    {searchError}
                  </p>
                </div>
              )}
            </div>

            {/* Search Results - Completely Redesigned */}
            {searchResults.length > 0 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <MusicalNoteIcon className="h-5 w-5 text-white" />
                  </span>
                  Search Results
                  <span className="text-sm font-normal text-slate-500">({searchResults.length} songs)</span>
                </h2>
                <div className="grid gap-4">
                  {searchResults.map((song, index) => {
                    const isSelected = selectedSongs.some(s => s.source_id === song.source_id)
                    return (
                      <div
                        key={song.source_id}
                        onClick={() => handleToggleSong(song)}
                        className={`
                          relative p-5 rounded-2xl cursor-pointer transition-all duration-300 border-2
                          ${isSelected
                            ? 'bg-gradient-to-br from-violet-500 to-fuchsia-500 border-transparent shadow-lg shadow-violet-500/30 scale-[1.02]'
                            : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-violet-300 dark:hover:border-violet-700 hover:shadow-md hover:scale-[1.01]'
                          }
                        `}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`
                              w-16 h-16 rounded-xl flex items-center justify-center text-2xl flex-shrink-0
                              ${isSelected
                                ? 'bg-white/20 backdrop-blur-sm'
                                : 'bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900/50 dark:to-fuchsia-900/50'
                              }
                            `}>
                              {song.source === 'youtube' ? '▶️' : song.source === 'soundcloud' ? '🎧' : '🎵'}
                            </div>
                            <div>
                              <p className={`font-bold text-base mb-1 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                                {song.title}
                              </p>
                              <p className={`text-sm ${isSelected ? 'text-white/80' : 'text-slate-500 dark:text-slate-400'}`}>
                                {song.artist}
                              </p>
                              <div className="flex items-center gap-3 mt-2">
                                {song.is_royalty_free && (
                                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                                    isSelected
                                      ? 'bg-white/20 text-white'
                                      : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400'
                                  }`}>
                                    ✓ Royalty Free
                                  </span>
                                )}
                                {song.duration && (
                                  <span className={`text-xs ${isSelected ? 'text-white/60' : 'text-slate-400'}`}>
                                    {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className={`
                            w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200
                            ${isSelected
                              ? 'bg-white/20 backdrop-blur-sm'
                              : 'w-6 h-6 border-2 border-slate-300 dark:border-slate-600'
                            }
                          `}>
                            {isSelected && <CheckIcon className="h-5 w-5 text-white" />}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Selected Songs - Redesigned */}
            {selectedSongs.length > 0 && (
              <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/50 dark:to-fuchsia-950/50 rounded-2xl p-8 shadow-xl border-2 border-violet-200 dark:border-violet-800">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                    <CheckIcon className="h-5 w-5 text-white" />
                  </span>
                  Selected Songs
                  <span className="text-sm font-normal text-violet-600 dark:text-violet-400">({selectedSongs.length}/20)</span>
                </h2>
                <div className="grid gap-3">
                  {selectedSongs.map((song, index) => (
                    <div
                      key={song.source_id}
                      className="bg-white dark:bg-slate-800 rounded-xl p-4 shadow-md border border-slate-200 dark:border-slate-700 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <span className="text-2xl">🎵</span>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-slate-100">{song.title}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{song.artist}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeSong(song.source_id)}
                          className="px-4 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-xl transition-all duration-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="max-w-3xl mx-auto space-y-8">
            {/* Title */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                Almost Done!
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-400">
                Review your playlist settings
              </p>
            </div>

            {/* Audio Gap */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700">
              <label className="block text-sm font-bold text-slate-900 dark:text-slate-100 mb-4">
                Audio Gap Between Songs
              </label>
              <div className="space-y-4">
                <input
                  type="range"
                  min="5"
                  max="10"
                  value={audioGap}
                  onChange={(e) => setAudioGap(Number(e.target.value))}
                  className="w-full h-3 bg-slate-200 dark:bg-slate-700 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-violet-500 [&::-webkit-slider-thumb]:to-fuchsia-500 [&::-webkit-slider-thumb]:shadow-lg [&::-webkit-slider-thumb]:cursor-grab [&::-webkit-slider-thumb]:transition-all [&::-webkit-slider-thumb]:duration-200"
                />
                <div className="flex justify-between text-sm">
                  <span className="font-medium text-slate-500 dark:text-slate-400">5s</span>
                  <span className="text-xl font-bold text-violet-600 dark:text-violet-400">{audioGap}s</span>
                  <span className="font-medium text-slate-500 dark:text-slate-400">10s</span>
                </div>
              </div>
            </div>

            {/* Confirm */}
            <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 dark:from-violet-950/50 dark:to-fuchsia-950/50 rounded-2xl p-8 shadow-xl border-2 border-violet-200 dark:border-violet-800">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">
                <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                  <CheckIcon className="h-5 w-5 text-white" />
                </span>
                Playlist Summary
              </h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {playlistName || `${mood} ${genre} playlist`}
                  </span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Mood</span>
                  <span className="font-bold text-violet-600 dark:text-violet-400 capitalize">{mood || customMood}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Genre</span>
                  <span className="font-bold text-fuchsia-600 dark:text-fuchsia-400 capitalize">{genre?.replace('_', ' ') || customGenre}</span>
                </div>
                <div className="flex justify-between items-center py-4 border-b border-slate-200 dark:border-slate-700">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Songs</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{selectedSongs.length} tracks</span>
                </div>
                <div className="flex justify-between items-center py-4">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">Gap</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">{audioGap} seconds</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons - Redesigned */}
        <div className="flex justify-between mt-12 max-w-4xl mx-auto">
          <button
            onClick={() => setStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="px-8 py-4 rounded-xl font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-200 flex items-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
          >
            {tCommon('back')}
          </button>
          <button
            onClick={handleNextStep}
            disabled={!isStepValid()}
            className="px-8 py-4 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/30 hover:shadow-xl hover:shadow-violet-500/40 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200 flex items-center gap-3"
          >
            {currentStep === 3 ? 'Create Playlist' : tCommon('continue')}
            {currentStep < 3 && <ArrowRightIcon className="h-5 w-5" />}
          </button>
        </div>
      </main>

      {/* Footer - Redesigned */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-20">
        <div className="container-custom py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl shadow-lg">
                <MusicalNoteIcon className="h-6 w-6 text-white" />
              </div>
              <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
                {tCommon('appName')}
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              © 2024 {tCommon('appName')}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors">
                Privacy
              </a>
              <a href="#" className="text-sm text-slate-500 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 font-medium transition-colors">
                Terms
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
