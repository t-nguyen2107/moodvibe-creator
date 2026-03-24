import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ===== Song & Playlist Types =====

export interface Song {
  id?: number
  title: string
  artist?: string
  source: string
  source_id: string
  duration?: number
  audio_url?: string
  thumbnail_url?: string
  is_royalty_free: boolean
  position?: number
  trending_rank?: number
  listeners_count?: number
  is_viral?: boolean
}

export interface Playlist {
  id?: number
  name: string
  mood?: string
  genre?: string
  is_royalty_free: boolean
  show_song_list: boolean
  description?: string
  cover_image_path?: string
  audio_path?: string
  video_path?: string
  song_count?: number
  created_at?: string
  updated_at?: string
  songs?: Song[]
}

// ===== Search Types =====

export interface SearchFilters {
  moods?: string[]
  genres?: string[]
  eras?: string[]
  languages?: string[]
  sources?: string[]
  royalty_free_only?: boolean
  trending?: boolean
}

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

// ===== Playlist Store =====

interface PlaylistStore {
  currentPlaylist: Playlist | null
  selectedSongs: Song[]
  currentStep: number
  setPlaylist: (playlist: Playlist) => void
  addSong: (song: Song) => void
  removeSong: (sourceId: string) => void
  updateSongAudioUrl: (sourceId: string, audioUrl: string) => void
  setStep: (step: number) => void
  reset: () => void
}

export const usePlaylistStore = create<PlaylistStore>((set) => ({
  currentPlaylist: null,
  selectedSongs: [],
  currentStep: 1,

  setPlaylist: (playlist) => set({ currentPlaylist: playlist }),

  addSong: (song) => set((state) => {
    if (state.selectedSongs.length >= 20) {
      return state
    }
    return { selectedSongs: [...state.selectedSongs, song] }
  }),

  removeSong: (sourceId) => set((state) => ({
    selectedSongs: state.selectedSongs.filter(s => s.source_id !== sourceId)
  })),

  updateSongAudioUrl: (sourceId, audioUrl) => set((state) => ({
    selectedSongs: state.selectedSongs.map(s =>
      s.source_id === sourceId ? { ...s, audio_url: audioUrl } : s
    )
  })),

  setStep: (step) => set({ currentStep: step }),

  reset: () => set({
    currentPlaylist: null,
    selectedSongs: [],
    currentStep: 1
  })
}))

// ===== Music Search Store =====

interface MusicSearchStore {
  // Search State
  searchQuery: string
  aiParsedQuery: AIParsedQuery | null
  searchResults: Song[]
  isSearching: boolean
  searchError: string | null

  // Filters
  showAdvancedFilters: boolean
  filters: SearchFilters

  // UI State
  showSuggestions: boolean
  suggestions: string[]
  selectedSuggestionIndex: number

  // Actions
  setSearchQuery: (query: string) => void
  setAIParsedQuery: (parsedQuery: AIParsedQuery | null) => void
  setSearchResults: (results: Song[]) => void
  setIsSearching: (isSearching: boolean) => void
  setSearchError: (error: string | null) => void
  clearSearch: () => void

  // Filter Actions
  toggleFilters: () => void
  setFilters: (filters: Partial<SearchFilters>) => void
  resetFilters: () => void

  // Suggestion Actions
  setShowSuggestions: (show: boolean) => void
  setSuggestions: (suggestions: string[]) => void
  setSelectedSuggestionIndex: (index: number) => void
}

export const useMusicSearchStore = create<MusicSearchStore>()(
  persist(
    (set) => ({
      // Initial State
      searchQuery: '',
      aiParsedQuery: null,
      searchResults: [],
      isSearching: false,
      searchError: null,

      // Filters
      showAdvancedFilters: false,
      filters: {
        sources: ['youtube', 'spotify', 'soundcloud', 'deezer'],
        royalty_free_only: false,
        trending: false,
      },

      // UI State
      showSuggestions: false,
      suggestions: [],
      selectedSuggestionIndex: -1,

      // Search Actions
      setSearchQuery: (query) => set({ searchQuery: query }),

      setAIParsedQuery: (parsedQuery) => set({ aiParsedQuery: parsedQuery }),

      setSearchResults: (results) => set({ searchResults: results }),

      setIsSearching: (isSearching) => set({ isSearching }),

      setSearchError: (error) => set({ searchError: error }),

      clearSearch: () => set({
        searchQuery: '',
        aiParsedQuery: null,
        searchResults: [],
        searchError: null,
        showSuggestions: false,
        suggestions: [],
        selectedSuggestionIndex: -1,
      }),

      // Filter Actions
      toggleFilters: () => set((state) => ({
        showAdvancedFilters: !state.showAdvancedFilters
      })),

      setFilters: (newFilters) => set((state) => ({
        filters: { ...state.filters, ...newFilters }
      })),

      resetFilters: () => set({
        filters: {
          sources: ['youtube', 'spotify', 'soundcloud', 'deezer'],
          royalty_free_only: false,
          trending: false,
        }
      }),

      // Suggestion Actions
      setShowSuggestions: (show) => set({ showSuggestions: show }),

      setSuggestions: (suggestions) => set({ suggestions }),

      setSelectedSuggestionIndex: (index) => set({ selectedSuggestionIndex: index }),
    }),
    {
      name: 'music-search-storage',
      partialize: (state) => ({
        filters: state.filters,
        showAdvancedFilters: state.showAdvancedFilters,
      }),
    }
  )
)
