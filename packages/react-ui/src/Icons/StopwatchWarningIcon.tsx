import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClockRotateLeft } from '@fortawesome/free-solid-svg-icons'
import { faTriangleExclamation } from '@fortawesome/free-regular-svg-icons'
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
      {/*
       * Warning triangle badge — two layers to get the white-fill + orange-stroke
       * look from the reference: a white square punched behind, then the outline
       * triangle on top in orange.
       */}
      <span
        style={{
          position: 'absolute',
          top: '-0.45em',
          right: '-0.55em',
          fontSize: '0.85em',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* White fill behind the outline triangle */}
        <span
          style={{
            position: 'absolute',
            width: '0.55em',
            height: '0.5em',
            backgroundColor: 'white',
            bottom: '0.1em',
          }}
        />
        {/* Outline triangle (orange border, inherits white fill from behind) */}
        <FontAwesomeIcon
          icon={faTriangleExclamation as IconProp}
          style={{ color, position: 'relative' }}
        />
      </span>
    </span>
  )
}

StopwatchWarningIcon.displayName = 'Icons.StopwatchWarningIcon'
