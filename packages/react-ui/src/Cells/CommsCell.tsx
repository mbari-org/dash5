import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface CommsCellProps {
  className?: string
  style?: React.CSSProperties
  command: string
  entry: string
  name?: string
  description?: string
  day: string
  time: string
  isUpload: boolean
  isScheduled: boolean
}

const styles = {
  container: 'flex items-center bg-white p-4 font-display',
  icon: 'px-6 text-2xl',
  description: 'flex flex-grow flex-col p-2 opacity-60',
}

const acknowledgeIcon = (
  <svg
    aria-label="acknowledge icon"
    width="36"
    height="30"
    viewBox="0 0 36 30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.5 7.5L22.5 11.5L32.5 1.5"
      stroke="#6B7280"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.68717 27.8404H6.16355L5.86528 27.4101L2.67817 22.8116L2.28337 22.242L2.67817 21.6723L5.86528 17.0738L6.16355 16.6435H6.68717H9.9668V11.5V10.5H10.9668H14.0032H15.0032V11.5V16.6435H28.7213C30.3726 16.6435 31.7023 17.5319 32.5847 18.6069C33.4565 19.669 33.9978 21.0365 33.9978 22.242C33.9978 23.2791 33.7982 24.6585 33.012 25.8073C32.1826 27.0193 30.7911 27.8404 28.7213 27.8404H6.68717Z"
      stroke="#6B7280"
      stroke-width="2"
    />
  </svg>
)

export const CommsCell: React.FC<CommsCellProps> = ({
  className,
  style,
  command,
  entry,
  name,
  description,
  day,
  time,
  isUpload,
  isScheduled,
}) => {
  const regFontEntry = (() => {
    return entry.slice(0, -3)
  })()
  const boldFontEntry = (() => {
    return entry.slice(-3)
  })()
  return (
    <article style={style} className={clsx(styles.container, className)}>
      <ul className="flex flex-grow flex-col pl-1">
        <li
          className={clsx(
            'whitespace-pre-line font-light',
            isScheduled ? 'text-indigo-600' : 'text-green-600'
          )}
        >
          {command}
        </li>
        <li>
          <span aria-label="entry">{regFontEntry}</span>
          <span aria-label="entry id" className="font-semibold">
            {boldFontEntry}
          </span>
        </li>
        <li className="opacity-60">{name}</li>
      </ul>
      <div className={styles.icon}>
        {isUpload ? (
          <FontAwesomeIcon
            icon={faBuilding as IconProp}
            aria-label="transmitting icon"
          />
        ) : (
          <div>{acknowledgeIcon}</div>
        )}
      </div>

      <ul className={styles.description}>
        <li>{description}</li>
        <li>
          <span>{day}</span> <span>{time}</span>
        </li>
      </ul>
    </article>
  )
}

CommsCell.displayName = 'Components.CommsCell'
