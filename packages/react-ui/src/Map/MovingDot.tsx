import React, { useState, useEffect, SetStateAction } from 'react'
import { MeasurementProps } from './Measurement'

const MovingDot: React.FC<MeasurementProps> = ({ editing }) => {
  const [x, setX] = useState(0)
  const [y, setY] = useState(0)
  const [dotVisible, setDotVisibility] = useState(
    null as null | { editing: boolean }
  )
  const [dot, setDot] = useState(false)

  useEffect(() => {
    const handleMouseMove = (event: {
      clientX: SetStateAction<number>
      clientY: SetStateAction<number>
    }) => {
      setX(event.clientX)
      setY(event.clientY)
    }
    if (editing) {
      document.addEventListener('mousemove', handleMouseMove)
      setDot(true)
    } else {
      // Return a function to remove the event listener when the component is unmounted
      document.addEventListener('mousemove', handleMouseMove)
      setDot(false)
    }
  }, [editing])
  return (
    <>
      {editing ? (
        <div
          style={{
            cursor: 'pointer',
            position: 'fixed',
            top: y - 5,
            left: x - 5,
            width: 7,
            height: 7,
            borderRadius: 5,
            backgroundColor: '#00ff00',
            // transform: `translate(${x}px, ${y}px)`,
          }}
        />
      ) : null}
    </>
  )
}

export default MovingDot
