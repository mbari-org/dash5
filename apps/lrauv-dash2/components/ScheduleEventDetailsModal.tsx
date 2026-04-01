import { Modal } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { capitalize } from '@mbari/utils'
import { useState, useCallback } from 'react'
import useGlobalModalId from '../lib/useGlobalModalId'
import useCurrentDeployment from '../lib/useCurrentDeployment'

const CopyButton: React.FC<{ getText: () => string }> = ({ getText }) => {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(getText()).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }, [getText])

  return (
    <span className="relative ml-auto inline-flex items-center">
      <button
        type="button"
        onClick={handleCopy}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="rounded p-0.5 text-stone-400 hover:bg-stone-200 hover:text-stone-600 focus:outline-none"
        aria-label="Copy to clipboard"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.8}
        >
          <rect
            x="9"
            y="9"
            width="13"
            height="13"
            rx="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
          />
        </svg>
      </button>
      {(hovered || copied) && (
        <span className="pointer-events-none absolute right-full top-1/2 mr-1.5 -translate-y-1/2 whitespace-nowrap rounded bg-stone-700 px-2 py-0.5 text-[11px] text-white shadow">
          {copied ? 'Copied!' : 'Copy'}
        </span>
      )}
    </span>
  )
}

export interface ScheduleEventDetailsModalProps {
  onClose: () => void
}

const formatTime = (unixTime?: number) => {
  if (unixTime == null) return 'N/A'
  const dt = DateTime.fromMillis(unixTime)
  return `${dt.toFormat('MMM d, yyyy HH:mm:ss')} (${
    dt.toRelative() ?? 'just now'
  })`
}

const TimeBlock: React.FC<{ unixTime?: number }> = ({ unixTime }) => {
  if (unixTime == null) return <span>N/A</span>
  const dt = DateTime.fromMillis(unixTime)
  return (
    <>
      <span>{dt.toFormat('MMM d, yyyy HH:mm:ss')}</span>
      <br />
      <span className="text-stone-500">({dt.toRelative() ?? 'just now'})</span>
    </>
  )
}

const formatScheduleDate = (scheduleDate?: string): string => {
  if (!scheduleDate) return 'N/A'
  if (scheduleDate.toLowerCase() === 'asap') return 'ASAP'
  const match = scheduleDate.match(/^(\d{4})(\d{2})(\d{2})}T(\d{2})(\d{2})$/)
  if (!match) return scheduleDate
  const utc = DateTime.fromObject(
    {
      year: parseInt(match[1]),
      month: parseInt(match[2]),
      day: parseInt(match[3]),
      hour: parseInt(match[4]),
      minute: parseInt(match[5]),
    },
    { zone: 'utc' }
  ).toLocal()
  return `${utc.toFormat('MMM d, yyyy HH:mm')} (local)`
}

const formatVia = (via?: 'cell' | 'sat' | 'cellsat'): string => {
  switch (via) {
    case 'cell':
      return 'Cell'
    case 'sat':
      return 'Satellite'
    case 'cellsat':
      return 'Cell + Satellite'
    default:
      return 'N/A'
  }
}

const splitCommandSegments = (value?: string) => {
  if (!value) return []
  return value
    .split(';')
    .map((v) => v.trim())
    .filter(Boolean)
}

const statusPillClass = (status?: string) => {
  return 'rounded-full border px-2 py-0.5 text-xs font-semibold'
}

const statusPillStyle = (status?: string): React.CSSProperties => {
  switch ((status ?? '').toLowerCase()) {
    case 'running':
      return {
        backgroundColor: '#dcfce7',
        color: '#065f46',
        borderColor: '#86efac',
      }
    case 'pending':
      return {
        backgroundColor: '#f5f5f4',
        color: '#44403c',
        borderColor: '#d6d3d1',
      }
    case 'completed':
      return {
        backgroundColor: '#ede9fe',
        color: '#5b21b6',
        borderColor: '#c4b5fd',
      }
    case 'cancelled':
      return {
        backgroundColor: '#ffe4e6',
        color: '#9f1239',
        borderColor: '#fda4af',
      }
    case 'paused':
      return {
        backgroundColor: '#fef3c7',
        color: '#92400e',
        borderColor: '#fcd34d',
      }
    default:
      return {
        backgroundColor: '#f5f5f4',
        color: '#44403c',
        borderColor: '#d6d3d1',
      }
  }
}

export const ScheduleEventDetailsModal: React.FC<
  ScheduleEventDetailsModalProps
