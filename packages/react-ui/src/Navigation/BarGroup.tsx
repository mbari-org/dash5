import React from 'react'
import clsx from 'clsx'

export interface BarGroupProps {
  className?: string
}

export const BarGroup: React.FC<BarGroupProps> = ({ className, children }) => (
  <div className={clsx('my-0 flex flex-row', className)}>{children}</div>
)

BarGroup.displayName = 'Navigation.BarGroup'
