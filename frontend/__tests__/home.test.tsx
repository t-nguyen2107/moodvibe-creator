import { render, screen } from '@testing-library/react'
import Home from '../app/page'

describe('Home Page', () => {
  it('renders heading', () => {
    render(<Home />)
    const heading = screen.getByText(/Tạo Playlist Nhạc Của Bạn/i)
    expect(heading).toBeInTheDocument()
  })

  it('renders create button', () => {
    render(<Home />)
    const createButton = screen.getByText(/Tạo Playlist Mới/i)
    expect(createButton).toBeInTheDocument()
  })

  it('renders library button', () => {
    render(<Home />)
    const libraryButton = screen.getByText(/Xem Thư Viện/i)
    expect(libraryButton).toBeInTheDocument()
  })

  it('renders feature cards', () => {
    render(<Home />)
    expect(screen.getByText(/Multi-Source Search/i)).toBeInTheDocument()
    expect(screen.getByText(/AI Generated Covers/i)).toBeInTheDocument()
    expect(screen.getByText(/Easy Upload/i)).toBeInTheDocument()
  })
})