> = ({ onClose }) => {
  const { globalModalId } = useGlobalModalId()
  const router = useRouter()
  const { deployment } = useCurrentDeployment()
  const [showStatusTooltip, setShowStatusTooltip] = useState(false)
  const [showEndedTooltip, setShowEndedTooltip] = useState(false)
  const event = globalModalId?.meta?.scheduleEvent

  if (!event) return null

  const deploymentId =
    (router.query?.deployment?.[1] as string | undefined) ?? ''
  const deploymentLabel = deployment?.name ?? deploymentId ?? 'Deployment n/a'
  const vehicleLabel = event.vehicleName
    ? capitalize(event.vehicleName)
    : 'Vehicle n/a'
  const deploymentWithoutVehicle = deploymentLabel
    .toLowerCase()
    .startsWith(`${vehicleLabel.toLowerCase()} `)
    ? deploymentLabel.slice(vehicleLabel.length).trim()
    : deploymentLabel
  const vehicleDeployment = [vehicleLabel, deploymentWithoutVehicle]
    .filter(Boolean)
    .join(' ')
  const headerTitle = `${vehicleDeployment} - Mission Details`
  const segments = splitCommandSegments(event.eventData || event.eventText)
  const cleanLabel =
    (event.label || 'Unknown')
      .replace(/\d{8}}T\d{4}\s*/g, '')
      .replace(/^["'\s]+/, '')
      .replace(/^load\s+/i, '')
      .replace(/\.(tl|xml|py)$/i, '')
      .trim() || 'Unknown'

  const isScheduledStart =
    !!event.scheduleDate && event.scheduleDate.toLowerCase() !== 'asap'
  const isActiveOrDone = ['running', 'completed', 'cancelled'].includes(
    event.status?.toLowerCase() ?? ''
  )
  const startedLabel =
    isScheduledStart && !isActiveOrDone ? 'Queued' : 'Started'

  return (
    <Modal
      open
      draggable
      grayHeader
      allowPointerEventsOnChildren
      onClose={onClose}
      title={headerTitle}
      className="w-[90vw] max-w-5xl"
      headerClassName="!items-center"
      headerStyle={{ backgroundColor: '#BFDBFE' }}
      dragButtonClassName="!ml-0 !my-0 !rounded-none !bg-transparent !bg-opacity-0 hover:!bg-transparent hover:!bg-opacity-0 !items-center"
      titleClassName="!text-sky-900 !mt-0 !pt-0 !px-0 !w-full !text-center"
      titleStyle={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '3rem',
        margin: 0,
        padding: 0,
        lineHeight: 1.2,
      }}
      closeButtonClassName="!text-sky-700 hover:!bg-transparent"
      closeButtonStyle={{ color: '#0369A1' }}
      style={{ maxHeight: '80vh' }}
    >
      <div className="space-y-4 text-base text-stone-900">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="min-w-0">
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Name
            </p>
            <p className="font-medium whitespace-nowrap overflow-hidden text-ellipsis">
              {cleanLabel}
            </p>
          </div>
          <div>
            <div className="flex items-center text-sm tracking-wide text-stone-500">
              <span className="uppercase">Status</span>
              <span className="relative ml-1 inline-flex align-middle">
                <button
                  type="button"
                  className="cursor-pointer rounded-full border border-stone-300 px-1 text-[10px] font-semibold text-stone-500 hover:bg-stone-100 focus:bg-stone-100"
                  onMouseEnter={() => setShowStatusTooltip(true)}
                  onMouseLeave={() => setShowStatusTooltip(false)}
                  onFocus={() => setShowStatusTooltip(true)}
                  onBlur={() => setShowStatusTooltip(false)}
                  onClick={() => setShowStatusTooltip((prev) => !prev)}
                  aria-label="Status field help"
                >
                  ?
                </button>
                {showStatusTooltip && (
                  <div
                    className="pointer-events-none absolute left-0 top-full z-[9999] mt-1 w-64 -translate-x-1/2 rounded border px-3 py-2 text-xs normal-case leading-relaxed text-stone-700 shadow-lg"
                    style={{
                      borderColor: '#bae6fd',
                      backgroundColor: '#fffbeb',
                    }}
                  >
                    <p className="normal-case">
                      <strong>Running</strong>: mission/command is actively
                      executing.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Pending</strong>: queued and waiting to run at the
                      scheduled time.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Completed</strong>: finished normally.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Cancelled</strong>: stopped before completion.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Paused</strong>: schedule execution is paused.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Unknown</strong>: status not available from logs.
                    </p>
                  </div>
                )}
              </span>
            </div>
            <div className="mt-0.5 flex items-center">
              <span
                className={statusPillClass(event.status)}
                style={statusPillStyle(event.status)}
              >
                {event.status || 'unknown'}
              </span>
            </div>
          </div>
          <div>
            <p
              className={`text-sm uppercase tracking-wide ${
                isScheduledStart && !isActiveOrDone
                  ? 'text-sky-600'
                  : 'text-stone-500'
              }`}
            >
              {startedLabel}
            </p>
            <p className="font-medium">
              <TimeBlock unixTime={event.startedAt} />
            </p>
          </div>
          <div>
            <div className="flex items-center text-sm tracking-wide text-stone-500">
              <span className="uppercase">Ended</span>
              <span className="relative ml-1 inline-flex align-middle">
                <button
                  type="button"
                  className="cursor-pointer rounded-full border border-stone-300 px-1 text-[10px] font-semibold text-stone-500 hover:bg-stone-100 focus:bg-stone-100"
                  onMouseEnter={() => setShowEndedTooltip(true)}
                  onMouseLeave={() => setShowEndedTooltip(false)}
                  onFocus={() => setShowEndedTooltip(true)}
                  onBlur={() => setShowEndedTooltip(false)}
                  onClick={() => setShowEndedTooltip((prev) => !prev)}
                  aria-label="Ended field help"
                >
                  ?
                </button>
                {showEndedTooltip && (
                  <div
                    className="pointer-events-none absolute left-0 top-full z-[9999] mt-1 w-64 -translate-x-1/2 rounded border px-3 py-2 text-xs normal-case leading-relaxed text-stone-700 shadow-lg"
                    style={{
                      borderColor: '#bae6fd',
                      backgroundColor: '#fffbeb',
                    }}
                  >
                    <p className="normal-case">
                      <strong>TBD</strong>: Mission/Command is still running or
                      pending.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>Timestamp</strong>: Estimated end time derived
                      from event timeline.
                    </p>
                    <p className="mt-1 normal-case">
                      <strong>N/A</strong>: End time is unknown or unavailable
                      from current logs.
                    </p>
                  </div>
                )}
              </span>
            </div>
            <div className="mt-0.5">
              {!['completed', 'cancelled'].includes(
                event.status?.toLowerCase() ?? ''
              ) ? (
                <span
                  className={statusPillClass()}
                  style={statusPillStyle('pending')}
                >
                  TBD
                </span>
              ) : (
                <p className="font-medium">
                  <TimeBlock unixTime={event.endedAt} />
                </p>
              )}
            </div>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Type
            </p>
            <p className="font-medium">{event.commandType}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Vehicle
            </p>
            <p className="font-medium">{event.vehicleName || 'n/a'}</p>
          </div>
          <div>
            <p
              className={`text-sm uppercase tracking-wide ${
                isScheduledStart ? 'text-sky-600' : 'text-stone-500'
              }`}
            >
              Scheduled Start
            </p>
            <p className="font-medium">
              {formatScheduleDate(event.scheduleDate)}
            </p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Send Via
            </p>
            <p className="font-medium">{formatVia(event.via)}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Operator
            </p>
            <p className="font-medium">{event.user || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Event ID
            </p>
            <p className="font-medium">{event.eventId}</p>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-wide text-stone-500">
            Summary Parameters
          </p>
          <p className="mt-1 rounded border border-stone-300 bg-stone-100 p-2 font-mono text-sm text-stone-900">
            {event.secondary || 'No parsed parameters available'}
          </p>
        </div>

        {!!event.note && (
          <div>
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Note
            </p>
            <p className="mt-1 rounded border border-stone-200 bg-stone-50 p-2">
              {event.note}
            </p>
          </div>
        )}

        {segments.length > 0 && (
          <div>
            <div className="flex items-center">
              <p className="text-sm uppercase tracking-wide text-stone-500">
                Parsed Command Segments
              </p>
              <CopyButton getText={() => segments.join('\n')} />
            </div>
            <ul className="mt-1 max-h-36 space-y-1 overflow-auto rounded border border-stone-300 bg-stone-100 p-2 font-mono text-sm text-stone-900">
              {segments.map((segment) => (
                <li key={segment} className="break-all">
                  {segment}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <div className="flex items-center">
            <p className="text-sm uppercase tracking-wide text-stone-500">
              Raw Payload
            </p>
            <CopyButton
              getText={() => event.eventData || event.eventText || ''}
            />
          </div>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-stone-300 bg-stone-100 p-2 font-mono text-sm text-stone-900">
            {event.eventData || event.eventText || 'No payload available'}
          </pre>
        </div>
      </div>
    </Modal>
  )
}

export default ScheduleEventDetailsModal
