import React from 'react'

export const Progress: React.FC<{
  x: number
  y: number
  width: number
  percent: number
}> = ({ x, y, width, percent }) => (
  <>
    <line
      x1={x}
      y1={y}
      x2={x + width * percent}
      y2={y}
      stroke="#111827"
      strokeWidth="2"
    />
    <line
      x1={x + width * percent}
      y1={y}
      x2={x + width}
      y2={y}
      stroke="#111827"
      strokeWidth="2"
      strokeDasharray="4 4"
    />
  </>
)
