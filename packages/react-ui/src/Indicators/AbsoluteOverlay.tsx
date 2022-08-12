import React from 'react'
import { Spinner } from './Spinner'
import clsx from 'clsx'

export interface AbsoluteOverlayProps {
  /**
   * A Tailwind class name to apply to the containing element degaults to bg-white.
   */
  bgClassName?: string
  /**
   * A z-index value via tailwindcss. Defaults to z-30.
   */
  zIndex?: string
}

export const AbsoluteOverlay: React.FC<AbsoluteOverlayProps> = ({
  bgClassName = 'bg-white',
  zIndex = 'z-30',
}) => (
  <div
    className={clsx(
      'absolute top-0 left-0 flex h-full w-full bg-opacity-75',
      bgClassName,
      zIndex
    )}
  >
    <Spinner size="4x" className="m-auto" />
  </div>
)

AbsoluteOverlay.displayName = 'Indicators.AbsoluteOverlay'
