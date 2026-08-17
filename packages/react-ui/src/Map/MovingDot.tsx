import { useState, useEffect } from 'react'
import { MeasurementProps } from './Measurement'

const MovingDot: React.FC<MeasurementProps> = ({ editing }) => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)

  useEffect(() => {
    if (!editing) return
    const handleMouseMove = (event: MouseEvent) => {
      setX(event.clientX)
      setY(event.clientY)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [editing])

  return editing ? (
    <div
      data-testid="moving-dot"
      style={{
        position: 'fixed',
        top: y - 5,
        left: x - 5,
        width: 7,
        height: 7,
        borderRadius: 5,
        backgroundColor: '#00ff00',
        pointerEvents: 'none',
      }}
    />
  ) : null
}

export default MovingDot
