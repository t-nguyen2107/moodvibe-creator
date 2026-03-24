/**
 * Music API Integration Functions
 * Handles AI-powered natural language music search
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8899'

// ===== Types =====

export interface AIParsedQuery {
  mood?: string
  genre?: string
  era?: string
  language?: string
  energy_level?: string
  tempo?: string
  trending?: boolean
  original_query: string
}

export interface AISearchParams {
  query: string
  language?: string
  // Advanced filters (arrays for multi-select)
  moods?: string[]
  genres?: string[]
  eras?: string[]
  languages?: string[]
  sources?: string[]
  limit?: number
  royalty_free_only?: boolean
  trending?: boolean
}

export interface SearchSuggestion {
  text: string
  type: 'trending' | 'personalized' | 'related'
  frequency?: number
}

export interface MusicSearchResponse {
  songs: Song[]
  total: number
  parsed_query?: AIParsedQuery
}

export interface Song {
  source_id: string
  title: string
  artist?: string
  audio_url: string
  thumbnail_url?: string
  duration?: number
  source: string
  is_royalty_free: boolean
  trending_rank?: number
  listeners_count?: number
  is_viral?: boolean
  rank_score?: number  // Overall ranking score (0.0 to 1.0)
  rank_position?: number  // Position in ranked results (1-indexed)
}

// ===== API Functions =====

/**
 * Parse natural language query into structured search parameters
 * @param query - Natural language search query (e.g., "chill vibes for coding")
 * @param language - User's language code (en, vi, ko, zh, ja, es)
 * @returns AI-parsed query parameters
 */
export async function aiParseQuery(query: string, language: string = 'en'): Promise<AIParsedQuery> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/ai-parse`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query, language }),
    })

    if (!response.ok) {
      throw new Error(`AI parse failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error parsing query with AI:', error)
    // Return minimal parsed query on error
    return {
      original_query: query,
    }
  }
}

/**
 * Search for music using AI-powered natural language processing
 * @param params - Search parameters including natural language query
 * @returns Search results with songs and parsed query
 */
export async function searchWithAI(params: AISearchParams): Promise<MusicSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/ai-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`AI search failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching with AI:', error)
    throw error
  }
}

/**
 * Get search suggestions based on partial query
 * @param query - Partial search query
 * @param language - User's language code
 * @returns Array of search suggestions
 */
export async function getSearchSuggestions(
  query: string,
  language: string = 'en'
): Promise<SearchSuggestion[]> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/music/suggestions?q=${encodeURIComponent(query)}&lang=${language}`
    )

    if (!response.ok) {
      throw new Error(`Failed to get suggestions: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return []
  }
}

/**
 * Search Spotify for music
 * @param params - Search parameters
 * @returns Search results from Spotify
 */
export async function searchSpotify(params: {
  query: string
  limit?: number
  market?: string
}): Promise<MusicSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/spotify/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Spotify search failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching Spotify:', error)
    throw error
  }
}

/**
 * Search Zing MP3 for music
 * @param params - Search parameters
 * @returns Search results from Zing MP3
 */
export async function searchZing(params: {
  query: string
  limit?: number
}): Promise<MusicSearchResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/zing/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    })

    if (!response.ok) {
      throw new Error(`Zing search failed: ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('Error searching Zing:', error)
    throw error
  }
}

/**
 * Get available music sources
 * @returns List of available music sources
 */
export async function getAvailableSources(): Promise<string[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/sources`)

    if (!response.ok) {
      throw new Error(`Failed to get sources: ${response.statusText}`)
    }

    const data = await response.json()
    return data.sources || []
  } catch (error) {
    console.error('Error getting available sources:', error)
    return ['youtube', 'spotify', 'soundcloud', 'deezer']
  }
}

/**
 * Get audio preview URL for a song
 * @param source - Music source (youtube, spotify, soundcloud, zing)
 * @param sourceId - Song ID from the source
 * @returns Audio preview URL
 */
export async function getAudioPreview(source: string, sourceId: string): Promise<string> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/music/preview/${source}/${sourceId}`)

    if (!response.ok) {
      throw new Error(`Failed to get preview: ${response.statusText}`)
    }

    const data = await response.json()
    return data.preview_url || ''
  } catch (error) {
    console.error('Error getting audio preview:', error)
    return ''
  }
}

// ===== Helper Functions =====

/**
 * Format duration from seconds to MM:SS
 * @param seconds - Duration in seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds?: number): string {
  if (!seconds) return '--:--'
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

/**
 * Format listener count (e.g., 1.2M, 450K)
 * @param count - Number of listeners
 * @returns Formatted listener count
 */
export function formatListenerCount(count?: number): string {
  if (!count) return ''
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1)}M listeners`
  } else if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}K listeners`
  }
  return `${count} listeners`
}

/**
 * Get trending badge color based on rank
 * @param rank - Trending rank (1-50)
 * @returns Badge color class
 */
export function getTrendingBadgeColor(rank: number): string {
  if (rank <= 10) return 'text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/50'
  if (rank <= 30) return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
  if (rank <= 50) return 'text-orange-700 bg-orange-100 dark:text-orange-400 dark:bg-orange-900/50'
  return 'text-slate-600 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
}

/**
 * Get trending badge label based on rank
 * @param rank - Trending rank
 * @returns Badge label
 */
export function getTrendingBadgeLabel(rank: number): string {
  if (rank <= 10) return `🏆 Top ${rank}`
  if (rank <= 30) return `⭐ #${rank}`
  if (rank <= 50) return `🔥 #${rank}`
  return `#${rank}`
}
