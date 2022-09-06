import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { TableCell } from './TableCell'

export interface TableRowProps {
  className?: string
  cells: CellProps[]
  highlighted?: boolean
  highlightedStyle?: string
  scrollable?: boolean
  onSelect?: (() => void) | null
}

export interface CellProps {
  label: string | JSX.Element
  secondary?: string | JSX.Element
  icon?: JSX.Element
  highlighted?: boolean
  highlightedStyle?: string
  span?: number
  fixedIconWidth?: boolean
}

const styles = {
  container: 'items-center bg-white',
  button: 'h-full w-full text-left',
  cell: 'h-full w-full items-center',
  cellPadding: 'py-2 px-4',
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

export const TableRow: React.FC<TableRowProps> = ({
  className,
  cells,
  highlighted = false,
  highlightedStyle,
  scrollable,
  onSelect,
}) => {
  return (
    <tr
      className={clsx(
        styles.container,
        className,
        highlighted && highlightedStyle
      )}
      aria-label={'table row'}
    >
      {cells.map((cell, index) => (
        <td
          className={clsx(styles.cell, cell.span && colClassNames[cell.span])}
          key={`${cell.label}${index}`}
        >
          {onSelect ? (
            <button
              className={clsx(styles.button, styles.cellPadding)}
              onClick={swallow(onSelect)}
            >
              <TableCell
                {...cell}
                firstColumn={index === 0}
                scrollable={scrollable}
                className={clsx(
                  cell.highlighted && cell.highlightedStyle,
                  highlighted && !cell.highlighted && highlightedStyle,
                  !highlighted && !cell.highlighted && 'opacity-60'
                )}
                highlighted={cell.highlighted}
              />
            </button>
          ) : (
            <TableCell
              {...cell}
              firstColumn={index === 0}
              scrollable={scrollable}
              className={clsx(
                cell.highlighted && cell.highlightedStyle,
                highlighted && !cell.highlighted && highlightedStyle,
                !highlighted && !cell.highlighted && 'opacity-60',
                styles.cellPadding
              )}
            />
          )}
        </td>
      ))}
    </tr>
  )
}
