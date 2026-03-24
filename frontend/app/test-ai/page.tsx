'use client'

import { useState } from 'react'

export default function TestAIPage() {
  const [query, setQuery] = useState('chill vibes for coding')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSearch = async () => {
    if (!query.trim()) return

    setLoading(true)
    setError('')
    setResults([])

    try {
      console.log('Searching for:', query)
      const response = await fetch('http://localhost:8899/api/music/ai-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, language: 'en', limit: 5 })
      })

      console.log('Response status:', response.status)

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log('Response data:', data)

      setResults(data.songs || [])
      console.log('✅ Found', data.songs?.length, 'songs')
      console.log('🤖 AI Parsed:', data.parsed_query)
    } catch (err: any) {
      console.error('❌ Search error:', err)
      setError(err.message || 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui, sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        🎵 AI Music Search - Simple Test
      </h1>

      {/* Search Box */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter search query..."
          style={{
            width: '100%',
            padding: '12px',
            fontSize: '16px',
            border: '2px solid #ccc',
            borderRadius: '8px',
            marginBottom: '10px'
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          style={{
            padding: '12px 24px',
            fontSize: '16px',
            backgroundColor: loading ? '#999' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '⏳ Searching...' : '🔍 Search'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ padding: '15px', backgroundColor: '#fee', border: '1px solid #f88', borderRadius: '8px', marginBottom: '20px' }}>
          <strong>❌ Error:</strong> {error}
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div>
          <h2 style={{ fontSize: '20px', marginBottom: '15px' }}>
            ✅ Found {results.length} songs:
          </h2>
          {results.map((song, i) => (
            <div
              key={song.source_id || i}
              style={{
                padding: '12px',
                marginBottom: '10px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                border: '1px solid #ddd'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                {i + 1}. {song.title}
              </div>
              <div style={{ fontSize: '14px', color: '#666' }}>
                👤 {song.artist}
              </div>
              <div style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
                🎵 {song.source} • ⏱️ {song.duration ? Math.floor(song.duration / 60) + ':' + (song.duration % 60).toString().padStart(2, '0') : 'N/A'}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Debug Info */}
      <div style={{ marginTop: '40px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px', fontSize: '14px' }}>
        <h3 style={{ marginTop: 0 }}>🔍 Debug Info:</h3>
        <p><strong>Backend:</strong> http://localhost:8899</p>
        <p><strong>Endpoint:</strong> POST /api/music/ai-search</p>
        <p><strong>Check console:</strong> Open DevTools (F12) → Console tab</p>
        <p><strong>Test queries:</strong></p>
        <ul style={{ marginTop: '10px' }}>
          <li>"chill vibes for coding"</li>
          <li>"nhạc K-pop tập gym"</li>
          <li>"upbeat workout music"</li>
        </ul>
      </div>
    </div>
  )
}
