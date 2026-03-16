import { Modal } from '@mbari/react-ui'
import { DateTime } from 'luxon'
import { useRouter } from 'next/router'
import { capitalize } from '@mbari/utils'
import { useState } from 'react'
import useGlobalModalId from '../lib/useGlobalModalId'
import useCurrentDeployment from '../lib/useCurrentDeployment'

export interface ScheduleEventDetailsModalProps {
  onClose: () => void
}

// interface ParsedSetting {
//   kind: string
//   key: string
//   value: string
// }

const formatTime = (unixTime?: number) => {
  if (!unixTime) return 'N/A'
  const dt = DateTime.fromMillis(unixTime)
  return `${dt.toFormat('MMM d, yyyy HH:mm:ss')} (${
    dt.toRelative() ?? 'just now'
  })`
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

// const parseSettings = (segments: string[]): ParsedSetting[] =>
//   segments.map((segment) => {
//     const lower = segment.toLowerCase()
//     if (lower.startsWith('load ')) {
//       return {
//         kind: 'mission',
//         key: 'load',
//         value: segment.replace(/^load\s+/i, '').trim(),
//       }
//     }
//     if (lower.startsWith('set ')) {
//       const content = segment.replace(/^set\s+/i, '').trim()
//       const firstSpace = content.indexOf(' ')
//       if (firstSpace === -1) {
//         return {
//           kind: 'parameter',
//           key: content,
//           value: '',
//         }
//       }
//       return {
//         kind: 'parameter',
//         key: content.slice(0, firstSpace).trim(),
//         value: content.slice(firstSpace + 1).trim(),
//       }
//     }
//     if (lower.startsWith('sched ')) {
//       return {
//         kind: 'schedule',
//         key: 'sched',
//         value: segment.replace(/^sched\s+/i, '').trim(),
//       }
//     }
//     if (lower === 'run') {
//       return {
//         kind: 'execution',
//         key: 'run',
//         value: 'true',
//       }
//     }
//
//     return {
//       kind: 'command',
//       key: 'raw',
//       value: segment,
//     }
//   })

export const ScheduleEventDetailsModal: React.FC<
  ScheduleEventDetailsModalProps
> = ({ onClose }) => {
  const { globalModalId } = useGlobalModalId()
  const router = useRouter()
  const { deployment } = useCurrentDeployment()
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
  // const settings = parseSettings(segments)

  return (
    <Modal
      open
      draggable
      grayHeader
      allowPointerEventsOnChildren
      onClose={onClose}
      title={headerTitle}
      className="md:max-w-3xl lg:max-w-4xl"
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
      <div className="space-y-4 text-sm text-stone-800">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Name
            </p>
            <p className="break-all font-medium">{event.label || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Status
            </p>
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
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Started
            </p>
            <p className="font-medium">{formatTime(event.startedAt)}</p>
          </div>
          <div>
            <div className="flex items-center text-xs tracking-wide text-stone-500">
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
                    className="leading-3.5 pointer-events-none absolute left-full top-0 z-[9999] ml-2 -translate-y-2/3 rounded border px-3 py-2 text-[11px] normal-case text-stone-700 shadow-lg"
                    style={{
                      width: 'calc(28rem - 30px)',
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
            <p className="font-medium">
              {event.status === 'running' || event.status === 'pending'
                ? 'TBD'
                : formatTime(event.endedAt)}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Type
            </p>
            <p className="font-medium">{event.commandType}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Vehicle
            </p>
            <p className="font-medium">{event.vehicleName || 'n/a'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Operator
            </p>
            <p className="font-medium">{event.user || 'Unknown'}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Event ID
            </p>
            <p className="font-medium">{event.eventId}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            Summary Parameters
          </p>
          <p className="mt-1 rounded border border-stone-200 bg-stone-50 p-2 font-mono text-xs">
            {event.secondary || 'No parsed parameters available'}
          </p>
        </div>

        {!!event.note && (
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Note
            </p>
            <p className="mt-1 rounded border border-stone-200 bg-stone-50 p-2">
              {event.note}
            </p>
          </div>
        )}

        {/* {settings.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Parsed Settings
            </p>
            <div className="mt-1 max-h-44 overflow-auto rounded border border-stone-200 bg-stone-50">
              <table className="w-full text-left text-xs">
                <thead className="sticky top-0 bg-stone-100">
                  <tr>
                    <th className="px-2 py-1 font-semibold text-stone-700">Type</th>
                    <th className="px-2 py-1 font-semibold text-stone-700">Key</th>
                    <th className="px-2 py-1 font-semibold text-stone-700">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {settings.map((setting, index) => (
                    <tr key={`${setting.kind}-${setting.key}-${index}`}>
                      <td className="border-t border-stone-200 px-2 py-1 text-stone-600">
                        {setting.kind}
                      </td>
                      <td className="border-t border-stone-200 px-2 py-1 font-mono break-all">
                        {setting.key || 'n/a'}
                      </td>
                      <td className="border-t border-stone-200 px-2 py-1 font-mono break-all">
                        {setting.value || 'n/a'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )} */}

        {segments.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-stone-500">
              Parsed Command Segments
            </p>
            <ul className="mt-1 max-h-36 space-y-1 overflow-auto rounded border border-stone-200 bg-stone-50 p-2 font-mono text-xs">
              {segments.map((segment) => (
                <li key={segment} className="break-all">
                  {segment}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs uppercase tracking-wide text-stone-500">
            Raw Payload
          </p>
          <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-all rounded border border-stone-200 bg-stone-50 p-2 font-mono text-xs">
            {event.eventData || event.eventText || 'No payload available'}
          </pre>
        </div>
      </div>
    </Modal>
  )
}

export default ScheduleEventDetailsModal
