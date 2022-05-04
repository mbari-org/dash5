import React from 'react'
import clsx from 'clsx'
import { TableHeader, TableHeaderProps } from './TableHeader'
import { TableCell, TableCellProps } from './TableCell'

export interface TableProps {
  className?: string
  style?: React.CSSProperties
  rows: TableCellProps[]
  header: TableHeaderProps
  highlightedStyle?: string
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
  container: 'border-2 border-solid border-stone-200 font-display',
  gridGap: 'grid gap-4',
}

export const Table: React.FC<TableProps> = ({
  className,
  style,
  rows,
  header,
  highlightedStyle,
}) => {
  // dynamically calculate grid columns including accessory header label
  const colsInRow = (rows[0]?.values.length + (header.accessory ? 1 : 0)) | 0

  return (
    <table className={clsx(styles.container, className)} style={style}>
      <thead>
        <TableHeader
          className={clsx(gridClassNames[colsInRow], styles.gridGap)}
          {...header}
        />
      </thead>
      <tbody>
        {rows.map((row, index) => (
          <TableCell
            key={`${row?.values[0]}${index}`}
            className={clsx(gridClassNames[colsInRow], styles.gridGap)}
            {...row}
            highlightedStyle={highlightedStyle}
          />
        ))}
      </tbody>
    </table>
  )
}

Table.displayName = 'Data.Table'
