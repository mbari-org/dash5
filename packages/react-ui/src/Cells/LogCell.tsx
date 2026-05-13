import React from 'react'
import clsx from 'clsx'
import { DownloadIcon } from '../Icons/DownloadIcon'
import { UploadIcon } from '../Icons/UploadIcon'

export interface LogCellProps {
  className?: string
  style?: React.CSSProperties
  label: string
  time: string
  /** Compact relative time string, e.g. "3m ago". Rendered inline after the transmission icon. */
  timeAgo?: string
  date: string
  log: string | JSX.Element
  isUpload: boolean
  onCopy?: (e: React.ClipboardEvent<HTMLElement>) => void
  /** When true, reduces padding and font size for a denser log view. */
  compact?: boolean
}

const styles = {
  container: 'flex bg-white font-display',
  details: 'flex flex-col text-left col-span-2',
  log: 'flex whitespace-pre-line text-left',
}

export const LogCell: React.FC<LogCellProps> = ({
  className,
  style,
  label,
  time,
  timeAgo,
  date,
  log,
  isUpload,
  onCopy,
  compact = false,
}) => {
  return (
    <article style={style} className={clsx(styles.container, className)}>
      <div
        className={clsx(
          'grid flex-grow select-text grid-cols-5 gap-2',
          compact ? 'px-2 py-0.5 text-xs' : 'p-4 text-sm'
        )}
        onCopy={onCopy}
      >
        <ul className={styles.details}>
          <li>{label}</li>
          <li className="flex flex-row items-baseline gap-1">
            <span className="pr-1 opacity-60" aria-label="time">
              {time}
            </span>
            <span aria-label="data transmission icon">
              {isUpload ? <UploadIcon /> : <DownloadIcon />}
            </span>
            {timeAgo && (
              <span className="text-xs opacity-40" aria-label="time ago">
                {timeAgo}
              </span>
            )}
          </li>
          <li className="opacity-60" aria-label="date">
            {date}
          </li>
        </ul>

        <div className="col-span-3 overflow-x-auto text-left">
          {typeof log === 'string' ? <p className={styles.log}>{log}</p> : log}
        </div>
      </div>
    </article>
  )
}

LogCell.displayName = 'Components.LogCell'
