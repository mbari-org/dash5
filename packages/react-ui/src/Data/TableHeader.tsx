import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { faSort, faSortDown, faSortUp } from '@fortawesome/pro-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import React, { useState } from 'react'
import { swallow } from '@mbari/utils'

export interface TableHeaderProps {
  className?: string
  cells: TableHeaderCell[]
  accessory?: string | JSX.Element
  scrollable?: boolean
}

export interface TableHeaderCell {
  label: string | JSX.Element
  secondary?: string | JSX.Element
  onSort?: (column: string, ascending?: boolean) => void
  sortDirection?: 'asc' | 'desc'
  span?: number
}

const styles = {
  container: 'whitespace-nowrap border-b-2 border-solid border-stone-200',
  cell: 'flex flex-grow text-left font-sans text-sm font-normal items-center py-2 px-4 ',
}

const colClassNames = [
  'col-span-none',
  'col-span-1',
  'col-span-2',
  'col-span-3',
  'col-span-4',
  'col-span-5',
  'col-span-6',
  'col-span-7',
  'col-span-8',
]

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  cells,
  accessory,
  scrollable,
}) => {
  const [hoverSort, setHoverSort] = useState<number | null>(null)

  return (
    <tr
      className={clsx(styles.container, className)}
      data-testid="table header"
    >
      {cells.map(({ label, secondary, onSort, sortDirection, span }, index) => (
        <th
          className={clsx(
            styles.cell,
            scrollable && 'opacity-60',
            span && colClassNames[span]
          )}
          key={`${label}${index}`}
        >
          {onSort ? (
            <button
              onClick={swallow(() =>
                onSort(`${index}`, sortDirection === 'asc')
              )}
              onMouseEnter={() => {
                setHoverSort(index)
              }}
              onMouseLeave={() => {
                setHoverSort(null)
              }}
            >
              <span className="mr-1 w-full font-medium">{label}</span>
              {sortDirection &&
                (sortDirection === 'asc' ? (
                  <FontAwesomeIcon
                    icon={faSortUp as IconProp}
                    title="sort up icon"
                    className="relative top-0.5"
                  />
                ) : (
                  <FontAwesomeIcon
                    icon={faSortDown as IconProp}
                    title="sort down icon"
                    className="relative bottom-0.5"
                  />
                ))}
              {index === hoverSort && !sortDirection && (
                <FontAwesomeIcon icon={faSort as IconProp} title="sort icon" />
              )}
            </button>
          ) : (
            <>
              <span className={clsx(scrollable && 'w-full font-medium')}>
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
