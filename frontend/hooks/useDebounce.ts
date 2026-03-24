import { useState, useEffect } from 'react'

/**
 * Custom hook to debounce a value
 * @param value - The value to debounce
 * @param delay - The delay in milliseconds (default: 300ms)
 * @returns The debounced value
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    // Set up timer to update debounced value after delay
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    // Clean up timer if value changes before delay expires
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}
