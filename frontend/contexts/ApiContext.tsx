'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'

// Types
export interface Song {
  source_id: string
  title: string
  artist: string
  audio_url: string
  thumbnail_url: string
  duration?: number
  source: string
  is_royalty_free: boolean
}

export interface SearchParams {
  query?: string
  mood?: string
  genre?: string
  sources?: string[]
  limit?: number
  royalty_free_only?: boolean
}

interface ApiContextType {
  // Music Search - DISABLED for hydration fix
  isSearching: boolean
  searchResults: Song[]
  searchError: string | null
  searchMusic: (params: SearchParams) => Promise<void>
  clearSearchResults: () => void

  // API Status - DISABLED for hydration fix
  apiStatus: 'connected' | 'disconnected' | 'checking'
  checkApiStatus: () => Promise<void>
  apiBaseUrl: string

  // Configuration
  setApiBaseUrl: (url: string) => void
}

const ApiContext = createContext<ApiContextType | undefined>(undefined)

export function ApiProvider({ children }: { children: ReactNode }) {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'checking'>('disconnected')
  // Initialize with default value to avoid SSR mismatch
  const [apiBaseUrl, setApiBaseUrlState] = useState('http://localhost:8899')

  // Check API status
  const checkApiStatus = useCallback(async () => {
    // DISABLED - causes hydration issues
    // if (typeof window === 'undefined') return
    // setApiStatus('checking')
    // try {
    //   const response = await fetch(`${apiBaseUrl}/api/music/sources`)
    //   if (response.ok) {
    //     setApiStatus('connected')
    //   } else {
    //     setApiStatus('disconnected')
    //   }
    // } catch (error) {
    //   setApiStatus('disconnected')
    // }
  }, [apiBaseUrl])

  // Search music
  const searchMusic = useCallback(async (params: SearchParams) => {
    if (!params.query?.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      // Import api dynamically to avoid SSR issues
      const { api } = await import('@/lib/api')
      const response = await api.searchMusic({
        q: params.query,
        mood: params.mood,
        genre: params.genre,
        sources: params.sources,
        limit: params.limit || 20,
        royalty_free_only: params.royalty_free_only || false
      })

      const songs: Song[] = response.songs.map((song: any) => ({
        source_id: song.source_id,
        title: song.title,
        artist: song.artist,
        audio_url: song.audio_url,
        thumbnail_url: song.thumbnail_url || '',
        duration: song.duration,
        source: song.source,
        is_royalty_free: song.is_royalty_free
      }))

      setSearchResults(songs)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed'
      setSearchError(errorMessage)
      console.error('Search error:', err)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([])
    setSearchError(null)
  }, [])

  // Set API base URL
  const setApiBaseUrl = useCallback((url: string) => {
    setApiBaseUrlState(url)
  }, [])

  const value: ApiContextType = {
    isSearching,
    searchResults,
    searchError,
    searchMusic,
    clearSearchResults,
    apiStatus,
    checkApiStatus,
    apiBaseUrl,
    setApiBaseUrl
  }

  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

// Custom hook to use API Context
export function useApi() {
  const context = useContext(ApiContext)
  if (context === undefined) {
    throw new Error('useApi must be used within an ApiProvider')
  }
  return context
}
