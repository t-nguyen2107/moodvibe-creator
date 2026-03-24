'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { MagnifyingGlassIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/outline'
import { useMusicSearchStore } from '@/lib/store'
import { useDebounce } from '@/hooks/useDebounce'

/**
 * AI-Powered Natural Language Music Search Component
 * Features:
 * - Large, centered search bar (60% viewport width on desktop)
 * - Rotating placeholder text every 3 seconds
 * - Debounced API calls (2 seconds)
 * - Real-time inline autocomplete suggestions
 * - AbortController to cancel searches when query changes
 * - Glassmorphism effect
 * - Animated gradient background
 */

const PLACEHOLDERS = [
  'chill vibes for coding',
  'nhạc K-pop tập gym',
  'nay buồn quá, tìm bài cho anh',
  'sad breakup songs from 90s',
  'upbeat Vietnamese songs',
  'workout motivation playlist',
  'Korean ballads for rainy days',
  'hôm nay vui vẻ, nhạc sôi động thôi',
  'trending TikTok songs',
  'classic rock road trip',
  'muốn nghe nhạc chill để làm việc',
  'nhạc buồn cho những ngày mưa',
  'party all night, upbeat hits',
]

interface AIMusicSearchProps {
  royaltyFreeOnly?: boolean
}

export function AIMusicSearch({ royaltyFreeOnly = false }: AIMusicSearchProps) {
  const t = useTranslations('search')
  const [localQuery, setLocalQuery] = useState('')
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const [fontSize, setFontSize] = useState('text-2xl')
  const [searchProgressText, setSearchProgressText] = useState('')

  // Ref to track and cancel ongoing search requests
  const abortControllerRef = useRef<AbortController | null>(null)
  const searchStartTimeRef = useRef<number>(0)
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const {
    searchQuery,
    setSearchQuery,
    setSearchResults,
    isSearching,
    setIsSearching,
    setSearchError,
    suggestions,
    setSuggestions,
    showSuggestions,
    setShowSuggestions,
    selectedSuggestionIndex,
    setSelectedSuggestionIndex,
  } = useMusicSearchStore()

  // Debounce the search query - optimized for speed
  const debouncedQuery = useDebounce(localQuery, 1000)  // Reduced to 1s for faster feedback

  // Rotate placeholder text every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  // Cleanup on component unmount - cancel any pending requests
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [])

  // Sync external searchQuery changes to localQuery (for example clicks)
  useEffect(() => {
    if (searchQuery && searchQuery !== localQuery) {
      setLocalQuery(searchQuery)
    }
  }, [searchQuery])

  // Re-trigger search when royaltyFreeOnly changes (if there's an active query)
  useEffect(() => {
    if (debouncedQuery.trim() && royaltyFreeOnly !== undefined) {
      // Force re-search by updating a timestamp or similar
      const performSearch = async () => {
        if (!debouncedQuery.trim()) {
          setSearchResults([])
          setIsSearching(false)
          return
        }

        if (abortControllerRef.current) {
          abortControllerRef.current.abort()
        }

        const abortController = new AbortController()
        abortControllerRef.current = abortController

        setIsSearching(true)
        setSearchError(null)

        try {
          const response = await fetch('http://localhost:8899/api/music/ai-search', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: debouncedQuery,
              language: 'en',
              limit: 10,
              sources: ['youtube', 'soundcloud', 'deezer'],
              royalty_free_only: royaltyFreeOnly,
              trending: false
            }),
            signal: abortController.signal
          })

          if (abortController.signal.aborted) {
            return
          }

          const data = await response.json()

          if (!abortController.signal.aborted) {
            setSearchResults(data.songs || [])
            setSearchQuery(debouncedQuery)
          }

        } catch (error) {
          if (error instanceof Error && error.name === 'AbortError') {
            console.log('Search request cancelled')
            return
          }

          const errorMessage = error instanceof Error ? error.message : 'Search failed'
          if (!abortController.signal.aborted) {
            setSearchError(errorMessage)
            console.error('Search error:', error)
          }
        } finally {
          if (!abortController.signal.aborted) {
            setIsSearching(false)
          }
        }
      }

      performSearch()
    }
  }, [royaltyFreeOnly])

  // Fetch suggestions when query changes
  useEffect(() => {
    const fetchSuggestions = () => {
      if (!localQuery.trim() || localQuery.length < 2) {
        setSuggestions([])
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        return
      }

      const queryLower = localQuery.toLowerCase().trim()

      // Comprehensive suggestion library with 50+ options
      const allSuggestions = [
        // Natural conversational Vietnamese
        'nay buồn quá, tìm bài cho anh',
        'hôm nay vui vẻ, nhạc sôi động thôi',
        'muốn nghe nhạc chill để làm việc',
        'nhạc buồn cho những ngày mưa',
        'tìm nhạc tập gym đi',
        'cho anh vài bài K-pop hay',
        'nhạc để coding buồn ngủ quá',
        'muốn nghe nhạc bolero',
        'nhạc vàng xưa',
        'nhạc trẻ remix sôi động',

        // Mood-based suggestions
        'chill vibes for coding',
        'chill lo-fi beats for studying',
        'chill acoustic morning songs',
        'chill evening relaxation music',
        'sad breakup songs from 90s',
        'sad emotional ballads',
        'sad rainy day music',
        'happy upbeat pop hits',
        'happy feel good songs',
        'romantic dinner music',
        'romantic love songs',
        'angry rock metal songs',
        'energetic party dance hits',

        // Activity-based suggestions
        'workout motivation playlist',
        'workout cardio music',
        'workout gym pump up songs',
        'focus and study music',
        'focus deep work concentration',
        'running upbeat music',
        'yoga meditation relaxation',
        'sleep calming instrumental',
        'sleep soft piano music',
        'driving road trip classics',
        'cooking background music',
        'reading ambient music',

        // Genre-based suggestions
        'K-pop upbeat songs',
        'nhạc K-pop vui vẻ',
        'nhạc Việt hot trending',
        'nhạc trữ tình bolero',
        'Korean ballads for rainy days',
        'Vietnamese pop hits 2024',
        'classic rock road trip',
        'electronic dance music EDM',
        'jazz lounge cafe music',
        'classical piano study music',
        'hip hop rap workout',
        'reggae beach vibes',
        'country acoustic songs',
        'indie folk playlist',
        'rnb slow jams',

        // Platform/trending based
        'trending TikTok songs',
        'viral Instagram reels music',
        'YouTube trending 2024',
        'Spotify top hits global',
        'SoundCloud underground tracks',
        'billboard hot 100 current',

        // Special collections
        '90s nostalgia hits',
        '80s synthwave retro',
        '2000s throwback songs',
        'disco funky grooves',
        'anime opening themes',
        'movie soundtrack favorites',
        'gaming background music',
        'christmas holiday music',
      ]

      // Smart filtering with prefix matching (like Google)
      const matchedSuggestions = allSuggestions
        .filter(s => {
          const sLower = s.toLowerCase()
          // Prefix match (highest priority)
          if (sLower.startsWith(queryLower)) return true
          // Word boundary match
          if (sLower.includes(' ' + queryLower)) return true
          return false
        })
        // Sort by relevance: shorter first, exact prefix first
        .sort((a, b) => {
          const aLower = a.toLowerCase()
          const bLower = b.toLowerCase()
          const aExactStart = aLower.startsWith(queryLower)
          const bExactStart = bLower.startsWith(queryLower)

          if (aExactStart && !bExactStart) return -1
          if (!aExactStart && bExactStart) return 1
          return a.length - b.length
        })
        .slice(0, 8) // Show up to 8 suggestions

      setSuggestions(matchedSuggestions)
      setShowSuggestions(matchedSuggestions.length > 0)

      // Auto-select first suggestion
      if (matchedSuggestions.length > 0 && selectedSuggestionIndex === -1) {
        setSelectedSuggestionIndex(0)
      } else if (matchedSuggestions.length > 0 && selectedSuggestionIndex >= matchedSuggestions.length) {
        setSelectedSuggestionIndex(0)
      } else if (matchedSuggestions.length === 0) {
        setSelectedSuggestionIndex(-1)
      }
    }

    fetchSuggestions()
  }, [localQuery, selectedSuggestionIndex, setSuggestions, setShowSuggestions, setSelectedSuggestionIndex])

  // Hide suggestions when search completes
  useEffect(() => {
    if (!isSearching && searchQuery) {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }, [isSearching, searchQuery, setShowSuggestions, setSelectedSuggestionIndex])

  // Auto-adjust font size based on text length
  useEffect(() => {
    const textLength = localQuery.length
    if (textLength === 0) {
      setFontSize('text-2xl')
    } else if (textLength < 30) {
      setFontSize('text-2xl')
    } else if (textLength < 50) {
      setFontSize('text-xl')
    } else if (textLength < 70) {
      setFontSize('text-lg')
    } else {
      setFontSize('text-base')
    }
  }, [localQuery])

  // Perform AI search when debounced query changes
  useEffect(() => {
    // Cancel any ongoing search request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setSearchResults([])
        setIsSearching(false)
        return
      }

      // Create new AbortController for this search
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      setIsSearching(true)
      setSearchError(null)
      searchStartTimeRef.current = Date.now()

      // Start progress text animation
      const progressMessages = [
        { time: 0, text: t('thinking') },
        { time: 5000, text: t('searching') },
        { time: 15000, text: t('loadingResults') },
        { time: 25000, text: t('almostDone') },
      ]

      setSearchProgressText(progressMessages[0].text)

      progressIntervalRef.current = setInterval(() => {
        const elapsed = Date.now() - searchStartTimeRef.current
        let currentMessage = progressMessages[0].text

        for (let i = progressMessages.length - 1; i >= 0; i--) {
          if (elapsed >= progressMessages[i].time) {
            currentMessage = progressMessages[i].text
            break
          }
        }

        setSearchProgressText(currentMessage)
      }, 1000)

      try {
        // Detect language from query
        const detectLanguage = (query: string): string => {
          const vietnameseRegex = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i
          const koreanRegex = /[ㄱ-ㅣ가-힣]/

          if (vietnameseRegex.test(query)) return 'vi'
          if (koreanRegex.test(query)) return 'ko'
          if (/[\u0400-\u04FF]/.test(query)) return 'ru'
          if (/[\u0600-\u06FF]/.test(query)) return 'ar'
          if (/[\u4E00-\u9FFF]/.test(query)) return 'zh'
          if (/[\u3040-\u309F\u30A0-\u30FF]/.test(query)) return 'ja'
          if (/[ñáéíóúü]/i.test(query)) return 'es'
          return 'en'
        }

        const detectedLang = detectLanguage(debouncedQuery)

        // Call the actual search API with abort signal
        // OPTIMIZATION: Search only YouTube first for speed, add more sources if needed
        const response = await fetch('http://localhost:8899/api/music/ai-search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: debouncedQuery,
            language: detectedLang,
            limit: 10,
            // Active optimization: Start with YouTube only for faster results, can expand to more sources if needed
            //sources: ['youtube', 'soundcloud', 'deezer'],
            sources: ['youtube'], // Start with fewer sources for speed
            royalty_free_only: royaltyFreeOnly,
            trending: false
          }),
          signal: abortController.signal
        })

        // Check if request was aborted
        if (abortController.signal.aborted) {
          return
        }

        const data = await response.json()

        // Only update results if this request wasn't aborted
        if (!abortController.signal.aborted) {
          setSearchResults(data.songs || [])
          setSearchQuery(debouncedQuery)
        }

      } catch (error) {
        // Don't show error if request was aborted
        if (error instanceof Error && error.name === 'AbortError') {
          console.log('Search request cancelled')
          return
        }

        const errorMessage = error instanceof Error ? error.message : 'Search failed'
        if (!abortController.signal.aborted) {
          setSearchError(errorMessage)
          console.error('Search error:', error)
        }
      } finally {
        // Clear progress interval
        if (progressIntervalRef.current) {
          clearInterval(progressIntervalRef.current)
          progressIntervalRef.current = null
        }

        // Only update searching state if this is still the current request
        if (!abortController.signal.aborted) {
          setIsSearching(false)
          setSearchProgressText('')
        }
      }
    }

    performSearch()

    // Cleanup function to cancel request when component unmounts or query changes
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
        abortControllerRef.current = null
      }
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current)
        progressIntervalRef.current = null
      }
    }
  }, [debouncedQuery, setSearchResults, setIsSearching, setSearchError, setSearchQuery])

  // Handle search input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocalQuery(value)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setLocalQuery(suggestion)
    setSearchQuery(suggestion)
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
  }

  // Handle clear button
  const handleClear = () => {
    // Cancel any ongoing search
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }

    // Clear progress interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current)
      progressIntervalRef.current = null
    }

    setLocalQuery('')
    setSearchQuery('')
    setSearchResults([])
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    setIsSearching(false)
    setSearchProgressText('')
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle suggestion navigation
    if (showSuggestions && suggestions.length > 0) {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedSuggestionIndex(selectedSuggestionIndex < suggestions.length - 1 ? selectedSuggestionIndex + 1 : 0)
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedSuggestionIndex(selectedSuggestionIndex > 0 ? selectedSuggestionIndex - 1 : suggestions.length - 1)
          break
        case 'Tab':
          e.preventDefault()
          if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
            handleSuggestionClick(suggestions[selectedSuggestionIndex])
          }
          break
        case 'Enter':
          e.preventDefault()
          if (selectedSuggestionIndex >= 0 && suggestions[selectedSuggestionIndex]) {
            handleSuggestionClick(suggestions[selectedSuggestionIndex])
          } else {
            setSearchQuery(localQuery)
          }
          break
        case 'Escape':
          setShowSuggestions(false)
          setSelectedSuggestionIndex(-1)
          break
      }
      return
    }

    // Handle regular search
    if (e.key === 'Enter') {
      e.preventDefault()
      setSearchQuery(localQuery)
    } else if (e.key === 'Tab' && localQuery && suggestions.length > 0 && selectedSuggestionIndex >= 0) {
      e.preventDefault()
      handleSuggestionClick(suggestions[selectedSuggestionIndex])
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      {/* Search Bar Container - New Design */}
      <div className="relative">
        <div className="relative group">
          {/* Input Container */}
          <div className="relative">
            {/* Gradient Border on Hover/Focus */}
            <div className="absolute -inset-[2px] bg-gradient-to-r from-blue-400 via-rose-400 to-orange-400 rounded-3xl opacity-0 group-hover:opacity-20 group-focus-within:opacity-30 blur-xl transition-all duration-500" />

            {/* Search Icon - No Border, Centered with Text */}
            <div className="absolute left-6 top-1/2 -translate-y-1/2 z-10">
              <MagnifyingGlassIcon className="h-7 w-7 text-slate-400 group-focus-within:text-orange-600 transition-colors duration-300" />
            </div>

            {/* Input Field - Clean & Modern with Inline Autocomplete */}
            <div className="relative">
              {/* Input */}
              <input
                type="text"
                value={localQuery}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={PLACEHOLDERS[placeholderIndex]}
                className={`
                  relative w-full pl-20 pr-44 py-6
                  bg-white dark:bg-slate-900
                  border-2 border-slate-200 dark:border-slate-700
                  rounded-3xl
                  font-medium text-slate-900 dark:text-slate-100
                  placeholder:text-slate-400 dark:placeholder:text-slate-500
                  placeholder:font-normal placeholder:text-2xl
                  focus:outline-none
                  focus:border-orange-500 dark:focus:border-orange-600
                  focus:shadow-[0_0_0_6px_rgba(249,115,22,0.12)]
                  transition-all duration-300
                  shadow-lg
                  hover:shadow-xl
                  hover:border-slate-300 dark:hover:border-slate-600
                  ${fontSize}
                `}
                style={{ caretColor: '#f97316' }}
                aria-label="Search for music"
                autoComplete="off"
              />

              {/* Inline Suggestion - Perfect alignment overlay */}
              {showSuggestions && suggestions.length > 0 && selectedSuggestionIndex >= 0 && localQuery && (
                <div
                  className="absolute top-0 left-0 pointer-events-none overflow-hidden"
                  style={{
                    padding: '1.5rem 11rem 1.5rem 5rem', // Match input: py-6 pl-20 pr-44
                  }}
                >
                  <span className={`${fontSize} font-medium whitespace-nowrap inline-block`}>
                    {/* Typed text - invisible but takes up space */}
                    <span className="text-transparent">{localQuery}</span>
                    {/* Suggestion completion - gray */}
                    <span className="text-slate-400 dark:text-slate-500">
                      {suggestions[selectedSuggestionIndex].substring(localQuery.length)}
                    </span>
                  </span>
                </div>
              )}
            </div>

            {/* Clear Button */}
            {localQuery && (
              <button
                onClick={handleClear}
                className="absolute right-48 top-1/2 -translate-y-1/2 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110 active:scale-95 z-20"
                aria-label="Clear search"
              >
                <XMarkIcon className="h-6 w-6 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors" />
              </button>
            )}

            {/* Search Button - Enhanced */}
            <button
              onClick={() => setSearchQuery(localQuery)}
              disabled={!localQuery.trim()}
              className={`
                absolute right-2 top-1/2 -translate-y-1/2
                px-7 py-4
                bg-gradient-to-br from-orange-600 via-orange-700 to-rose-600
                hover:from-orange-700 hover:via-orange-800 hover:to-rose-700
                text-white font-bold rounded-2xl
                shadow-lg shadow-orange-600/30
                hover:shadow-xl hover:shadow-orange-600/40
                hover:scale-105
                active:scale-95
                disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:shadow-lg
                transition-all duration-200
                flex items-center gap-2.5
                overflow-hidden
              `}
              aria-label="Search"
            >
              {/* Animated Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/0 to-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />

              {/* Icon with Glow */}
              <div className="relative z-10">
                <div className="absolute inset-0 bg-white rounded-full blur-md opacity-20" />
                <SparklesIcon className="relative z-10 h-5 w-5" />
              </div>

              <span className="hidden sm:inline text-lg font-bold relative z-10">{t('aiSearch')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search Progress - AI Chat Style */}
      {isSearching && localQuery && (
        <div className="mt-4 flex items-center gap-2">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-400/60" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-400/60" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2 h-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full animate-bounce shadow-lg shadow-orange-400/60" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span className="text-sm font-semibold bg-gradient-to-r from-amber-300 via-orange-400 to-rose-400 bg-clip-text text-transparent animate-pulse">
            {searchProgressText || 'Đang tìm kiếm...'}
          </span>
        </div>
      )}
    </div>
  )
}
