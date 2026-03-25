import React from 'react'
import clsx from 'clsx'
import { CellVirtualizer, CellVirtualizerProps } from './CellVirtualizer'
import { AbsoluteOverlay } from '../Indicators'

export interface AccordionCellsProps {
  className?: string
  style?: React.CSSProperties
  cellAtIndex: CellVirtualizerProps['cellAtIndex']
  count?: number
  loading?: boolean
  header?: React.ReactNode
  maxHeight?: string
  hideBottomFade?: boolean
}

export const AccordionCells: React.FC<AccordionCellsProps> = ({
  className,
  style,
  cellAtIndex,
  count = 0,
  loading,
  header,
  maxHeight,
  hideBottomFade = false,
}) => {
  return (
    <div
      className={clsx(
        'relative flex',
        !maxHeight && 'h-full flex-shrink flex-grow',
        className
      )}
      style={style}
    >
      <CellVirtualizer
        cellAtIndex={cellAtIndex}
        count={count}
        className={clsx(
          'w-full',
          maxHeight ? ['overflow-y-auto', maxHeight] : 'absolute inset-0'
        )}
        header={header}
      />
      {!hideBottomFade ? (
        <div className="absolute inset-x-0 bottom-0 z-10 h-2 bg-gradient-to-t from-stone-400/20" />
      ) : null}
      {loading && <AbsoluteOverlay />}
    </div>
  )
}

AccordionCells.displayName = 'Navigation.AccordionCells'
