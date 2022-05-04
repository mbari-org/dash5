import clsx from 'clsx'
import React from 'react'

export interface TableHeaderProps {
  className?: string
  values: string[] | JSX.Element[]
  accessory?: string | JSX.Element
}

export const TableHeader: React.FC<TableHeaderProps> = ({
  className,
  values,
  accessory,
}) => {
  return (
    <>
      <tr className={clsx('bg-stone-100 p-4', className)}>
        {values.map((value, index) => (
          <th
            className="text-left font-sans font-light"
            key={`${value}${index}`}
          >
            {value}
          </th>
        ))}
        {accessory && <th className="text-left font-light">{accessory}</th>}
      </tr>
    </>
  )
}
