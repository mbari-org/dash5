import React from 'react'
import clsx from 'clsx'
import { CellVirtualizer, CellVirtualizerProps } from './CellVirtualizer'

export interface AccordionCellsProps {
  className?: string
  style?: React.CSSProperties
  cellAtIndex: CellVirtualizerProps['cellAtIndex']
  count?: number
}

export const AccordionCells: React.FC<AccordionCellsProps> = ({
  className,
  style,
  cellAtIndex,
  count = 0,
}) => {
  return (
    <div
      className={clsx('relative flex h-full flex-shrink flex-grow', className)}
      style={style}
    >
      <CellVirtualizer
        cellAtIndex={cellAtIndex}
        count={count}
        className="absolute inset-0 w-full"
      />
      <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-stone-400/20" />
    </div>
  )
}

AccordionCells.displayName = 'Navigation.AccordionCells'
