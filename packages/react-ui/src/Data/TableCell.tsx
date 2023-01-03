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
  highlighted,
  fixedIconWidth,
}) => {
  return (
    <ul className={clsx(styles.container, className)} data-testid="table cell">
      {icon && (
        <li className={clsx('text-4xl', fixedIconWidth && 'w-2/5')}>{icon}</li>
      )}
      <li className="flex h-full w-full flex-col">
        <div
          className={clsx(
            !scrollable && firstColumn && !highlighted && 'font-mono',
            scrollable && !firstColumn && !highlighted && 'text-sm',
            firstColumn &&
              !highlighted &&
              (scrollable ? 'font-medium' : 'font-semibold')
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
