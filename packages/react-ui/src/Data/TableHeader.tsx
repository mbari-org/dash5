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
          className="flex flex-grow text-left font-sans font-normal"
          key={`${label}${index}`}
        >
          <span>{label}</span>

          {index === labels.length - 1 && accessory && (
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
