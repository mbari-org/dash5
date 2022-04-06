import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'

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

const downloadIcon = (
  <svg
    aria-label="download data"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M15 3L9 9M9 9V4M9 9H14"
      stroke="#111827"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.3512 11.2466C12.322 11.217 12.2951 11.1902 12.2709 11.1666H3.82131L2.57663 13.3333L3.82131 15.5H12.2709C12.2951 15.4763 12.322 15.4496 12.3512 15.42C12.4844 15.2848 12.6613 15.0922 12.8371 14.8627C13.2045 14.3831 13.5 13.8284 13.5 13.3333C13.5 12.8382 13.2045 12.2835 12.8371 11.8039C12.6613 11.5744 12.4844 11.3818 12.3512 11.2466Z"
      stroke="black"
    />
    <rect
      x="-0.5"
      y="0.5"
      width="1.4"
      height="2.5"
      transform="matrix(-1 0 0 1 5.7998 8)"
      stroke="black"
    />
  </svg>
)

const uploadIcon = (
  <svg
    aria-label="upload data"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.1306 10.4666C14.0863 10.4203 14.0464 10.3799 14.0121 10.3457H4.08048L2.57203 13.0505L4.08048 15.7553H14.0121C14.0464 15.7211 14.0863 15.6806 14.1306 15.6344C14.2878 15.4699 14.497 15.2354 14.7051 14.9555C15.1359 14.3762 15.5 13.6849 15.5 13.0505C15.5 12.4161 15.1359 11.7247 14.7051 11.1454C14.497 10.8655 14.2878 10.631 14.1306 10.4666Z"
      stroke="black"
    />
    <rect
      x="-0.466668"
      y="0.466668"
      width="0.933335"
      height="2.06666"
      transform="matrix(-1 0 0 1 6.66664 7)"
      stroke="black"
      strokeWidth="0.933335"
    />
    <path
      d="M10.8333 3H15M15 3V7.16667M15 3L10 8"
      stroke="#111827"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

export const LogCell: React.FC<LogCellProps> = ({
  className,
  style,
  label,
  time,
  date,
  log,
  isUpload,
  onSelect,
}) => {
  return (
    <article
      style={style}
      className={clsx(styles.container, className)}
      onClick={swallow(onSelect)}
    >
      <button className="flex" onClick={swallow(onSelect)}>
        <ul className={styles.details}>
          <li>{label}</li>
          <li className="flex flex-row">
            <span className="pr-2 opacity-60" aria-label="time">
              {time}
            </span>
            <span aria-label="data transmission icon">
              {isUpload ? uploadIcon : downloadIcon}
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
