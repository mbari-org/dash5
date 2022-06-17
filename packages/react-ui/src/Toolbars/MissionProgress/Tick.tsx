import React from 'react'

export const Tick: React.FC<{
  x: number
  y: number
  height: number
  label: string
  ariaLabel: string
}> = ({ x, y, height, label, ariaLabel }) => (
  <>
    <line
      x1={x}
      y1={y}
      x2={x}
      y2={y + height}
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      aria-label={ariaLabel}
    />
    <text
      x={x - 8}
      y={y + height + 10}
      className="fill-black/50 text-center font-display"
      fontSize={10}
    >
      {label}
    </text>
  </>
)
