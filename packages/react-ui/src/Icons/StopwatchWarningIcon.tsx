import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamation } from '@fortawesome/free-solid-svg-icons'
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
  // Derive a light sand fill from the stroke color
  const sandFill = color.startsWith('rgb(')
    ? color.replace('rgb(', 'rgba(').replace(')', ', 0.3)')
    : 'rgba(255, 132, 59, 0.3)'

  return (
    <span
      className={className}
      style={{ position: 'relative', display: 'inline-block', ...style }}
      aria-label="timeout warning icon"
    >
      {/* Custom two-tone hourglass: stroke-only frame + light orange sand */}
      <svg
        viewBox="0 0 100 100"
        width="0.8em"
        height="1em"
        aria-hidden="true"
        style={{ display: 'block' }}
      >
        {/* Top cap bar */}
        <rect x="5" y="2" width="90" height="11" rx="4" fill={color} />
        {/* Bottom cap bar */}
        <rect x="5" y="87" width="90" height="11" rx="4" fill={color} />
        {/* Sand at bottom — light orange fill */}
        <path d="M50,50 L90,87 L10,87 Z" fill={sandFill} />
        {/* Hourglass frame — stroke only, no fill */}
        <path
          d="M10,13 L90,13 L50,50 L90,87 L10,87 L50,50 Z"
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeLinejoin="round"
        />
      </svg>
      <FontAwesomeIcon
        icon={faExclamation as IconProp}
        style={{
          color,
          position: 'absolute',
          top: '-0.4em',
          right: '-0.5em',
          fontSize: '1em',
        }}
      />
    </span>
  )
}

StopwatchWarningIcon.displayName = 'Icons.StopwatchWarningIcon'
