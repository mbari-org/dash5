import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
import { faHourglass } from '@fortawesome/free-regular-svg-icons'
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
      <FontAwesomeIcon icon={faHourglass as IconProp} style={{ color }} />
      <FontAwesomeIcon
        icon={faExclamation as IconProp}
        style={{
          color,
          position: 'absolute',
          top: '-0.4em',
          right: '-0.5em',
          fontSize: '0.75em',
        }}
      />
    </span>
  )
}

StopwatchWarningIcon.displayName = 'Icons.StopwatchWarningIcon'
