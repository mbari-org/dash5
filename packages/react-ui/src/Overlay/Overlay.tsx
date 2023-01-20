import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export const useOverlayRoot = () => document.getElementById('overlay-root')

export const Overlay: React.FC<{ children?: React.ReactNode }> = ({
  children,
}) => {
  const overlayRoot = useOverlayRoot()
  const el = useRef(document.createElement('div'))

  useEffect(() => {
    const node = el.current
    overlayRoot?.appendChild(el.current)
    return () => {
      overlayRoot?.removeChild(node)
    }
  })

  return createPortal(children, el.current)
}
