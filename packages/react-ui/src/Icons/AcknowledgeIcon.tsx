import React from 'react'
import clsx from 'clsx'

export interface AcknowledgeIconProps {
  className?: string
  style?: React.CSSProperties
}

export const AcknowledgeIcon: React.FC<AcknowledgeIconProps> = ({
  className = 'fill-white stroke-black',
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        aria-label="acknowledge icon"
        width="36"
        height="30"
        viewBox="0 0 36 30"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18.5 7.5L22.5 11.5L32.5 1.5"
          className={className}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M6.68717 27.8404H6.16355L5.86528 27.4101L2.67817 22.8116L2.28337 22.242L2.67817 21.6723L5.86528 17.0738L6.16355 16.6435H6.68717H9.9668V11.5V10.5H10.9668H14.0032H15.0032V11.5V16.6435H28.7213C30.3726 16.6435 31.7023 17.5319 32.5847 18.6069C33.4565 19.669 33.9978 21.0365 33.9978 22.242C33.9978 23.2791 33.7982 24.6585 33.012 25.8073C32.1826 27.0193 30.7911 27.8404 28.7213 27.8404H6.68717Z"
          className={className}
          strokeWidth="2"
        />
      </svg>
    </div>
  )
}

AcknowledgeIcon.displayName = 'Icons.AcknowledgeIcon'
