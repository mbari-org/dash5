import React from 'react'
import clsx from 'clsx'
import { DateTime } from 'luxon'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/pro-regular-svg-icons'

export interface HandoffCellProps {
  className?: string
  style?: React.CSSProperties
  date: string
  note: string
  pilot: string
  warning?: boolean
  pic?: boolean
  selectable?: boolean
  unread?: boolean
}

const styles = {
  time: '',
  cell: 'p-4 text-sm',
  grid: 'grid grid-cols-3 gap-2',
  note: 'text-slate-600',
  date: 'capitalize text-slate-600',
  selectable: 'hover:bg-violet-100 cursor-pointer !border-l-violet-500',
  unselectable: 'hover:bg-slate-100 !border-l-slate-400',
  unread: 'border-l-4',
  pilot: 'not-italic',
  dateCol: 'col-span-1 my-auto flex flex-col',
  noteCol: 'col-span-2 flex flex-col',
  warning: 'mr-auto mt-1 text-red-600',
  picDate: 'block capitalize',
  picPilot: 'text-slate-600 font-bold',
  picNote: 'text-slate-600',
}

export const HandoffCell: React.FC<HandoffCellProps> = ({
  className,
  style,
  date,
  note,
  pilot,
  warning,
  pic,
  unread,
  selectable,
}) => {
  const parsedDate = DateTime.fromISO(date)
  const displayDate =
    Math.abs(parsedDate.diffNow('days').days) > 2
      ? parsedDate.toFormat('MMM d, yyyy')
      : parsedDate.toRelativeCalendar()
  const time = parsedDate.toFormat('HH:mm:ss')

  return (
    <article
      className={clsx(
        styles.cell,
        selectable ? styles.selectable : styles.unselectable,
        !pic && styles.grid,
        unread && styles.unread,
        className
      )}
      style={style}
      data-testid="handoffCell"
    >
      {pic ? (
        <p data-testid="pic">
          <span className={styles.picPilot}>{pilot}</span>{' '}
          <span className={styles.picNote}>{note}</span>
          <span className={styles.picDate}>
            {displayDate} at {time}
          </span>
        </p>
      ) : (
        <>
          <header className={clsx(styles.dateCol, !selectable && 'opacity-50')}>
            <h3 className={styles.time}>{time}</h3>
            <h4 className={styles.date}>{displayDate}</h4>
          </header>
          <div className={styles.noteCol}>
            <p className={clsx(styles.note, !selectable && 'opacity-50')}>
              {note}
            </p>
            <cite className={clsx(styles.pilot, !selectable && 'opacity-70')}>
              {pilot}
            </cite>
            {warning && (
              <FontAwesomeIcon
                icon={faTriangleExclamation}
                className={styles.warning}
                size="lg"
              />
            )}
          </div>
        </>
      )}
    </article>
  )
}

HandoffCell.displayName = 'Cells.HandoffCell'
