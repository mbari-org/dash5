import React, { useState } from 'react'
import clsx from 'clsx'
import { ToolTip } from './ToolTip'

export interface RecoveredPillProps {
  recoveredAt?: string
  className?: string
}

export const RecoveredPill: React.FC<RecoveredPillProps> = ({
  recoveredAt,
  className,
}) => {
  const [hover, setHover] = useState(false)

  return (
    <span
      className={clsx('relative inline-flex', className)}
      tabIndex={0}
      aria-label={recoveredAt ? `Recovered ${recoveredAt}` : 'Recovered'}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setHover(true)}
      onBlur={() => setHover(false)}
    >
      Recovered
      {recoveredAt && (
        <ToolTip
          label={`Recovered ${recoveredAt}`}
          active={hover}
          direction="above"
        />
      )}
    </span>
  )
}

RecoveredPill.displayName = 'Navigation.RecoveredPill'
