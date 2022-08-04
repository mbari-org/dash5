import { EventType, GetEventsResponse } from '@mbari/api-client'
import { humanize } from '@mbari/utils'

const styles = {
  code: 'border border-slate-100 bg-slate-50 p-2 font-mono my-1',
  error: 'font-bold text-red-700',
  mtmsn: 'font-mono text-red-800',
}

export interface EventFilter {
  eventTypes: EventType[]
  filter?: (event: GetEventsResponse) => boolean
}

const acComsFilter: EventFilter = {
  eventTypes: ['sbdReceive'],
  filter: (event) => event.state === 0 && (event.momsn ?? 0) >= 900000,
}

const directCommsFilter: EventFilter = {
  eventTypes: ['sbdReceive', 'sbdSend'],
  filter: (event) => event.state === 2,
}

const satComsFilter: EventFilter = {
  eventTypes: ['sbdSend', 'sbdReceive', 'sbdReceipt'],
  filter: (event) =>
    event.eventType === 'sbdReceipt' ||
    (!directCommsFilter.filter?.(event) && !acComsFilter.filter?.(event)),
}

export const eventFilters: { [key: string]: EventFilter } = {
  'Ac Comms': acComsFilter,
  ArgoReceive: { eventTypes: ['argoReceive'] },
  'Command Request': { eventTypes: ['command'] },
  Critical: { eventTypes: ['logCritical'] },
  Data: { eventTypes: ['dataProcessed'] },
  Deployment: { eventTypes: ['deploy'] },
  'Direct Comms': directCommsFilter,
  Emergency: { eventTypes: ['emergency'] },
  Fault: { eventTypes: ['logFault'] },
  'GPS Fix': { eventTypes: ['gpsFix'] },
  Important: { eventTypes: ['logImportant'] },
  Launch: { eventTypes: ['launch'] },
  Log: { eventTypes: ['logPath'] },
  'Mission Request': { eventTypes: ['run'] },
  Note: { eventTypes: ['note'] },
  Patch: { eventTypes: ['patch'] },
  Recover: { eventTypes: ['recover'] },
  'Sat Comms': satComsFilter,
  Tracking: { eventTypes: ['tracking'] },
}

export const displayNameForEventType = (eventType: GetEventsResponse) =>
  Object.keys(eventFilters).reduce((a, c) => {
    const matchesType = eventFilters[c].eventTypes.includes(eventType.eventType)
    const matchesFilter = eventFilters[c].filter?.(eventType) ?? true
    if (matchesType && matchesFilter) {
      return c
    }
    return a
  }, '')

export const isUploadEvent = (event: GetEventsResponse) =>
  (event.eventType === 'sbdSend' && event.state === 2) ||
  (event.eventType === 'sbdReceive' &&
    event.state !== 2 &&
    `${event.mtmsn}` !== '0')

