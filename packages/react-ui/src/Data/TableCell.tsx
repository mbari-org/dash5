import React from 'react'
import clsx from 'clsx'

export interface TableCellProps {
  className?: string
  values: string[] | JSX.Element[]
  highlighted?: boolean
  highlightedStyle?: string
}

const styles = {
  container:
    'items-center border-t-2  border-solid border-stone-200 bg-white p-4 text-xl',
}

export const TableCell: React.FC<TableCellProps> = ({
  className,
  values,
  highlighted = false,
  highlightedStyle,
}) => {
  return (
    <tr className={clsx(styles.container, className)}>
      {values.map((value, index) => (
        <td
          className={clsx(
            highlighted && highlightedStyle,
            !highlighted && 'opacity-60',
            index === 0 && 'font-mono font-bold'
          )}
          key={`${value}${index}`}
        >
          {value}
        </td>
      ))}
    </tr>
  )
}
