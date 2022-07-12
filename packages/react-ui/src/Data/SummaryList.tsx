import React from 'react'
import clsx from 'clsx'

export interface SummaryListProps {
  className?: string
  style?: React.CSSProperties
  header?: string | JSX.Element
  values: (string | JSX.Element)[]
}

export const SummaryList: React.FC<SummaryListProps> = ({
  className,
  style,
  header,
  values,
}) => {
  return (
    <ul
      className={clsx('border-2 border-solid border-stone-200', className)}
      style={style}
    >
      <li className="sticky top-0 left-0 z-10 mb-2 border-b-2 border-solid border-stone-200 bg-stone-100 px-4 py-2 text-sm">
        {header}
      </li>
      {values.map((value, index) => (
        <li key={`${value}${index}`} className="mb-2 px-4 opacity-60">
          {value}
        </li>
      ))}
    </ul>
  )
}
