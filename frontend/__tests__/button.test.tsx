import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from '../components/ui/button'

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>)
    const button = screen.getByText('Click me')
    expect(button).toBeInTheDocument()
  })

  it('calls onClick handler', () => {
    const handleClick = jest.fn()
    render(<Button onClick={handleClick}>Click me</Button>)

    const button = screen.getByText('Click me')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Click me</Button>)
    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('applies variant classes', () => {
    const { container } = render(<Button variant="destructive">Delete</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('bg-destructive')
  })

  it('applies size classes', () => {
    const { container } = render(<Button size="lg">Large Button</Button>)
    const button = container.querySelector('button')
    expect(button).toHaveClass('h-11')
  })
})
