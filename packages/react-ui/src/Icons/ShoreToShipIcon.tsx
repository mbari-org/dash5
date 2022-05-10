import React from 'react'
import clsx from 'clsx'

export interface ShoreToShipIconProps {
  className?: string
  style?: React.CSSProperties
  waiting?: boolean
}

export const ShoreToShipIcon: React.FC<ShoreToShipIconProps> = ({
  className = 'fill-transparent stroke-black',
  waiting,
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        width="36"
        height="97"
        viewBox="0 0 36 97"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 75L22 79L32 69"
          data-testid="checkmark"
          strokeOpacity={waiting ? '60%' : '100%'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.18712 95.3404H5.6635L5.36522 94.9101L2.17812 90.3116L1.78332 89.742L2.17812 89.1723L5.36522 84.5738L5.6635 84.1435H6.18712H9.46675V79V78H10.4668H13.5032H14.5032V79V84.1435H28.2212C29.8726 84.1435 31.2023 85.0319 32.0846 86.1069C32.9565 87.169 33.4977 88.5365 33.4977 89.742C33.4977 90.7791 33.2981 92.1585 32.512 93.3073C31.6826 94.5193 30.291 95.3404 28.2212 95.3404H6.18712Z"
          strokeOpacity={waiting ? '60%' : '100%'}
          strokeWidth="2"
        />
        <line
          x1="18"
          y1="34"
          x2="18"
          y2="67"
          strokeOpacity={waiting ? '60%' : '100%'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="4 5"
        />
        <path
          d="M22 1C29.187 0.998985 35.0404 6.81639 35 14M22 7C25.866 7 29 10.134 29 14"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M24.667 28.6667V12.6667C24.667 11.5622 23.7716 10.6667 22.667 10.6667H12.667C11.5624 10.6667 10.667 11.5622 10.667 12.6667V28.6667M24.667 28.6667L26.667 28.6667M24.667 28.6667H19.667M10.667 28.6667L8.66699 28.6667M10.667 28.6667H15.667M14.667 14.6667H15.667M14.667 18.6667H15.667M19.667 14.6667H20.667M19.667 18.6667H20.667M15.667 28.6667V23.6667C15.667 23.1144 16.1147 22.6667 16.667 22.6667H18.667C19.2193 22.6667 19.667 23.1144 19.667 23.6667V28.6667M15.667 28.6667H19.667"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

ShoreToShipIcon.displayName = 'Icons.ShoreToShipIcon'
