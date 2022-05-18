import React from 'react'
import clsx from 'clsx'
import { CellProps } from './TableRow'

export interface TableCellProps extends CellProps {
  className?: string
  scrollable?: boolean
  firstColumn?: boolean
}

const styles = {
  container: 'flex h-full w-full items-center',
}

export const TableCell: React.FC<TableCellProps> = ({
  className,
  label,
  secondary,
  icon,
  scrollable,
  firstColumn,
}) => {
  return (
    <ul className={clsx(styles.container, className)} data-testid="table cell">
      {icon && <li className="text-4xl">{icon}</li>}
      <li className="w-full">
        <div
          className={clsx(
            !scrollable && firstColumn && 'font-mono',
            scrollable && !firstColumn && 'text-sm',
            firstColumn && (scrollable ? 'font-medium' : 'font-semibold')
          )}
        >
          {label}
        </div>
        {secondary && (
          <div className={clsx(scrollable && 'text-sm')}>{secondary}</div>
        )}
      </li>
    </ul>
  )
}
