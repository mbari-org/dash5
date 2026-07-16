import { useMemo, useState, useCallback, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useEvents, useDepthSparkline, EventType } from '@mbari/api-client'
import { DateTime } from 'luxon'
import clsx from 'clsx'

const DepthSparkline = dynamic(
  () =>
    import('@mbari/react-ui/dist/Charts/DepthSparkline').then(
      (m) => m.default ?? m
    ),
  { ssr: false }
)

const EIGHT_HOURS_MS = 8 * 60 * 60 * 1000

// Alphabetical by display label: Command, Comms, Critical, Emergency, Fault, Important, Mission, Note
const WATCH_EVENT_TYPES: EventType[] = [
  'command',
  'sbdSend',
  'logCritical',
  'emergency',
  'logFault',
  'logImportant',
  'run',
  'note',
]

interface BadgeConfig {
  label: string
  /** Applied to the event row badge pill */
  className: string
  /** Applied to the chip when actively selected */
  activeChipClassName: string
  /** Applied to the chip when inactive (faded version of active color) */
  inactiveChipClassName: string
}

const BADGE: Partial<Record<EventType, BadgeConfig>> = {
  emergency: {
    label: 'Emergency',
    className: 'bg-red-600 text-white',
    activeChipClassName: 'border-red-600 bg-red-600 text-white',
    inactiveChipClassName: 'border-red-200 bg-red-50 text-red-300',
  },
  logCritical: {
    label: 'Critical',
    className: 'bg-red-500 text-white',
    activeChipClassName: 'border-red-500 bg-red-500 text-white',
    inactiveChipClassName: 'border-red-200 bg-red-50 text-red-300',
  },
  logFault: {
    label: 'Fault',
    className: 'bg-orange-500 text-white',
    activeChipClassName: 'border-orange-500 bg-orange-500 text-white',
    inactiveChipClassName: 'border-orange-200 bg-orange-50 text-orange-300',
  },
  logImportant: {
    label: 'Important',
    className: 'bg-yellow-500 text-white',
    activeChipClassName: 'border-yellow-500 bg-yellow-500 text-white',
    inactiveChipClassName: 'border-yellow-200 bg-yellow-50 text-yellow-400',
  },
  run: {
    label: 'Mission',
    className: 'bg-blue-600 text-white',
    activeChipClassName: 'border-blue-600 bg-blue-600 text-white',
    inactiveChipClassName: 'border-blue-200 bg-blue-50 text-blue-300',
  },
  command: {
    label: 'Command',
    className: 'bg-blue-400 text-white',
    activeChipClassName: 'border-blue-400 bg-blue-400 text-white',
    inactiveChipClassName: 'border-blue-200 bg-blue-50 text-blue-300',
  },
  sbdSend: {
    label: 'Comms',
    className: 'bg-teal-500 text-white',
    activeChipClassName: 'border-teal-500 bg-teal-500 text-white',
    inactiveChipClassName: 'border-teal-200 bg-teal-50 text-teal-300',
  },
  note: {
    label: 'Note',
    className: 'bg-green-500 text-white',
    activeChipClassName: 'border-green-500 bg-green-500 text-white',
    inactiveChipClassName: 'border-green-200 bg-green-50 text-green-300',
  },
}

interface WatchSummarySectionProps {
  vehicleName: string
}

