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
    <tr className={clsx('bg-stone-100 p-4', className)}>
      {labels.map((label, index) => (
        <th className="text-left font-sans font-light" key={`${label}${index}`}>
          {label}
        </th>
      ))}
      {accessory && <th className="text-left font-light">{accessory}</th>}
    </tr>
  )
}
