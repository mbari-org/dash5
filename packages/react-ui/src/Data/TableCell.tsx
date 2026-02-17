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
  // Add a zero width space after underscores so line breaks happen cleanly at underscores instead of randomly
  const preparedLabel =
    typeof label === 'string' ? label.split('_').join('_\u200b') : label
  return (
    <ul className={clsx(styles.container, className)} data-testid="table cell">
      {icon && (
        <li className={clsx('text-4xl', fixedIconWidth && 'w-2/5')}>{icon}</li>
      )}
      <li className="flex h-full w-full min-w-0 flex-col">
        <div
          className={clsx(
            !scrollable && firstColumn && !highlighted && 'font-mono',
            scrollable && !firstColumn && !highlighted && 'text-sm',
            firstColumn &&
              !highlighted &&
              (scrollable ? 'font-medium' : 'font-semibold'),
            'min-w-0 whitespace-normal break-normal'
          )}
        >
          {preparedLabel}
        </div>
        {secondary && (
          <div className={clsx(scrollable && 'text-sm')}>{secondary}</div>
        )}
      </li>
    </ul>
  )
}