const formatEvent = (
  { eventType, ...event }: GetEventsResponse,
  dashUrl: string
): JSX.Element => {
  const fix = event.fix ? JSON.stringify(event.fix) : ''
  const user = event.user ? event.user : 'unknown'
  const note = event.note ? event.note.split('\n') : ''
  const data = event.data ? event.data : ''
  const name = event.name ? event.name : ''
  const path = event.path ? event.path : ''
  const text = event.text ? event.text.split('\n') : ''
  const mtmsn = event.mtmsn ? event.mtmsn : ''
  const momsn = event.momsn ? event.momsn : ''
  const url = `${dashUrl}/${event.vehicleName}/realtime/sbdlogs/${path}`
  const startedMission =
    eventType === 'logImportant' && event.text?.startsWith('Started mission ')
  const defaultMission =
    eventType === 'logImportant' &&
    event.text?.startsWith('Default mission has been running for ')
  const mtmsnExists = `${mtmsn}` !== '0' && `${mtmsn}` !== ''

  switch (eventType) {
    case 'argoReceive':
      return (
        <p className="flex flex-col">
          {text && <span className="font-bold">{text}</span>}{' '}
          <pre className="font-mono text-blue-400">
            ${fix} LC=${note}
          </pre>
        </p>
      )

    case 'command':
      return (
        <p className="flex flex-col">
          <span className="text-green-800">
            by {user ?? 'unknown'} , id: {event.eventId}, {note}
          </span>
          {data?.split('/n').map((line, i) => (
            <pre key={`${event.eventId}${i}`} className={styles.code}>
              {line}
            </pre>
          ))}
        </p>
      )

    case 'dataProcessed':
      return (
        <p className="flex flex-col">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-primary-600"
          >
            {event.path}
          </a>
        </p>
      )

    case 'deploy':
      return (
        <div className="flex flex-col">
          <p className="text-green-800">
            {name}{' '}
            <strong className="font-bold">
              {event.state !== 0 ? 'STARTED' : 'ENDED'}
            </strong>{' '}
            by {user ?? 'unknown'}
          </p>
        </div>
      )

    case 'emergency':
      return (
        <p className="flex flex-col">
          <span className={styles.error}>Fix:</span>
          <span className="font-mono text-red-700">{fix}</span>
        </p>
      )

    case 'gpsFix':
      return (
        <p className="flex flex-col">
          <span className="font-bold">Lat/Lon:</span>
          <span className="font-mono">
            {event.fix?.latitude}, {event.fix?.longitude}
          </span>
        </p>
      )

    case 'logCritical':
    case 'logFault':
    case 'logImportant':
      if (startedMission || defaultMission) {
        return (
          <p className="font-bold text-purple-700">
            <span>{text}</span>
          </p>
        )
      }
      return (
        <p>
          <span className="block font-bold">[{name}]</span>{' '}
          {event.text?.match('MTMSN=') ? (
            <span className={styles.mtmsn}>{text}</span>
          ) : (
            text
          )}
        </p>
      )

    case 'logPath':
      return (
        <p className="flex flex-col">
          New data path{' '}
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="truncate font-mono text-primary-600"
          >
            {path}
          </a>
        </p>
      )

    case 'launch':
    case 'recover':
      return (
        <p className="flex flex-col">
          {humanize(eventType)}ed by {user ?? 'unknown'}:{' '}
          {note ?? 'No notes provided.'}
        </p>
      )

    case 'note':
      return (
        <p className="">
          {event.state === 1 && <span className={styles.error}>BUG</span>}{' '}
          <span className="font-bold">by {user ?? 'unknown'}:</span> {note}
        </p>
      )

    case 'patch':
      return (
        <div className="flex flex-col">
          <p>
            <span className="font-bold">by {user ?? 'unknown'}:</span> {note}
          </p>
          <p>Path: {path}</p>
          <p>md5sum: {name}</p>
          <p className={styles.code}>{text}</p>
        </div>
      )

    case 'run':
      return (
        <div className="flex flex-col">
          <p>
            <span className="font-bold">by {user ?? 'unknown'},</span> id:{' '}
            {event.eventId}, {note}
          </p>
          {event.data?.split('\n').map((line, i) => (
            <pre key={`${event.eventId}${i}`} className={styles.code}>
              {line.split(';').join(';\n')}
            </pre>
          ))}
        </div>
      )

    case 'sbdReceipt':
      return (
        <p className="flex flex-col">
          <span className="font-bold">Queued.</span>{' '}
          {mtmsnExists && <span className={styles.mtmsn}>MTMSN: {mtmsn}</span>}{' '}
          <span>name: {name},</span> <span>bytes: {event.dataLen}</span>
        </p>
      )

    case 'sbdReceive':
      return (
        <div className="flex flex-col">
          <p>
            <span>
              Received{' '}
              {event.state !== 2 && `${mtmsn}` !== '0' ? (
                <span>(Vehicle ACK)</span>
              ) : (
                ''
              )}{' '}
              {event.dataLen} bytes
            </span>
            {name && <span>name: {name},</span>}
          </p>
          {(path?.length ?? 0) && (event?.dataLen ?? 0) > 0 ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate font-mono text-primary-600"
            >
              {event.path}
            </a>
          ) : null}
          <p>
            momsn: {momsn}
            {mtmsnExists && (
              <>
                <span>,</span>{' '}
                <span className={styles.mtmsn}>MTMSN={mtmsn}</span>
              </>
            )}
          </p>
        </div>
      )

    case 'tracking':
      return (
        <p className="flex">
          <pre className={styles.code}>{fix}</pre>
        </p>
      )

    case 'sbdSend':
      return (
        <div className="flex flex-col">
          <p>
            {event.state === 2 ? 'ACK' : ''} command Id: {event.refId}, index:{' '}
            {event.index} <span className="font-mono">{event.text}</span>, name:{' '}
            {name}, bytes: {event.dataLen}
          </p>
        </div>
      )

    default:
      return (
        <p className="flex">
          <pre className={styles.code}>
            {JSON.stringify({ eventType, ...event })}
          </pre>
        </p>
      )
  }
}

export default formatEvent
