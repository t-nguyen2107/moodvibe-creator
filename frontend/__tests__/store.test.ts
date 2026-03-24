import { renderHook, act } from '@testing-library/react'
import { usePlaylistStore } from '../lib/store'

describe('Playlist Store', () => {
  beforeEach(() => {
    // Reset store before each test
    const { reset } = usePlaylistStore.getState()
    reset()
  })

  it('initializes with empty state', () => {
    const { result } = renderHook(() => usePlaylistStore())

    expect(result.current.currentPlaylist).toBeNull()
    expect(result.current.selectedSongs).toEqual([])
    expect(result.current.currentStep).toBe(1)
  })

  it('adds song to playlist', () => {
    const { result } = renderHook(() => usePlaylistStore())
    const mockSong = {
      title: 'Test Song',
      source: 'youtube',
      source_id: '123',
      audio_url: 'https://example.com/audio.mp3',
      is_royalty_free: true
    }

    act(() => {
      result.current.addSong(mockSong)
    })

    expect(result.current.selectedSongs).toHaveLength(1)
    expect(result.current.selectedSongs[0].title).toBe('Test Song')
  })

  it('limits songs to 20', () => {
    const { result } = renderHook(() => usePlaylistStore())

    // Try to add 21 songs
    for (let i = 0; i < 21; i++) {
      act(() => {
        result.current.addSong({
          title: `Song ${i}`,
          source: 'youtube',
          source_id: `${i}`,
          audio_url: `https://example.com/${i}.mp3`,
          is_royalty_free: true
        })
      })
    }

    expect(result.current.selectedSongs).toHaveLength(20)
  })

  it('removes song from playlist', () => {
    const { result } = renderHook(() => usePlaylistStore())
    const mockSong = {
      title: 'Test Song',
      source: 'youtube',
      source_id: '123',
      audio_url: 'https://example.com/audio.mp3',
      is_royalty_free: true
    }

    act(() => {
      result.current.addSong(mockSong)
    })

    expect(result.current.selectedSongs).toHaveLength(1)

    act(() => {
      result.current.removeSong('123')
    })

    expect(result.current.selectedSongs).toHaveLength(0)
  })

  it('sets step', () => {
    const { result } = renderHook(() => usePlaylistStore())

    act(() => {
      result.current.setStep(2)
    })

    expect(result.current.currentStep).toBe(2)
  })

  it('sets playlist', () => {
    const { result } = renderHook(() => usePlaylistStore())
    const mockPlaylist = {
      name: 'My Playlist',
      mood: 'chill',
      genre: 'vietnam'
    }

    act(() => {
      result.current.setPlaylist(mockPlaylist)
    })

    expect(result.current.currentPlaylist).toEqual(mockPlaylist)
  })

  it('resets state', () => {
    const { result } = renderHook(() => usePlaylistStore())

    act(() => {
      result.current.setStep(3)
      result.current.addSong({
        title: 'Test',
        source: 'youtube',
        source_id: '123',
        audio_url: 'https://example.com/audio.mp3',
        is_royalty_free: true
      })
    })

    expect(result.current.currentStep).toBe(3)
    expect(result.current.selectedSongs).toHaveLength(1)

    act(() => {
      result.current.reset()
    })

    expect(result.current.currentStep).toBe(1)
    expect(result.current.selectedSongs).toHaveLength(0)
    expect(result.current.currentPlaylist).toBeNull()
  })
})
