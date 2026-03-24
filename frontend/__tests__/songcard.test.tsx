import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SongCard } from '../components/SongCard'
import { Song } from '../lib/store'

const mockSong: Song = {
  title: 'Test Song',
  artist: 'Test Artist',
  source: 'youtube',
  source_id: 'test123',
  duration: 180,
  audio_url: 'https://example.com/audio.mp3',
  thumbnail_url: 'https://example.com/thumb.jpg',
  is_royalty_free: true
}

describe('SongCard Component', () => {
  it('renders song information', () => {
    render(
      <SongCard
        song={mockSong}
        isSelected={false}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText('Test Song')).toBeInTheDocument()
    expect(screen.getByText('Test Artist')).toBeInTheDocument()
  })

  it('shows royalty free badge', () => {
    render(
      <SongCard
        song={mockSong}
        isSelected={false}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText('Miễn phí bản quyền')).toBeInTheDocument()
  })

  it('shows selected state', () => {
    render(
      <SongCard
        song={mockSong}
        isSelected={true}
        onSelect={() => {}}
      />
    )

    expect(screen.getByText('Đã chọn')).toBeInTheDocument()
  })

  it('calls onSelect when button clicked', () => {
    const handleSelect = jest.fn()
    render(
      <SongCard
        song={mockSong}
        isSelected={false}
        onSelect={handleSelect}
      />
    )

    const selectButton = screen.getByText('Chọn')
    fireEvent.click(selectButton)

    expect(handleSelect).toHaveBeenCalledTimes(1)
  })

  it('removes song when selected and clicked', () => {
    const handleSelect = jest.fn()
    render(
      <SongCard
        song={mockSong}
        isSelected={true}
        onSelect={handleSelect}
      />
    )

    const button = screen.getByText('Đã chọn')
    fireEvent.click(button)

    expect(handleSelect).toHaveBeenCalledTimes(1)
  })
})
