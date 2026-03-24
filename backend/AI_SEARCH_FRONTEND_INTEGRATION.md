# Frontend Integration Guide - AI Music Search

## Overview

This guide shows how to integrate the new AI-powered music search endpoints into the MoodVibe Creator frontend.

## New API Endpoints

### 1. Parse Natural Language Query

**Endpoint:** `POST /api/music/ai-parse`

**Usage:** Extract structured parameters from natural language

```typescript
// frontend/lib/api.ts

interface AIParseRequest {
  query: string;
  language: string;
}

interface AIParsedQuery {
  mood: string | null;
  mood_confidence: number;
  genre: string | null;
  genre_confidence: number;
  activity: string | null;
  activity_confidence: number;
  era: string | null;
  era_confidence: number;
  language: string | null;
  language_confidence: number;
  culture: string | null;
  culture_confidence: number;
  raw_query: string;
  parsed_at: string;
}

interface AIParseResponse {
  parsed: AIParsedQuery;
  cached: boolean;
  processing_time_ms: number;
  tokens_used: number | null;
  model: string;
}

async function parseNaturalLanguageQuery(
  query: string,
  language: string = 'en'
): Promise<AIParseResponse> {
  const response = await fetch('/api/music/ai-parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language })
  });

  if (!response.ok) {
    throw new Error('Failed to parse query');
  }

  return response.json();
}
```

### 2. AI-Powered Search

**Endpoint:** `POST /api/music/ai-search`

**Usage:** Direct search with AI parsing (combines parse + search)

```typescript
interface MusicSearchResponse {
  songs: SongResult[];
  total: number;
}

async function searchMusicWithAI(
  query: string,
  language: string = 'en'
): Promise<MusicSearchResponse> {
  const response = await fetch('/api/music/ai-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, language })
  });

  if (!response.ok) {
    throw new Error('Failed to search music');
  }

  return response.json();
}
```

### 3. Health Check

**Endpoint:** `GET /api/music/ai-health`

```typescript
interface AIHealthResponse {
  status: 'healthy' | 'degraded' | 'unavailable';
  openai_configured: boolean;
  redis_configured: boolean;
  cache_hit_rate: number | null;
  average_response_time_ms: number | null;
  total_requests: number;
  total_cache_hits: number;
}

async function getAIHealth(): Promise<AIHealthResponse> {
  const response = await fetch('/api/music/ai-health');
  return response.json();
}
```

## React Component Example

### Smart Search Bar

```typescript
// frontend/components/SmartSearchBar.tsx

'use client';

import { useState } from 'react';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { parseNaturalLanguageQuery, searchMusicWithAI } from '@/lib/api';

interface SmartSearchBarProps {
  onResults: (songs: SongResult[]) => void;
  onParsed: (parsed: AIParsedQuery) => void;
}

export function SmartSearchBar({ onResults, onParsed }: SmartSearchBarProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [showParsedInfo, setShowParsedInfo] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsSearching(true);

    try {
      // Step 1: Parse query with AI
      setIsParsing(true);
      const parseResult = await parseNaturalLanguageQuery(query);
      setIsParsing(false);

      // Show parsed info to user
      onParsed(parseResult.parsed);
      setShowParsedInfo(true);

      // Step 2: Search with AI
      const searchResults = await searchMusicWithAI(query);
      onResults(searchResults.songs);

    } catch (error) {
      console.error('Search failed:', error);
      // Fallback to traditional search
      // await traditionalSearch(query);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full">
      {/* Search Input */}
      <div className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Describe the music you want... (e.g., 'chill vibes for studying')"
          className="w-full px-4 py-3 pr-24 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
          {isParsing && (
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <SparklesIcon className="w-4 h-4 animate-spin" />
              <span>Parsing...</span>
            </div>
          )}

          <button
            onClick={handleSearch}
            disabled={isSearching || !query.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {isSearching ? (
              <MagnifyingGlassIcon className="w-5 h-5 animate-spin" />
            ) : (
              <MagnifyingGlassIcon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {/* Parsed Info Display */}
      {showParsedInfo && (
        <div className="mt-3 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-center gap-2 text-sm font-medium text-blue-900">
            <SparklesIcon className="w-4 h-4" />
            <span>AI detected:</span>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            {parsedInfo.mood && (
              <ConfidenceBadge
                label="Mood"
                value={parsedInfo.mood}
                confidence={parsedInfo.mood_confidence}
              />
            )}
            {parsedInfo.genre && (
              <ConfidenceBadge
                label="Genre"
                value={parsedInfo.genre}
                confidence={parsedInfo.genre_confidence}
              />
            )}
            {parsedInfo.activity && (
              <ConfidenceBadge
                label="Activity"
                value={parsedInfo.activity}
                confidence={parsedInfo.activity_confidence}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper component for confidence badges
function ConfidenceBadge({
  label,
  value,
  confidence
}: {
  label: string;
  value: string;
  confidence: number;
}) {
  const getColor = (conf: number) => {
    if (conf >= 0.9) return 'bg-green-100 text-green-800';
    if (conf >= 0.7) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className={`px-3 py-1 rounded-full text-sm ${getColor(confidence)}`}>
      <span className="font-medium">{label}:</span> {value}
      <span className="ml-1 text-xs opacity-75">({Math.round(confidence * 100)}%)</span>
    </div>
  );
}
```

