import React from 'react'
import clsx from 'clsx'

export interface SbdChunkBoxesProps {
  className?: string
  /** Chunks confirmed delivered */
  delivered: number
  /** Total SBD parts for this command */
  total: number
}

/**
 * Dash4-style SBD chunk progress: one box per part, filled as each lands (#797).
 */
export const SbdChunkBoxes: React.FC<SbdChunkBoxesProps> = ({
  className,
  delivered,
  total,
}) => {
  if (total < 2) return null
  const safeDelivered = Math.max(0, Math.min(delivered, total))
  const label = `SBD ${safeDelivered} of ${total}`

  return (
    <ul
      className={clsx('flex items-center gap-0.5', className)}
      aria-label={label}
      title={label}
    >
      {Array.from({ length: total }, (_, i) => {
        const filled = i < safeDelivered
        return (
          <li
            key={i}
            aria-hidden
            className={clsx(
              'h-2.5 w-2.5 rounded-sm border',
              filled
                ? 'border-teal-600 bg-teal-500'
                : 'border-stone-400 bg-transparent'
            )}
          />
        )
      })}
    </ul>
  )
}

SbdChunkBoxes.displayName = 'Cells.SbdChunkBoxes'
