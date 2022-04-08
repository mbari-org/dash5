import React from 'react'

export const End: React.FC<{
  x: number
  y: number
  height: number
  width: number
}> = ({ x, y, height, width }) => (
  <path
    x={x}
    y={y}
    d={`M${x} ${y} L${x + width} ${y + height / 2} L${x} ${y + height}`}
    stroke="#111827"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  />
)
