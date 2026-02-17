import { useEffect, useState } from 'react'

/**
 * Provides a periodically refreshed timestamp for time-based UI updates.
 *
 * The hook returns `Date.now()` and updates it on a fixed interval.
 * When the browser tab is hidden, the interval is paused to avoid
 * unnecessary work, and resumes when the tab becomes visible again.
 *
 * Useful for components that need to recalculate relative times
 * (e.g., “next comms in X minutes”) without relying on constant renders.
 */

export const useTick = (intervalMs: number = 60_000) => {
  const [nowMs, setNowMs] = useState<number>(Date.now())

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null

    const start = () => {
      if (timer) return
      timer = setInterval(() => setNowMs(Date.now()), intervalMs)
    }
    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    // Only adjust time when the browser tab is active
    const handleVisibility = () => {
      if (typeof document !== 'undefined') {
        if (document.hidden) stop()
        else {
          setNowMs(Date.now())
          start()
        }
      }
    }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibility)
    }
    start()

    return () => {
      stop()
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibility)
      }
    }
  }, [intervalMs])

  return nowMs
}
