import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faSort } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import React from 'react'

export interface TableHeaderProps {
  className?: string
  cells: TableHeaderCell[]
  accessory?: string | JSX.Element
  interactive?: boolean
}

export interface TableHeaderCell {
  label: string | JSX.Element
  secondary?: string | JSX.Element
  onSort?: (column: string, ascending?: boolean) => void
}

const styles = {
  cell: 'flex flex-grow text-left font-sans text-sm font-normal items-center py-2 px-4 ',
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  cells,
  accessory,
  interactive,
}) => {
  return (
    <tr
      className={clsx('whitespace-nowrap', className)}
      data-testid="table header"
    >
      {cells.map(({ label, secondary, onSort }, index) => (
        <th
          className={clsx(styles.cell, interactive && 'opacity-60')}
          key={`${label}${index}`}
        >
          {onSort ? (
            <button onClick={() => onSort(`${index}`)}>
              <span className="mr-1 font-medium">{label}</span>
              <FontAwesomeIcon icon={faSort as IconProp} />
            </button>
          ) : (
            <>
              <span className={clsx(interactive && 'font-medium')}>
                {label}
              </span>
            </>
          )}
          {secondary && (
            <span className="ml-2 text-xs italic">{secondary}</span>
          )}
          {index === cells.length - 1 && accessory && (
            <>
              <span className="flex w-8 flex-grow" />
              {accessory}
            </>
          )}
        </th>
      ))}
    </tr>
  )
}
