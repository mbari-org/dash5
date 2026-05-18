import React from 'react'
import clsx from 'clsx'
import { DownloadIcon } from '../Icons/DownloadIcon'
import { UploadIcon } from '../Icons/UploadIcon'

export interface LogCellProps {
  className?: string
  style?: React.CSSProperties
  label: string
  /** Optional color applied to the event type label, e.g. '#c78204' for Fault. */
  labelColor?: string
  /** When true, renders the label in bold. */
  labelBold?: boolean
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
  labelColor,
  labelBold = false,
  time,
  timeAgo,
  date,
  log,
  isUpload,
  onCopy,
  compact = false,
}) => {
  if (compact) {
    return (
      <article style={style} className={clsx(styles.container, className)}>
        <div
          className="flex w-full select-text items-start gap-2 px-2 py-0.5 text-xs"
          onCopy={onCopy}
        >
          {/* Time — fixed-width, always ≤2 rows: time on row 1, date+ago
              inline on row 2 so the column never grows taller than 2 lines */}
          <div className="flex w-24 shrink-0 flex-col" aria-label="time">
            <span className="whitespace-nowrap opacity-60">{time}</span>
            <span className="flex flex-row flex-wrap gap-x-1 opacity-40 text-[10px]">
              <span aria-label="date">{date}</span>
              {timeAgo && <span aria-label="time ago">{timeAgo}</span>}
            </span>
          </div>

          {/* Type — wide enough to show "Direct Comms" without truncation */}
          <div className="flex w-28 shrink-0 items-start gap-1">
            <span
              className="mt-px shrink-0"
              aria-label="data transmission icon"
            >
              {isUpload ? <UploadIcon /> : <DownloadIcon />}
            </span>
            <span
              className={clsx('truncate', labelBold && 'font-bold')}
              style={labelColor ? { color: labelColor } : undefined}
            >
              {label}
            </span>
          </div>

          {/* Description — expands to fill remaining width; collapses to one row
              when wide enough, wraps naturally when narrow.
              String logs use whitespace-pre-line to preserve \n characters.
              JSX element logs use whitespace-normal + arbitrary-child variants
              to override the flex-col / block-span patterns that formatEvent
              uses so content flows horizontally. */}
          {typeof log === 'string' ? (
            <span className="min-w-0 flex-1 whitespace-pre-line text-left">
              {log}
            </span>
          ) : (
            <div className="min-w-0 flex-1 whitespace-normal text-left [&>*]:!flex-row [&>*]:flex-wrap [&>*]:gap-x-1 [&_span]:!inline">
              {log}
            </div>
          )}
        </div>
      </article>
    )
  }

  return (
    <article style={style} className={clsx(styles.container, className)}>
      <div
        className="grid flex-grow select-text grid-cols-5 gap-2 p-4 text-sm"
        onCopy={onCopy}
      >
        <ul className={styles.details}>
          <li
            className={clsx(labelBold && 'font-bold')}
            style={labelColor ? { color: labelColor } : undefined}
          >
            {label}
          </li>
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
