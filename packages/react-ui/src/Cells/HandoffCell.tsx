import React from 'react'
import clsx from 'clsx'
import { DateTime } from 'luxon'

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
  cell: 'grid grid-cols-3 p-4 text-sm',
  note: 'text-slate-600',
  date: 'capitalize text-slate-600',
  warning: '',
  selectable: 'hover:bg-violet-100 cursor-pointer !border-l-violet-500',
  unselectable: 'hover:bg-slate-100 !border-l-slate-400',
  unread: 'border-l-4',
  pilot: 'not-italic',
  dateCol: 'col-span-1 my-auto flex flex-col',
  noteCol: 'col-span-2 flex flex-col',
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
  return (
    <article
      className={clsx(
        styles.cell,
        selectable ? styles.selectable : styles.unselectable,
        unread && styles.unread,
        className
      )}
      style={style}
    >
      <header className={clsx(styles.dateCol, !selectable && 'opacity-50')}>
        <h3 className={styles.time}>
          {DateTime.fromISO(date).toFormat('HH:mm:ss')}
        </h3>
        <h4 className={styles.date}>
          {DateTime.fromISO(date).toRelativeCalendar()}
        </h4>
      </header>
      <div className={styles.noteCol}>
        <p className={clsx(styles.note, !selectable && 'opacity-50')}>{note}</p>
        <cite className={clsx(styles.pilot, !selectable && 'opacity-70')}>
          {pilot}
        </cite>
      </div>
    </article>
  )
}

HandoffCell.displayName = 'Cells.HandoffCell'
