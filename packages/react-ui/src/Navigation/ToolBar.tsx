import React, { FC } from 'react'
import clsx from 'clsx'

export type ToolBarMode = 'compact' | 'hidden'

export interface ToolBarProps {
  /**
   * Determines the appearance of the toolbar.
   */
  mode?: ToolBarMode
}

const style = {
  base: 'flex flex-row border-b border-stone-300 bg-white-100 p-1 relative',
  compact: 'overflow-visible',
  hidden: 'h-0 overflow-hidden',
}

export const ToolBar: FC<ToolBarProps> = ({ mode = 'compact', children }) => {
  return (
    <div
      className={clsx(
        style.base,
        mode === 'compact' && style.compact,
        mode === 'hidden' && style.hidden
      )}
    >
      {children}
    </div>
  )
}

ToolBar.displayName = 'Navigation.ToolBar'
