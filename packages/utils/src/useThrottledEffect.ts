import { useEffect, useRef, DependencyList, useCallback } from 'react'

type ThrottledFunction = (...args: any[]) => any

export const useThrottledEffect = (
  callback: ThrottledFunction,
  delay: number,
  deps: DependencyList = []
): void => {
  const lastExecuted = useRef(Date.now())
  const timeout = useRef<ReturnType<typeof setTimeout>>()

  const runCallback = useCallback(() => {
    lastExecuted.current = Date.now()
    callback()
  }, [lastExecuted, callback])

  useEffect(() => {
    const now = Date.now()
    const timeRemaining = Math.abs(now - lastExecuted.current - delay)
    if (timeRemaining >= 0 && !timeout.current) {
      timeout.current = setTimeout(() => {
        runCallback()
        timeout.current = undefined
      }, timeRemaining)
    }
  }, [delay, runCallback, ...deps])
}
