import { useState } from 'react'
import { api } from '@/lib/api'

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

export function useMusicSearch() {
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<Song[]>([])
  const [error, setError] = useState<string | null>(null)

  const search = async (params: SearchParams) => {
    if (!params.query?.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    setError(null)

    try {
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
      return songs
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Search failed. Please check if backend is running.'
      setError(errorMessage)
      console.error('Search error:', err)
      return []
    } finally {
      setIsSearching(false)
    }
  }

  const clearResults = () => {
    setSearchResults([])
    setError(null)
  }

  return {
    isSearching,
    searchResults,
    error,
    search,
    clearResults
  }
}
