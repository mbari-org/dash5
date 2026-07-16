import dynamic from 'next/dynamic'
import { useEvents, useDepthSparkline } from '@mbari/api-client'
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

// Event types to surface in the watch summary timeline
const WATCH_EVENT_TYPES = [
  'note',
  'logCritical',
  'logFault',
  'logImportant',
  'run',
  'command',
  'emergency',
  'sbdSend',
] as const

type WatchEventType = (typeof WATCH_EVENT_TYPES)[number]

interface BadgeConfig {
  label: string
  className: string
}

const BADGE: Record<WatchEventType, BadgeConfig> = {
  emergency: { label: 'Emergency', className: 'bg-red-600 text-white' },
  logCritical: { label: 'Critical', className: 'bg-red-500 text-white' },
  logFault: { label: 'Fault', className: 'bg-orange-500 text-white' },
  logImportant: { label: 'Important', className: 'bg-yellow-500 text-white' },
  run: { label: 'Mission', className: 'bg-blue-600 text-white' },
  command: { label: 'Command', className: 'bg-blue-400 text-white' },
  sbdSend: { label: 'Comms', className: 'bg-teal-500 text-white' },
  note: { label: 'Note', className: 'bg-green-500 text-white' },
}

interface WatchSummarySectionProps {
  vehicleName: string
}

const WatchSummarySection: React.FC<WatchSummarySectionProps> = ({
  vehicleName,
}) => {
  const windowFrom = Date.now() - EIGHT_HOURS_MS

  const { data: sparklineData, isLoading: sparklineLoading } =
    useDepthSparkline({ vehicle: vehicleName })

  const { data: events, isLoading: eventsLoading } = useEvents({
    vehicles: [vehicleName],
    eventTypes: [...WATCH_EVENT_TYPES],
    from: windowFrom,
    limit: 200,
    ascending: 'n',
  })

  const isLoading = sparklineLoading || eventsLoading

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      <header className="flex items-center gap-3 px-4 pt-2 pb-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Last 8 Hours
        </span>
        {isLoading && <span className="text-xs text-slate-400">Loading…</span>}
      </header>

      {/* Depth sparkline — full width, taller than the vehicle panel version */}
      <div className="mx-4 mb-2 flex-shrink-0 overflow-hidden rounded border border-slate-200 bg-slate-50">
        {sparklineData && (
          <DepthSparkline
            {...sparklineData}
            responsive
            className="h-16 w-full"
          />
        )}
        {!sparklineData && !sparklineLoading && (
          <p className="py-3 text-center text-xs text-slate-400">
            No depth data
          </p>
        )}
      </div>

      {/* Event timeline */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-2">
        {!isLoading && !events?.length && (
          <p className="mt-2 text-center text-sm text-slate-400">
            No events in the last 8 hours.
          </p>
        )}
        {events?.map((event) => {
          const badge = BADGE[event.eventType as WatchEventType]
          const time = DateTime.fromMillis(event.unixTime, {
            zone: 'utc',
          }).toFormat('HH:mm')
          const text = event.text ?? event.note ?? ''
          return (
            <div
              key={event.eventId}
              className="flex items-start gap-2 border-b border-slate-100 py-1.5 last:border-0"
            >
              <span className="mt-0.5 w-10 flex-shrink-0 text-right text-xs tabular-nums text-slate-400">
                {time}
              </span>
              {badge && (
                <span
                  className={clsx(
                    'flex-shrink-0 rounded px-1.5 py-0.5 text-xs font-medium leading-tight',
                    badge.className
                  )}
                >
                  {badge.label}
                </span>
              )}
              <span className="min-w-0 truncate text-xs text-slate-700">
                {text}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WatchSummarySection
