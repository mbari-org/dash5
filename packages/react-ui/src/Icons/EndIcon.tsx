import React from 'react'
import clsx from 'clsx'

export interface EndIconProps {
  className?: string
  style?: React.CSSProperties
}

export const EndIcon: React.FC<EndIconProps> = ({
  className = 'fill-transparent stroke-black',
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        width="21"
        height="24"
        viewBox="0 0 21 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M19.5 10.875C19.5 15.8456 10.5 22.125 10.5 22.125C10.5 22.125 1.5 15.8456 1.5 10.875C1.5 5.90444 5.52944 1.875 10.5 1.875C15.4706 1.875 19.5 5.90444 19.5 10.875Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M7.5 8.875C7.5 8.32272 7.94772 7.875 8.5 7.875H12.5C13.0523 7.875 13.5 8.32272 13.5 8.875V12.875C13.5 13.4273 13.0523 13.875 12.5 13.875H8.5C7.94772 13.875 7.5 13.4273 7.5 12.875V8.875Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

EndIcon.displayName = 'Icons.EndIcon'
