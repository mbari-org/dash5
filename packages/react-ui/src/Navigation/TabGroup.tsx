import clsx from 'clsx'
import React, { FC } from 'react'

interface TabGroupProps {
  style?: React.CSSProperties
  className?: string
}
export const TabGroup: FC<TabGroupProps> = ({ children, className, style }) => {
  return (
    <div className={clsx('flex flex-row', className)} style={style}>
      {children}
    </div>
  )
}

TabGroup.displayName = 'Navigation.TabGroup'
