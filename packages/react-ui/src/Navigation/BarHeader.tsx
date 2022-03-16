import React from 'react'
import clsx from 'clsx'

const style = {
  barHeader: `flex flex-col mx-1 my-auto`,
  primaryHeader: 'font-bold text-indigo-800 text-sm',
  secondaryHeader: 'font-body text-indigo-600 text-xs -mt-1',
}

export interface BarHeaderProps {
  primary: string
  secondary?: string
  className?: string
}

export const BarHeader: React.FC<BarHeaderProps> = ({
  primary,
  secondary,
  className,
}) => (
  <header className={clsx(style.barHeader, className)}>
    <h1 className={style.primaryHeader}>{primary}</h1>
    <h2 className={style.secondaryHeader}>{secondary}</h2>
  </header>
)

BarHeader.displayName = 'Navigation.BarHeader'
