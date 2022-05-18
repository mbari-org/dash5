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
}

const styles = {
  container: 'items-center bg-white',
  button: 'h-full w-full text-left',
  cell: 'h-full w-full items-center',
  cellPadding: 'py-2 px-4',
}

export const TableRow: React.FC<TableRowProps> = ({
  className,
  cells,
  highlighted = false,
  highlightedStyle,
  scrollable,
  onSelect,
}) => {
  return (
    <tr className={clsx(styles.container, className)}>
      {cells.map((cell, index) => (
        <td className={styles.cell} key={`${cell.label}${index}`}>
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
                  highlighted && highlightedStyle,
                  !highlighted && 'opacity-60'
                )}
              />
            </button>
          ) : (
            <TableCell
              {...cell}
              firstColumn={index === 0}
              scrollable={scrollable}
              className={clsx(
                highlighted && highlightedStyle,
                !highlighted && 'opacity-60',
                styles.cellPadding
              )}
            />
          )}
        </td>
      ))}
    </tr>
  )
}
