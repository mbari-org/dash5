import { swallow } from '@mbari/utils'
import React from 'react'

const DismissOverlay: React.FC<{ onClick: () => void }> = (props) => {
  const handleClick = swallow(props.onClick)
  return (
    <button
      className="fixed top-0 left-0 z-10 h-screen w-screen bg-stone-100 opacity-5 active:bg-stone-200"
      onClick={handleClick}
    ></button>
  )
}

export default DismissOverlay
