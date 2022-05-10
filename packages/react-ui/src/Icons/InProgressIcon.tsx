import React from 'react'
import clsx from 'clsx'

export interface InProgressIconProps {
  className?: string
  style?: React.CSSProperties
}

export const InProgressIcon: React.FC<InProgressIconProps> = ({
  className = 'stroke-black fill-transparent',
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        width="65"
        height="44"
        viewBox="0 0 65 44"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M56.3753 16.0557C56.3545 16.0362 56.3346 16.0177 56.3156 16H8.87777L1.15217 29.5L8.87777 43H56.3156C56.3346 42.9823 56.3545 42.9638 56.3753 42.9443C56.5931 42.7405 56.9069 42.439 57.2849 42.0538C58.0419 41.2823 59.0501 40.1811 60.0561 38.8627C62.0992 36.1853 64 32.7836 64 29.5C64 26.2164 62.0992 22.8147 60.0561 20.1373C59.0501 18.8189 58.0419 17.7177 57.2849 16.9462C56.9069 16.561 56.5931 16.2595 56.3753 16.0557Z"
          strokeWidth="2"
        />
        <rect
          x="-1"
          y="1"
          width="7"
          height="15"
          transform="matrix(-1 0 0 1 24 0)"
          strokeWidth="2"
        />
        <path
          d="M25 22V27H25.5815M40.9381 29C40.446 25.0537 37.0796 22 33 22C29.6426 22 26.7683 24.0682 25.5815 27M25.5815 27H30M41 38V33H40.4185M40.4185 33C39.2317 35.9318 36.3574 38 33 38C28.9204 38 25.554 34.9463 25.0619 31M40.4185 33H36"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

InProgressIcon.displayName = 'Icons.InProgressIcon'
