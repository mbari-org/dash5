import React from 'react'

export const ChargingCable: React.FC = () => {
  return (
    <g>
      <line
        aria-label="bigcable"
        stroke="#555555"
        strokeLinecap="round"
        strokeWidth="9"
        strokeMiterlimit="10"
        x1="250.77"
        y1="292.21"
        x2="268.73"
        y2="281.71"
      />
      <path
        aria-label="smallcable"
        strokeWidth="4"
        stroke="#46A247"
        fill="none"
        strokeMiterlimit="10"
        d="M137.01,323.1c0,0,7.44-8.93,20.84-8.93s20.85,8.93,42.05,8.93s29.77-18.98,47.66-28.86"
      />
    </g>
  )
}
