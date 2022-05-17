import React from 'react'
import clsx from 'clsx'
import { TableHeader, TableHeaderProps } from './TableHeader'
import { TableRow, TableRowProps } from './TableRow'

export interface TableProps {
  className?: string
  style?: React.CSSProperties
  rows: TableRowProps[]
  header: TableHeaderProps
  highlightedStyle?: string
  stackable?: boolean
  interactive?: boolean
  onSelectRow?: (index: number) => void
}

const gridClassNames = [
  'grid-cols-none',
  'grid-cols-1',
  'grid-cols-2',
  'grid-cols-3',
  'grid-cols-4',
  'grid-cols-5',
  'grid-cols-6',
  'grid-cols-7',
  'grid-cols-8',
]

const styles = {
  container: 'h-full border-2 border-solid border-stone-200',
  table: 'font-display w-full',
  gridGap: 'grid gap-4',
}

export const Table: React.FC<TableProps> = ({
  className,
  style,
  rows,
  header,
  highlightedStyle,
  stackable,
  interactive,
  onSelectRow,
}) => {
  // dynamically calculate grid columns
  const colsInRow = rows[0]?.cells.length | 0

  const handleSelectRow = (index: number) => {
    onSelectRow?.(index)
  }

  return (
    <article
      data-testid="table container"
      className={clsx(
        styles.container,
        className,
        interactive && 'overflow-y-auto',
        stackable && 'border-t-0'
      )}
    >
      <table className={clsx(styles.table)} style={style} role="table">
        <thead>
          <TableHeader
            className={clsx(
              gridClassNames[colsInRow],
              styles.gridGap,
              interactive ? 'bg-white' : 'bg-stone-100'
            )}
            interactive={interactive}
            {...header}
          />
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <TableRow
              key={`${row?.cells[0]}${index}`}
              className={clsx(
                gridClassNames[colsInRow],
                styles.gridGap,
                interactive && 'hover:bg-sky-50'
              )}
              {...row}
              interactive={interactive}
              highlightedStyle={highlightedStyle}
              aria-label="table row"
              onSelect={() => handleSelectRow(index)}
            />
          ))}
        </tbody>
      </table>
    </article>
  )
}

Table.displayName = 'Data.Table'
