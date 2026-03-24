import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Input } from '../components/ui/input'

describe('Input Component', () => {
  it('renders input element', () => {
    render(<Input placeholder="Enter text" />)
    const input = screen.getByPlaceholderText('Enter text')
    expect(input).toBeInTheDocument()
  })

  it('applies placeholder', () => {
    render(<Input placeholder="Test placeholder" />)
    const input = screen.getByPlaceholderText('Test placeholder')
    expect(input).toHaveAttribute('placeholder', 'Test placeholder')
  })

  it('can be disabled', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('renders with default value', () => {
    render(<Input defaultValue="default value" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveValue('default value')
  })
})