const WatchSummarySection: React.FC<WatchSummarySectionProps> = ({
  vehicleName,
}) => {
  const windowFrom = useMemo(() => Date.now() - EIGHT_HOURS_MS, [])

  // null = "All" mode (show everything); otherwise only the selected types show
  const [activeFilters, setActiveFilters] = useState<Set<EventType> | null>(
    null
  )

  // The event time the user clicked — used to draw the sparkline indicator
  const [indicatorTime, setIndicatorTime] = useState<number | null>(null)

  const isAllMode = activeFilters === null

  const toggleFilter = useCallback((type: EventType) => {
    setActiveFilters((prev) => {
      if (prev === null) {
        // Coming from "All" — select only this type
        return new Set([type])
      }
      const next = new Set(prev)
      if (next.has(type)) {
        next.delete(type)
        // If nothing left selected, revert to All
        return next.size === 0 ? null : next
      } else {
        next.add(type)
        // If all types are now selected, revert to All
        return next.size === WATCH_EVENT_TYPES.length ? null : next
      }
    })
    setIndicatorTime(null)
  }, [])

  const { data: sparklineData, isLoading: sparklineLoading } =
    useDepthSparkline({ vehicle: vehicleName })

  // Measure the sparkline container so the SVG viewBox aspect ratio can be
  // matched exactly — eliminates letterboxing without distortion.
  const sparklineContainerRef = useRef<HTMLDivElement>(null)
  const [containerDims, setContainerDims] = useState<{
    w: number
    h: number
  } | null>(null)
  useEffect(() => {
    const el = sparklineContainerRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width > 0 && height > 0) setContainerDims({ w: width, h: height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // compact mode label font size (SVG units) — kept small so depth chart dominates
  const LABEL_FONT_SIZE = 2.8
  // Derive chart body height so viewBox aspect ratio matches container exactly.
  // Uses compact overhead: tickArea ≈ 7.8, axisOverhead = LABEL_FONT_SIZE + 4
  const sparklineChartH = useMemo(() => {
    if (!containerDims || containerDims.w === 0) return 20
    const svgWidth = 122
    const compactTickOverhead = 1.2 * 4 + 0.6 + 2 // 7.4 (matches tickRowHeight=0.6)
    const compactAxisOverhead = LABEL_FONT_SIZE + 7 // matches axisOverhead in DepthSparkline
    const totalOverhead = compactTickOverhead + compactAxisOverhead // ≈ 15.3
    const targetViewBoxH = (containerDims.h / containerDims.w) * svgWidth
    return Math.max(8, Math.round(targetViewBoxH - totalOverhead))
  }, [containerDims])

  // Tick once per minute so the "X ago" label stays current
  const [nowMs, setNowMs] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNowMs(Date.now()), 60000)
    return () => clearInterval(id)
  }, [])

  // Compute legend values from raw sparkline data so we can render as HTML
  const sparklineLegend = useMemo(() => {
    if (!sparklineData) return null
    const { depthTimes, depthValues, padded } = sparklineData
    const safeLen = Math.min(depthTimes.length, depthValues.length)
    if (safeLen === 0) return null
    const isPadded = (padded ?? false) && safeLen >= 4
    const realTimes = isPadded ? depthTimes.slice(0, -3) : depthTimes
    const lastDataMs = Math.max(...realTimes) * 60 * 1000
    const ageHours = (nowMs - lastDataMs) / 3600000
    const isStale = ageHours > 1.25
    const d = new Date(lastDataMs)
    const timeLabel = `${d.getHours()}:${d
      .getMinutes()
      .toString()
      .padStart(2, '0')}`
    const clamped = Math.max(0, nowMs - lastDataMs)
    const absMin = Math.round(clamped / 60000)
    const agoLabel =
      absMin < 60 ? `${absMin}m ago` : `${(clamped / 3600000).toFixed(1)}h ago`
    return { timeLabel, agoLabel, isStale, isPadded }
  }, [sparklineData, nowMs])

  const { data: events, isLoading: eventsLoading } = useEvents(
    {
      vehicles: [vehicleName],
      eventTypes: WATCH_EVENT_TYPES,
      from: windowFrom,
      limit: 200,
      ascending: 'n',
    },
    { staleTime: 5 * 60 * 1000 }
  )

  const filteredEvents = useMemo(
    () =>
      activeFilters === null
        ? events ?? []
        : events?.filter((e) => activeFilters.has(e.eventType)) ?? [],
    [events, activeFilters]
  )

  return (
    <div className="flex h-full w-full flex-row overflow-hidden">
      {/* Left — SVG fills remaining width after vertical legend; ResizeObserver matches aspect ratio */}
      <div className="flex w-2/3 overflow-hidden">
        {/* Sparkline — flex-1 so legend column takes its natural width */}
        <div
          ref={sparklineContainerRef}
          className="relative min-h-0 flex-1 overflow-hidden"
        >
          {sparklineLoading && (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              Loading…
            </p>
          )}
          {!sparklineLoading && !sparklineData && (
            <p className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">
              No depth data
            </p>
          )}
          {sparklineData && containerDims && (
            <DepthSparkline
              {...sparklineData}
              responsive
              height={sparklineChartH}
              legendPosition="none"
              compact
              labelFontSize={LABEL_FONT_SIZE}
              highlightTime={indicatorTime ?? undefined}
              preserveAspectRatio="none"
              className="h-full w-full"
            />
          )}
        </div>

        {/* Vertical legend column — right of SVG, no separator line */}
        {sparklineLegend && (
          <div
            className="flex w-24 flex-shrink-0 flex-col pb-2 pl-2 text-sm text-gray-600"
            style={{ paddingTop: '80px' }}
          >
            {/* Last-data time — pushed down to sit beside the most-recent surface area */}
            <div className="flex flex-col gap-1 text-gray-500">
              <span className="font-semibold text-gray-700">
                {sparklineLegend.timeLabel}{' '}
                <span className="text-xs font-normal text-gray-600">local</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className={clsx(
                    'inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full',
                    sparklineLegend.isPadded && sparklineLegend.isStale
                      ? 'bg-orange-500'
                      : 'bg-green-500'
                  )}
                />
                {sparklineLegend.agoLabel}
              </span>
            </div>
            {/* Extra white space, Legend header, then comms key */}
            <div
              style={{ marginTop: '32px' }}
              className="flex flex-col gap-1.5"
            >
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gray-600">
                Legend
              </p>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-blue-500" />
                argo
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-purple-500" />
                gps
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-orange-500" />
                sat
              </span>
              <span className="flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full bg-green-500" />
                cell
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Right — event timeline (1/3) */}
      <div className="flex w-1/3 flex-col overflow-hidden border-l border-slate-200">
        {/* Header + filter chips */}
        <div className="flex-shrink-0 border-b border-slate-100 px-3 py-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Events — Last 8h
            </p>
            {eventsLoading && (
              <span className="text-xs text-slate-300">Loading…</span>
            )}
          </div>
          {/* Filter chips */}
          <div className="flex flex-wrap gap-1">
            {/* All — solid chip when active (default); faded when a type filter is selected */}
            <button
              onClick={() => {
                setActiveFilters(null)
                setIndicatorTime(null)
              }}
              className={clsx(
                'rounded border px-2 py-0.5 text-xs font-semibold leading-tight transition-colors',
                isAllMode
                  ? 'border-gray-600 bg-gray-600 text-white'
                  : 'border-gray-300 bg-gray-100 text-gray-400'
              )}
            >
              All
            </button>
            {WATCH_EVENT_TYPES.map((type) => {
              const badge = BADGE[type]
              if (!badge) return null
              // Active = explicitly selected; inactive = faded version of own color
              const isSelected =
                !isAllMode && (activeFilters?.has(type) ?? false)
              return (
                <button
                  key={type}
                  onClick={() => toggleFilter(type)}
                  className={clsx(
                    'rounded border px-1.5 py-0.5 text-xs font-medium leading-tight transition-colors',
                    isSelected
                      ? badge.activeChipClassName
                      : badge.inactiveChipClassName
                  )}
                >
                  {badge.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Event rows */}
        <div className="min-h-0 flex-1 overflow-y-auto pl-6">
          {!eventsLoading && !filteredEvents.length && (
            <p className="mt-4 text-center text-xs text-slate-400">
              No matching events in the last 8 hours.
            </p>
          )}
          {filteredEvents.map((event) => {
            const badge = BADGE[event.eventType]
            const time = DateTime.fromMillis(event.unixTime, {
              zone: 'utc',
            }).toFormat('HH:mm')
            const text = event.text ?? event.note ?? ''
            const isSelected = indicatorTime === event.unixTime
            return (
              <button
                key={event.eventId}
                onClick={() =>
                  setIndicatorTime(isSelected ? null : event.unixTime)
                }
                className={clsx(
                  'flex w-full items-start gap-1.5 border-b border-slate-100 px-3 py-1 text-left last:border-0 hover:bg-slate-50',
                  isSelected && 'bg-red-50'
                )}
              >
                <span className="mt-0.5 w-9 flex-shrink-0 text-right text-xs tabular-nums text-slate-400">
                  {time}
                </span>
                {badge && (
                  <span
                    className={clsx(
                      'flex-shrink-0 rounded px-1 py-0.5 text-xs font-medium leading-tight',
                      badge.className
                    )}
                  >
                    {badge.label}
                  </span>
                )}
                <span className="min-w-0 truncate text-xs text-slate-700">
                  {text}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default WatchSummarySection
