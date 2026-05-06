import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { faClock } from '@fortawesome/free-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface StopwatchWarningIconProps {
  className?: string
  style?: React.CSSProperties
  color?: string
}

export const StopwatchWarningIcon: React.FC<StopwatchWarningIconProps> = ({
  className,
  style,
  color = 'currentColor',
}) => {
  return (
    <span
      className={className}
      // Spread caller style first so the required overlay positioning cannot
      // be accidentally overridden by a parent's style prop.
      style={{ ...style, position: 'relative', display: 'inline-block' }}
      aria-label="timeout warning icon"
    >
      <FontAwesomeIcon icon={faClock as IconProp} style={{ color }} />
      {/* Solid warning triangle — inherits the same color as the clock */}
      <FontAwesomeIcon
        icon={faTriangleExclamation as IconProp}
        style={{
          color,
          position: 'absolute',
          top: '-0.45em',
          right: '-0.55em',
          fontSize: '0.85em',
        }}
      />
    </span>
  )
}

StopwatchWarningIcon.displayName = 'Icons.StopwatchWarningIcon'
