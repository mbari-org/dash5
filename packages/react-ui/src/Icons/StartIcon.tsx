import React from 'react'
import clsx from 'clsx'

export interface StartIconProps {
  className?: string
  style?: React.CSSProperties
}

export const StartIcon: React.FC<StartIconProps> = ({
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
          d="M13.2519 10.043L10.0547 7.91147C9.39015 7.46843 8.5 7.94482 8.5 8.74352V13.0065C8.5 13.8052 9.39015 14.2816 10.0547 13.8385L13.2519 11.7071C13.8457 11.3112 13.8457 10.4388 13.2519 10.043Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.5 10.875C19.5 15.8456 10.5 22.125 10.5 22.125C10.5 22.125 1.5 15.8456 1.5 10.875C1.5 5.90444 5.52944 1.875 10.5 1.875C15.4706 1.875 19.5 5.90444 19.5 10.875Z"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

StartIcon.displayName = 'Icons.StartIcon'
