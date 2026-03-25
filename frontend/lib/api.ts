import axios from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8899'

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
  if (typeof window === 'undefined') return {}
  
  const authStorage = localStorage.getItem('auth-storage')
  if (!authStorage) return {}
  
  try {
    const { state } = JSON.parse(authStorage)
    const token = state?.token
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  } catch {
    return {}
  }
}

export const api = {
  // ===== Authentication =====
  register: async (email: string, password: string, name?: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Registration failed')
    }
    return response.json()
  },

  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Login failed')
    }
    return response.json()
  },

  loginWithGoogle: async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential: accessToken, provider: 'google' })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Google login failed')
    }
    return response.json()
  },

  loginWithFacebook: async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/facebook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, provider: 'facebook' })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'Facebook login failed')
    }
    return response.json()
  },

  loginWithGithub: async (accessToken: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/oauth/github`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ access_token: accessToken, provider: 'github' })
    })
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.detail || 'GitHub login failed')
    }
    return response.json()
  },

  getCurrentUser: async (token?: string) => {
    const headers: Record<string, string> = {}
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    } else {
      Object.assign(headers, getAuthHeaders())
    }
    
    const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
      headers
    })
    if (!response.ok) {
      throw new Error('Failed to get user')
    }
    return response.json()
  },

  getGithubAuthUrl: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/github`)
    return response.url
  },

  logout: async () => {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return response.json()
  },

  // Music
  searchMusic: async (params: {
    q?: string
    genre?: string
    mood?: string
    sources?: string[]
    limit?: number
    royalty_free_only?: boolean
  }) => {
    const queryParams = new URLSearchParams()
    if (params.q) queryParams.append('q', params.q)
    if (params.genre) queryParams.append('genre', params.genre)
    if (params.mood) queryParams.append('mood', params.mood)
    if (params.sources) queryParams.append('sources', params.sources.join(','))
    if (params.limit) queryParams.append('limit', params.limit.toString())
    if (params.royalty_free_only) queryParams.append('royalty_free_only', 'true')

    const response = await fetch(`${API_BASE_URL}/api/music/search?${queryParams}`, {
      headers: getAuthHeaders()
    })
    return response.json()
  },

  getPreviewUrl: async (source: string, sourceId: string) => {
    const response = await fetch(`${API_BASE_URL}/api/music/preview/${source}/${sourceId}`)
    return response.json()
  },

  // Playlists
  createPlaylist: async (data: {
    name: string
    mood?: string
    genre?: string
    description?: string
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(data)
    })
    return response.json()
  },

  getPlaylists: async () => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/`, {
      headers: getAuthHeaders()
    })
    return response.json()
  },

  getPlaylist: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/${id}`, {
      headers: getAuthHeaders()
    })
    return response.json()
  },

  getPlaylistSongs: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/${id}/songs`, {
      headers: getAuthHeaders()
    })
    return response.json()
  },

  addSongToPlaylist: async (playlistId: number, song: any) => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/${playlistId}/songs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(song)
    })
    return response.json()
  },

  deletePlaylist: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/playlists/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return response.json()
  },

  // Media
  mergeAudio: async (audioUrls: string[], gap: number = 5) => {
    const response = await fetch(`${API_BASE_URL}/api/media/audio/merge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ audio_urls: audioUrls, gap })
    })
    return response.json()
  },

  generateVideo: async (audioPath: string, imagePath: string, songList: string[], showSongList: boolean = true) => {
    const response = await fetch(`${API_BASE_URL}/api/media/video/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        audio_path: audioPath,
        image_path: imagePath,
        song_list: songList,
        show_song_list: showSongList
      })
    })
    return response.json()
  },

  generateImage: async (prompt: string, mood: string) => {
    const response = await fetch(`${API_BASE_URL}/api/media/image/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ prompt, mood, song_list: [], show_song_list: false })
    })
    return response.json()
  },

  uploadImage: async (file: File) => {
    const formData = new FormData()
    formData.append('file', file)

    const response = await fetch(`${API_BASE_URL}/api/media/image/upload`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: formData
    })
    return response.json()
  },

  // Social
  uploadToYouTube: async (videoPath: string, title: string, description: string, tags: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/social/youtube/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        video_path: videoPath,
        title,
        description,
        tags,
        privacy_status: 'public'
      })
    })
    return response.json()
  },

  uploadToTikTok: async (videoPath: string, caption: string, hashtags: string[]) => {
    const response = await fetch(`${API_BASE_URL}/api/social/tiktok/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({
        video_path: videoPath,
        caption,
        hashtags
      })
    })
    return response.json()
  },

  // Settings
  storeApiKey: async (service: string, apiKey: string) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/api-keys`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ service, api_key: apiKey })
    })
    return response.json()
  },

  getApiKeys: async () => {
    const response = await fetch(`${API_BASE_URL}/api/settings/api-keys`, {
      headers: getAuthHeaders()
    })
    return response.json()
  },

  deleteApiKey: async (service: string) => {
    const response = await fetch(`${API_BASE_URL}/api/settings/api-keys/${service}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return response.json()
  }
}
