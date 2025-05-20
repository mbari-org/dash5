import React, { useCallback } from 'react'
import clsx from 'clsx'
import { useVirtualizer } from '@tanstack/react-virtual'

// Define a more flexible Virtualizer type that works with any element types
export type Virtualizer<
  TScrollElement extends Element = Element,
  TItemElement extends Element = Element
> = ReturnType<typeof useVirtualizer<TScrollElement, TItemElement>>

export interface CellVirtualizerProps {
  className?: string
  style?: React.CSSProperties
  // Use a more flexible type definition that's compatible with different element types
  cellAtIndex: (
    index: number,
    virtualizer: Virtualizer<any, any>
  ) => JSX.Element
  count: number
  estimateSize?: (index: number) => number
  overscan?: number
  enableSelection?: boolean
  listRole?: string
  itemRole?: string
}

export const CellVirtualizer: React.FC<CellVirtualizerProps> = ({
  className,
  cellAtIndex,
  style,
  count,
  estimateSize = () => 100,
  overscan = 5,
  enableSelection = true,
  listRole = 'list',
  itemRole = 'listitem',
}) => {
  const parentRef = React.useRef<HTMLDivElement>(null)

  // Handler for keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Support Ctrl+C to copy selected text
    if (e.ctrlKey && e.key === 'c') {
      // Let the browser's default copy behavior work
      return
    }
  }, [])

  // The virtualizer - type explicitly for clarity
  const rowVirtualizer = useVirtualizer({
    count,
    getScrollElement: () => parentRef.current,
    estimateSize,
    overscan,
  })

  return (
    <div
      ref={parentRef}
      style={style}
      className={clsx(
        className,
        'cell-virtualizer-container',
        enableSelection ? 'selectable-text' : 'non-selectable-text'
      )}
      data-testid="virtualized-list"
      role={
        ['list', 'listbox', 'grid', 'tree'].includes(listRole || '')
          ? listRole
          : undefined
      }
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-label="Virtualized content list"
    >
      <div
        className="cell-virtualizer-total-size"
        style={{ height: `${rowVirtualizer.getTotalSize()}px` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            data-index={virtualItem.index}
            ref={rowVirtualizer.measureElement}
            role={
              ['listitem', 'option', 'row', 'treeitem'].includes(itemRole || '')
                ? itemRole
                : undefined
            }
            tabIndex={-1}
            className="cell-virtualizer-item"
            style={{ transform: `translateY(${virtualItem.start}px)` }}
          >
            {cellAtIndex(virtualItem.index, rowVirtualizer)}
          </div>
        ))}
      </div>
    </div>
  )
}

CellVirtualizer.displayName = 'Components.CellVirtualizer'
