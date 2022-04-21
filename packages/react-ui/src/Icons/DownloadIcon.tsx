import React from 'react'
import clsx from 'clsx'

export interface DownloadIconProps {
  className?: string
  style?: React.CSSProperties
}

export const DownloadIcon: React.FC<DownloadIconProps> = ({
  className = 'fill-transparent stroke-black',
  style,
}) => {
  return (
    <div className={clsx('', className)} style={style}>
      <svg
        aria-label="download data"
        width="18"
        height="18"
        viewBox="0 0 18 18"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M15 3L9 9M9 9V4M9 9H14"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M12.3512 11.2466C12.322 11.217 12.2951 11.1902 12.2709 11.1666H3.82131L2.57663 13.3333L3.82131 15.5H12.2709C12.2951 15.4763 12.322 15.4496 12.3512 15.42C12.4844 15.2848 12.6613 15.0922 12.8371 14.8627C13.2045 14.3831 13.5 13.8284 13.5 13.3333C13.5 12.8382 13.2045 12.2835 12.8371 11.8039C12.6613 11.5744 12.4844 11.3818 12.3512 11.2466Z" />
        <rect
          x="-0.5"
          y="0.5"
          width="1.4"
          height="2.5"
          transform="matrix(-1 0 0 1 5.7998 8)"
        />
      </svg>
    </div>
  )
}

DownloadIcon.displayName = 'Icons.DownloadIcon'
