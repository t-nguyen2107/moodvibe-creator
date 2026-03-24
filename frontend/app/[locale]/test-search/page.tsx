'use client'

import { useState } from 'react'
import { MusicalNoteIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline'

export default function TestSearchPage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    try {
      // Direct API call without context
      const response = await fetch('http://localhost:8899/api/music/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: 'en', limit: 10 })
      })

      const data = await response.json()
      setResults(data.songs || [])

      console.log('AI Parsed Query:', data.parsed_query)
      console.log('Found songs:', data.songs?.length)
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-8">
      {/* Simple Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center mb-4">🎵 AI Music Search Test</h1>
        <p className="text-center text-muted-foreground">Test page - no hydration issues</p>
      </div>

      {/* Search Section */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <label className="block text-sm font-medium text-slate-900 dark:text-slate-100 mb-3">
            Natural Language Search
          </label>

          <div className="flex gap-3 mb-4">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="e.g., chill vibes for coding"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleSearch}
              disabled={loading || !query.trim()}
              className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Examples */}
          <div className="flex flex-wrap gap-2">
            {['chill lo-fi beats', 'nhạc K-pop tập gym', 'upbeat workout music'].map((example) => (
              <button
                key={example}
                onClick={() => setQuery(example)}
                className="px-3 py-1.5 text-sm bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-lg text-slate-700 dark:text-slate-300 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Section */}
      {results.length > 0 && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
              Search Results ({results.length} songs)
            </h2>

            <div className="space-y-3">
              {results.map((song, index) => (
                <div
                  key={song.source_id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all hover:shadow-md"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/50 dark:to-purple-900/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-2xl">
                        {song.source === 'youtube' ? '▶️' : song.source === 'soundcloud' ? '🎧' : '🎵'}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900 dark:text-slate-100 truncate">
                        {song.title}
                      </p>
                      <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                        {song.artist}
                      </p>
                      <div className="flex items-center gap-3 mt-1">
                        {song.duration && (
                          <span className="text-xs text-slate-400">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </span>
                        )}
                        <span className="text-xs bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-slate-600">
                          {song.source}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Status */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">
            API Status
          </h2>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Backend:</span>
              <span className="font-mono text-sm bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded">
                http://localhost:8899
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Health Check:</span>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('http://localhost:8899/api/music/ai-health')
                    const data = await res.json()
                    console.log('Health check:', data)
                    alert('Backend healthy! ✅\n' + JSON.stringify(data, null, 2))
                  } catch (err) {
                    alert('Backend error! ❌\n' + err)
                  }
                }}
                className="text-sm bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600"
              >
                Check Health
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="max-w-4xl mx-auto mt-8">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800">
          <h3 className="font-bold text-slate-900 dark:text-slate-100 mb-2">📝 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700 dark:text-slate-300">
            <li>Type: <code>"chill vibes for coding"</code></li>
            <li>Type: <code>"nhạc K-pop tập gym"</code></li>
            <li>Click Search button</li>
            <li>Check console for AI parsed query</li>
            <li>Verify songs appear below</li>
            <li>Try clicking Health Check button</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
