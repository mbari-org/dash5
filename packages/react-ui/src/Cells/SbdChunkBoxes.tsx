import React from 'react'
import clsx from 'clsx'

export interface SbdChunkBoxesProps {
  className?: string
  /** Chunks confirmed delivered (vehicle sat-received / cell ack) */
  delivered: number
  /**
   * Chunks shore has dispatched but vehicle has not confirmed.
   * Rendered after delivered boxes with an orange pulsing border.
   */
  inTransit?: number
  /** Total SBD parts for this command */
  total: number
  /** Show "SBD N of M" text beside the boxes (detail modal). */
  showLabel?: boolean
  /** Slightly larger boxes for detail modal layout. */
  size?: 'sm' | 'md'
}

/**
 * Dash4-style SBD chunk progress: one box per part (#797).
 * Gray pending → orange in-transit → green delivered.
 */
export const SbdChunkBoxes: React.FC<SbdChunkBoxesProps> = ({
  className,
  delivered,
  inTransit = 0,
  total,
  showLabel = false,
  size = 'sm',
}) => {
  if (total < 2) return null
  const safeDelivered = Math.max(0, Math.min(delivered, total))
  const safeInTransit = Math.max(0, Math.min(inTransit, total - safeDelivered))
  const label = `SBD ${safeDelivered} of ${total}`
  const boxSize = size === 'md' ? 'h-3.5 w-3.5' : 'h-2.5 w-2.5'

  return (
    <div
      className={clsx('inline-flex items-center gap-2', className)}
      aria-label={label}
      title={
        safeInTransit > 0 ? `${label} (${safeInTransit} in transit)` : label
      }
    >
      {showLabel && (
        <span className="whitespace-nowrap text-sm font-medium text-stone-700">
          {label}
        </span>
      )}
      <ul className="flex items-center gap-0.5" aria-hidden>
        {Array.from({ length: total }, (_, i) => {
          const isDelivered = i < safeDelivered
          const isInTransit = !isDelivered && i < safeDelivered + safeInTransit
          return (
            <li
              key={i}
              className={clsx(
                boxSize,
                'rounded-sm border',
                isDelivered && 'border-teal-600 bg-teal-500',
                isInTransit &&
                  'sbd-chunk-in-transit border-orange-500 bg-orange-100',
                !isDelivered && !isInTransit && 'border-stone-300 bg-stone-100'
              )}
            />
          )
        })}
      </ul>
    </div>
  )
}

SbdChunkBoxes.displayName = 'Cells.SbdChunkBoxes'
