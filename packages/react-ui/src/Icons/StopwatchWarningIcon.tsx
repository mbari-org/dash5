import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faClockRotateLeft,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface StopwatchWarningIconProps {
  className?: string
  style?: React.CSSProperties
  color?: string
}

export const StopwatchWarningIcon: React.FC<StopwatchWarningIconProps> = ({
  className,
  style,
  color = 'rgb(255, 132, 59)',
}) => {
  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      aria-label="timeout warning icon"
    >
      {/* Clock with circular arc — closest free FA match to the reference icon */}
      <FontAwesomeIcon icon={faClockRotateLeft as IconProp} style={{ color }} />
      {/* Solid warning triangle — orange with white ! built in */}
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
