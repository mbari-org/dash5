import { useEffect, useState } from 'react'

/**
 * Returns an updated version of the supplied value only after it has remained
 * unchanged for the specified wait time.
 * @param value A potentially updated value
 * @param delay The amount of time to wait before updating the debounced value
 */
export const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
