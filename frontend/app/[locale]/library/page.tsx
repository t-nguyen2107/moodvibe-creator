'use client'

import { useEffect, useState, useMemo } from 'react'
import { api } from '@/lib/api'
import { useRouter } from 'next/navigation'
import { useLocale } from 'next-intl'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PlaylistGrid } from '@/components/library/PlaylistGrid'
import { LibraryLoading } from '@/components/library/LibraryLoading'
import { LibraryEmpty } from '@/components/library/LibraryEmpty'
import { LibraryHero } from '@/components/library/LibraryHero'
import { LibraryFilters, SortOption, FilterMood } from '@/components/library/LibraryFilters'
import type { Playlist } from '@/lib/store'

/**
 * Library Page - Modern Card Grid Design
 */

export default function LibraryPage() {
  const router = useRouter()
  const locale = useLocale()
  const [playlists, setPlaylists] = useState<Playlist[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [filterMood, setFilterMood] = useState<FilterMood>('all')
  const [showFilters, setShowFilters] = useState(false)

  const localizedHref = (href: string) => `/${locale}${href}`

  useEffect(() => {
    loadPlaylists()
  }, [])

  const loadPlaylists = async () => {
    try {
      const data = await api.getPlaylists()
      setPlaylists(data)
    } catch (error) {
      console.error('Error loading playlists:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleViewPlaylist = (id: number) => {
    router.push(localizedHref(`/playlist/${id}`))
  }

  const handleDeletePlaylist = async (id: number) => {
    if (confirm('Delete this playlist?')) {
      try {
        await api.deletePlaylist(id)
        loadPlaylists()
      } catch (error) {
        console.error('Error deleting playlist:', error)
      }
    }
  }

  const handleCreateClick = () => {
    router.push(localizedHref('/create'))
  }

  // Filter and sort playlists
  const filteredAndSortedPlaylists = useMemo(() => {
    let filtered = [...playlists]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.mood?.toLowerCase().includes(query) ||
          p.genre?.toLowerCase().includes(query)
      )
    }

    // Apply mood filter
    if (filterMood !== 'all') {
      filtered = filtered.filter((p) => p.mood?.toLowerCase() === filterMood.toLowerCase())
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.created_at ? new Date(b.created_at).getTime() : 0) -
                 (a.created_at ? new Date(a.created_at).getTime() : 0)
        case 'oldest':
          return (a.created_at ? new Date(a.created_at).getTime() : 0) -
                 (b.created_at ? new Date(b.created_at).getTime() : 0)
        case 'name-asc':
          return a.name.localeCompare(b.name)
        case 'name-desc':
          return b.name.localeCompare(a.name)
        case 'songs':
          return (b.song_count || 0) - (a.song_count || 0)
        default:
          return 0
      }
    })

    return filtered
  }, [playlists, searchQuery, sortBy, filterMood])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="relative min-h-screen">
        {/* Loading State */}
        {loading && <LibraryLoading />}

        {/* Empty State - Show beautiful hero when no playlists */}
        {!loading && playlists.length === 0 && (
          <LibraryHero onCreateClick={handleCreateClick} />
        )}

        {/* Playlist Grid - Shown first when playlists exist */}
        {!loading && playlists.length > 0 && (
          <>
            {/* Filters */}
            <LibraryFilters
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              sortBy={sortBy}
              onSortChange={setSortBy}
              filterMood={filterMood}
              onFilterMoodChange={setFilterMood}
              showFilters={showFilters}
              onToggleFilters={() => setShowFilters(!showFilters)}
            />

            {/* Playlist Grid */}
            <PlaylistGrid
              playlists={filteredAndSortedPlaylists}
              onView={handleViewPlaylist}
              onDelete={handleDeletePlaylist}
              onCreateClick={handleCreateClick}
            />

            {/* No Results Message */}
            {!loading && filteredAndSortedPlaylists.length === 0 && playlists.length > 0 && (
              <div className="text-center py-20 px-4">
                <div className="inline-flex flex-col items-center gap-4">
                  <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                    <svg className="h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-lg">
                    No playlists match your search
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setFilterMood('all')
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-600 hover:to-magenta-600 text-white rounded-xl font-semibold transition-all"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
