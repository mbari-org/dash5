import React from 'react'
import clsx from 'clsx'
import { useVirtualizer } from '@tanstack/react-virtual'

export type Virtualizer = ReturnType<typeof useVirtualizer>

export interface CellVirtualizerProps {
  className?: string
  style?: React.CSSProperties
  cellAtIndex: (index: number, virtualizer: Virtualizer) => JSX.Element
  count: number
  estimateSize?: (index: number) => number
}

export const CellVirtualizer: React.FC<CellVirtualizerProps> = ({
  className,
  cellAtIndex,
  style,
  count,
  estimateSize = () => 100,
}) => {
  // The scrollable element for your list
  const parentRef = React.useRef(null)

  // The virtualizer
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize,
  })

  return (
    <div
      ref={parentRef}
      style={{
        ...style,
      }}
      className={clsx(className, 'overflow-auto')}
      data-testid="virtualized-list"
    >
      {/* The large inner element to hold all of the items */}
      <div
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {/* Only the visible items in the virtualizer, manually positioned to be in view */}
        {rowVirtualizer.getVirtualItems().map((virtualItem: any) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={rowVirtualizer.measureElement}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {cellAtIndex(virtualItem.index, rowVirtualizer)}
          </div>
        ))}
      </div>
    </div>
  )
}

CellVirtualizer.displayName = 'Components.CellVirtualizer'
