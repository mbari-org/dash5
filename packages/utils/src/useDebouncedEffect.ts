import { useEffect, useRef, DependencyList, useCallback } from 'react'

type DebouncedFunction = (...args: any[]) => any

export const useDebouncedEffect = (
  callback: DebouncedFunction,
  delay: number,
  deps: DependencyList = []
): void => {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cleanup = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const debouncedCallback = useCallback(() => {
    cleanup()
    timeoutRef.current = setTimeout(() => {
      callback()
    }, delay)
  }, [callback, delay])

  useEffect(() => {
    debouncedCallback()
    return cleanup
  }, [debouncedCallback, ...deps])
}
