import clsx from 'clsx'
import React from 'react'

export interface TableHeaderProps {
  className?: string
  labels: string[] | JSX.Element[]
  accessory?: string | JSX.Element
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  labels,
  accessory,
}) => {
  return (
    <tr
      className={clsx('bg-stone-100 p-4', className)}
      data-testid="table header"
    >
      {labels.map((label, index) => (
        <th
          className="text-left font-sans font-normal"
          key={`${label}${index}`}
        >
          <span>{label}</span>

          {index === labels.length - 1 && accessory && (
            <span className="pl-10" aria-label="Additional header label">
              {accessory}
            </span>
          )}
        </th>
      ))}
    </tr>
  )
}
