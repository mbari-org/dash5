import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { DownloadIcon } from '../Icons/DownloadIcon'
import { UploadIcon } from '../Icons/UploadIcon'

export interface LogCellProps {
  className?: string
  style?: React.CSSProperties
  label: string
  time: string
  date: string
  log: string | JSX.Element
  isUpload: boolean
  onSelect?: () => void
}

const styles = {
  container: 'flex bg-white font-display text-sm',
  details: 'flex flex-col text-left col-span-2',
  log: 'flex whitespace-pre-line text-left',
}

export const LogCell: React.FC<LogCellProps> = ({
  className,
  style,
  label,
  time,
  date,
  log,
  isUpload,
  onSelect: handleSelect,
}) => {
  return (
    <article style={style} className={clsx(styles.container, className)}>
      <button
        className="grid flex-grow grid-cols-5 gap-2 p-4"
        onClick={swallow(handleSelect)}
      >
        <ul className={styles.details}>
          <li>{label}</li>
          <li className="flex flex-row">
            <span className="pr-2 opacity-60" aria-label="time">
              {time}
            </span>
            <span aria-label="data transmission icon">
              {isUpload ? <UploadIcon /> : <DownloadIcon />}
            </span>
          </li>
          <li className="opacity-60" aria-label="date">
            {date}
          </li>
        </ul>

        <div className="col-span-3 overflow-x-auto text-left">
          {typeof log === 'string' ? <p className={styles.log}>{log}</p> : log}
        </div>
      </button>
    </article>
  )
}

LogCell.displayName = 'Components.LogCell'