### Suggested Queries Component

```typescript
// frontend/components/SuggestedQueries.tsx

'use client';

import { SparklesIcon } from '@heroicons/react/24/outline';

const SUGGESTED_QUERIES = [
  "Chill lo-fi beats for studying",
  "Upbeat pop songs for running",
  "Sad breakup songs from the 90s",
  "Energetic rock music for gym workout",
  "Relaxing jazz for evening dinner",
  "Focus music for deep work"
];

interface SuggestedQueriesProps {
  onSelect: (query: string) => void;
}

export function SuggestedQueries({ onSelect }: SuggestedQueriesProps) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-2 mb-3">
        <SparklesIcon className="w-5 h-5 text-purple-500" />
        <h3 className="text-sm font-medium text-gray-700">
          Try these AI-powered searches
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {SUGGESTED_QUERIES.map((query) => (
          <button
            key={query}
            onClick={() => onSelect(query)}
            className="px-4 py-2 text-left text-sm bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### Health Status Indicator

```typescript
// frontend/components/AIHealthStatus.tsx

'use client';

import { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { getAIHealth } from '@/lib/api';

export function AIHealthStatus() {
  const [health, setHealth] = useState<AIHealthResponse | null>(null);

  useEffect(() => {
    getAIHealth().then(setHealth);
  }, []);

  if (!health) return null;

  const getStatusIcon = () => {
    switch (health.status) {
      case 'healthy':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'degraded':
        return <ExclamationTriangleIcon className="w-5 h-5 text-yellow-500" />;
      case 'unavailable':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
      {getStatusIcon()}
      <div className="text-sm">
        <span className="font-medium">AI Search:</span>
        <span className="ml-1 capitalize">{health.status}</span>

        {health.cache_hit_rate !== null && (
          <span className="ml-2 text-gray-500">
            ({health.cache_hit_rate}% cache hit rate)
          </span>
        )}
      </div>
    </div>
  );
}
```

## Zustand Store Integration

```typescript
// frontend/lib/store.ts

import { create } from 'zustand';

interface MusicSearchStore {
  // State
  query: string;
  parsedQuery: AIParsedQuery | null;
  results: SongResult[];
  isSearching: boolean;

  // Actions
  setQuery: (query: string) => void;
  setParsedQuery: (parsed: AIParsedQuery) => void;
  setResults: (results: SongResult[]) => void;
  setIsSearching: (searching: boolean) => void;

  // AI Actions
  searchWithAI: (query: string) => Promise<void>;
  parseQuery: (query: string) => Promise<void>;
}

export const useMusicSearchStore = create<MusicSearchStore>((set, get) => ({
  // Initial state
  query: '',
  parsedQuery: null,
  results: [],
  isSearching: false,

  // Basic actions
  setQuery: (query) => set({ query }),
  setParsedQuery: (parsedQuery) => set({ parsedQuery }),
  setResults: (results) => set({ results }),
  setIsSearching: (isSearching) => set({ isSearching }),

  // AI-powered search
  searchWithAI: async (query) => {
    set({ isSearching: true, query });

    try {
      // Step 1: Parse query
      const parseResult = await parseNaturalLanguageQuery(query);
      set({ parsedQuery: parseResult.parsed });

      // Step 2: Search with parsed query
      const searchResults = await searchMusicWithAI(query);
      set({ results: searchResults.songs });
    } catch (error) {
      console.error('AI search failed:', error);
      // Handle error
    } finally {
      set({ isSearching: false });
    }
  },

  // Parse query only
  parseQuery: async (query) => {
    try {
      const parseResult = await parseNaturalLanguageQuery(query);
      set({ parsedQuery: parseResult.parsed });
    } catch (error) {
      console.error('Parse failed:', error);
    }
  }
}));
```

## Usage Examples

### Basic Usage

```typescript
'use client';

import { useMusicSearchStore } from '@/lib/store';
import { SmartSearchBar } from '@/components/SmartSearchBar';

export function SearchPage() {
  const { results, isSearching, searchWithAI } = useMusicSearchStore();

  return (
    <div>
      <SmartSearchBar
        onResults={(songs) => console.log('Found songs:', songs)}
        onParsed={(parsed) => console.log('Parsed:', parsed)}
      />

      {isSearching && <div>Searching with AI...</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {results.map((song) => (
          <SongCard key={song.source_id} song={song} />
        ))}
      </div>
    </div>
  );
}
```

## Error Handling

```typescript
async function safeAISearch(query: string) {
  try {
    const results = await searchMusicWithAI(query);
    return results;
  } catch (error) {
    // Check if AI service is down
    const health = await getAIHealth();

    if (health.status === 'unavailable') {
      // Fallback to traditional search
      console.warn('AI unavailable, using traditional search');
      return await traditionalSearch(query);
    }

    throw error;
  }
}
```

## Performance Tips

1. **Debounce Search Input**: Don't call AI on every keystroke
   ```typescript
   const debouncedSearch = useMemo(
     () => debounce((q) => searchWithAI(q), 500),
     []
   );
   ```

2. **Cache Results**: Store parsed queries in localStorage
   ```typescript
   const cacheKey = `ai_parse_${query}`;
   const cached = localStorage.getItem(cacheKey);
   if (cached) return JSON.parse(cached);
   ```

3. **Show Loading States**: AI parsing takes 400-600ms
   ```typescript
   {isParsing && <ParsingIndicator />}
   ```

4. **Handle Rate Limits**: 10 requests/minute per user
   ```typescript
   const rateLimitKey = `ai_parse_count_${Date.now()}`;
   // Implement rate limiting logic
   ```

## Testing

```typescript
// Test AI parsing
describe('AI Music Search', () => {
  it('should parse natural language query', async () => {
    const result = await parseNaturalLanguageQuery(
      'chill vibes for studying',
      'en'
    );

    expect(result.parsed.mood).toBe('chill');
    expect(result.parsed.activity).toBe('studying');
    expect(result.parsed.mood_confidence).toBeGreaterThan(0.8);
  });
});
```

## Migration Guide

### From Old Search to AI Search

**Before:**
```typescript
const results = await searchMusic({
  q: 'chill music',
  mood: 'chill',
  genre: null
});
```

**After:**
```typescript
const results = await searchMusicWithAI('chill vibes for studying');
// AI automatically extracts mood, genre, activity
```

### Backward Compatibility

The old `/api/music/search` endpoint still works:

```typescript
// This still works
const results = await fetch('/api/music/search?q=chill');
```

## Summary

✅ **New Endpoints:**
- `POST /api/music/ai-parse` - Parse natural language
- `POST /api/music/ai-search` - AI-powered search
- `GET /api/music/ai-health` - Health check
- `GET /api/music/ai-stats` - Statistics

✅ **Benefits:**
- More intuitive search
- Multi-language support
- Confidence scores
- Graceful fallback

✅ **Cost:** ~$0.005 per 1000 requests (with caching)
