import { DateTime } from 'luxon'

export type TimeWindow = 'latest' | '3d' | '7d' | 'deployment'

export const TIME_WINDOW_OPTIONS: { id: TimeWindow; name: string }[] = [
  { id: 'latest', name: 'Latest Dive' },
  { id: '3d', name: '3 Days' },
  { id: '7d', name: '7 Days' },
  { id: 'deployment', name: 'Full Deployment' },
]

/**
 * Returns the start timestamp (ms) for the given time window.
 *
 * For ended deployments `deploymentTo` is in the past, so relative windows
 * (3d/7d) are anchored from the deployment end, not now. The anchor is
 * clamped to now so future-padded end times on active deployments don't
 * shift the window forward and silently drop older data.
 *
 * For the `'latest'` window this returns `deploymentFrom` as a fallback;
 * callers must not rely on it for logset-scoped start times — use the
 * resolved logset start from the logPath event list instead.
 *
 * Pass a pre-computed `now` to make the result stable for memoization
 * (e.g. bucket to the nearest minute so the key doesn't change every render
 * while still re-anchoring periodically).
 */
export const getWindowFrom = (
  window: TimeWindow,
  deploymentFrom: number,
  deploymentTo?: number,
  now?: number
): number => {
  const effectiveNow = now ?? DateTime.utc().toMillis()
  const anchor = Math.min(deploymentTo ?? effectiveNow, effectiveNow)
  switch (window) {
    case '3d':
      return Math.max(deploymentFrom, anchor - 3 * 24 * 60 * 60 * 1000)
    case '7d':
      return Math.max(deploymentFrom, anchor - 7 * 24 * 60 * 60 * 1000)
    case 'deployment':
    case 'latest':
      return deploymentFrom
  }
}
