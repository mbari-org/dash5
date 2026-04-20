import React from 'react'
import clsx from 'clsx'

export interface RecoveredPillProps {
  recoveredAt?: string
  className?: string
}

export const RecoveredPill: React.FC<RecoveredPillProps> = ({
  recoveredAt,
  className,
}) => (
  <span className={clsx('inline-flex', className)}>
    {recoveredAt ? `Recovered ${recoveredAt}` : 'Recovered'}
  </span>
)

RecoveredPill.displayName = 'Navigation.RecoveredPill'
