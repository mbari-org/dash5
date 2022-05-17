import React from 'react'
import clsx from 'clsx'
import { CellProps } from './TableRow'

export interface TableCellProps extends CellProps {
  className?: string
  interactive?: boolean
  firstColumn?: boolean
}

export const TableCell: React.FC<TableCellProps> = ({
  className,
  label,
  secondary,
  icon,
  interactive,
  firstColumn,
}) => {
  return (
    <ul
      className={clsx('flex items-center', className)}
      data-testid="table cell"
    >
      {icon && <li className="text-4xl">{icon}</li>}
      <li className="w-full">
        <div
          className={clsx(
            !interactive && firstColumn && 'font-mono',
            interactive && !firstColumn && 'text-sm',
            firstColumn && (interactive ? 'font-medium' : 'font-semibold')
          )}
        >
          {label}
        </div>
        {secondary && (
          <div className={clsx(interactive && 'text-sm')}>{secondary}</div>
        )}
      </li>
    </ul>
  )
}
