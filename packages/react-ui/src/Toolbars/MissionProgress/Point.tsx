import React from 'react'

export const Point: React.FC<{ x: number; y: number; label: string }> = ({
  x,
  y,
  label,
}) => (
  <>
    <text
      x={x}
      y={y - 10}
      className="fill-black/50 font-display"
      fontSize={10}
      aria-label={label}
    >
      {label}
    </text>
    <circle cx={x} cy={y} r="4" fill="black" stroke="black" strokeWidth="2" />
  </>
)
