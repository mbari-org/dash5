import React, { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export interface OverlayProps {}

export const useOverlayRoot = () => document.getElementById('overlay-root')

export const Overlay: React.FC = ({ children }) => {
  const overlayRoot = useOverlayRoot()
  const el = useRef(document.createElement('div'))

  useEffect(() => {
    overlayRoot?.appendChild(el.current)
    return () => {
      overlayRoot?.removeChild(el.current)
    }
  })

  return createPortal(children, el.current)
}
