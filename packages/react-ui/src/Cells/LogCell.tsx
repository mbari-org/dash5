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
  log: string
  isUpload: boolean
  onSelect?: () => void
}

const styles = {
  container: 'flex bg-white font-display',
  details: 'ml-2 mr-4 p-4 flex flex-col text-left',
  log: 'flex p-4 whitespace-pre-line text-left',
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
      <button className="flex" onClick={swallow(handleSelect)}>
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

        <p className={styles.log}>{log}</p>
      </button>
    </article>
  )
}

LogCell.displayName = 'Components.LogCell'
