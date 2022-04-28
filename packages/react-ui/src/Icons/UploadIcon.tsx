import React from 'react'
import clsx from 'clsx'

export interface UploadIconProps {
  className?: string
  style?: React.CSSProperties
}

export const UploadIcon: React.FC<UploadIconProps> = ({
  className = 'fill-transparent stroke-black',
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        aria-label="upload data"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M14.1306 10.4666C14.0863 10.4203 14.0464 10.3799 14.0121 10.3457H4.08048L2.57203 13.0505L4.08048 15.7553H14.0121C14.0464 15.7211 14.0863 15.6806 14.1306 15.6344C14.2878 15.4699 14.497 15.2354 14.7051 14.9555C15.1359 14.3762 15.5 13.6849 15.5 13.0505C15.5 12.4161 15.1359 11.7247 14.7051 11.1454C14.497 10.8655 14.2878 10.631 14.1306 10.4666Z" />
        <rect
          x="-0.466668"
          y="0.466668"
          width="0.933335"
          height="2.06666"
          transform="matrix(-1 0 0 1 6.66664 7)"
          strokeWidth="0.933335"
        />
        <path
          d="M10.8333 3H15M15 3V7.16667M15 3L10 8"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

UploadIcon.displayName = 'Icons.UploadIcon'
