import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/free-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { swallow, truncate } from '@mbari/utils'
import { AcknowledgeIcon } from '../Icons/AcknowledgeIcon'
import { ConnectedIcon } from '../Icons/ConnectedIcon'
import { CommandType } from '../types'

export interface CommsCellProps {
  className?: string
  style?: React.CSSProperties
  command: string
  entry: string
  name?: string
  via?: 'cellsat' | 'cell' | 'sat'
  vehicleName?: string
  timeout?: string
  day: string
  time: string
  status: 'queued' | 'sent' | 'ack'
  commandType: CommandType
  onSelect?: () => void
}

const styles = {
  container:
    'w-full flex items-center bg-white py-4 pl-4 pr-1 font-display text-sm',
  command: 'whitespace-pre-line font-mono truncate',
  buttonWrapper: 'grid grid-cols-10 w-full items-center text-left',
  detailsContainer: 'col-span-4 flex flex-grow flex-col pl-1',
  icon: 'text-2xl opacity-60 flex flex-grow items-center justify-center w-full col-span-3',
  description: 'flex flex-grow flex-col p-2 opacity-60 col-span-3',
}

export const CommsCell: React.FC<CommsCellProps> = ({
  className,
  style,
  command,
  entry,
  name,
  via,
  vehicleName,
  timeout,
  day,
  time,
  status,
  commandType,
  onSelect,
}) => {
  const regFontEntry = entry.slice(0, -3)
  const boldFontEntry = entry.slice(-3)

  const viaText = `${status === 'queued' ? 'Sending' : 'Sent'} via ${via}`
  const timeoutText = `Timeout: ${timeout} mins`
  const description =
    status === 'queued'
      ? `Waiting to transmit`
      : status === 'ack'
      ? `Ack by ${vehicleName}`
      : `Sent to ${vehicleName}`
  return (
    <article style={style} className={clsx(styles.container, className)}>
      <button className={styles.buttonWrapper} onClick={swallow(onSelect)}>
        <ul className={styles.detailsContainer}>
          <li
            className={clsx(
              styles.command,
              commandType === 'mission' ? 'text-indigo-600' : 'text-green-600'
            )}
            aria-label="command text"
          >
            {truncate(command, 68)}
          </li>
          <li aria-label="entry name and number">
            {regFontEntry}
            <strong>{boldFontEntry}</strong>
          </li>
          <li className="opacity-60" aria-label="owner name">
            {name}
          </li>
        </ul>
        <div className={styles.icon}>
          {status === 'queued' ? (
            <FontAwesomeIcon
              icon={faBuilding as IconProp}
              aria-label="queued icon"
            />
          ) : status === 'sent' ? (
            <ConnectedIcon />
          ) : (
            <AcknowledgeIcon />
          )}
        </div>

        <ul className={styles.description}>
          <li aria-label="Comms status">{description}</li>
          {via && <li>{viaText}</li>}
          {timeout && <li>{timeoutText}</li>}
          <li>
            <span aria-label="day">{day}</span>{' '}
            <span aria-label="time">{time}</span>
          </li>
        </ul>
      </button>
    </article>
  )
}

CommsCell.displayName = 'Components.CommsCell'
