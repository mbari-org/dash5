import React from 'react'
import clsx from 'clsx'
import { useResizeObserver } from '@mbari/utils'

export interface StepProgressProps {
  className?: string
  style?: React.CSSProperties
  steps: string[]
  currentIndex: number
}

const styles = {
  container: 'bg-white p-2 font-display overflow-x-auto',
  step: 'flex flex-grow flex-shrink-0 relative',
  label:
    'sm:text-sm md:text-md lg:text-lg xl:text-xl flex justify-center py-2 px-4',
  active: 'fill-primary-600 text-white',
  inactive: 'fill-stone-200 text-stone-500 opacity-90',
}

export interface StepProps {
  className?: string
  style?: React.CSSProperties
  first?: boolean
  last?: boolean
  active?: boolean
  label: string
}

const OFFSET = 10

const Step: React.FC<StepProps> = ({ first, last, label, active }) => {
  const containerRef = React.useRef<HTMLLIElement>(null)
  const {
    size: { width: containerWidth, height: containerHeight },
  } = useResizeObserver({ element: containerRef, wait: 100 })
  const width = containerWidth || 100
  const height = containerHeight || 20

  return (
    <li className={clsx(styles.step)} ref={containerRef}>
      <span className={clsx('opacity-0', styles.label)} aria-hidden={true}>
        {label}
      </span>
      <span
        className={clsx(
          'absolute inset-0 z-10 block',
          styles.label,
          active ? 'text-white' : 'text-stone-500/90'
        )}
      >
        {label}
      </span>
      <svg
        height={height}
        width={width}
        className={clsx(
          'absolute top-0 left-0',
          active ? styles.active : styles.inactive
        )}
        data-testid="step-progress-svg"
      >
        <polygon
          points={`${first ? 0 : OFFSET} 0, ${width} 0, ${
            last ? width : width - OFFSET
          } ${height}, 0 ${height}`}
        />
      </svg>
    </li>
  )
}

export const StepProgress: React.FC<StepProgressProps> = ({
  className,
  steps,
  currentIndex,
}) => {
  return (
    <article className={clsx(styles.container, className)}>
      <ul className="flex">
        {steps.map((step, index) => (
          <Step
            key={`${step}${index}`}
            label={`${index + 1}. ${step}`}
            first={index === 0}
            last={index === steps.length - 1}
            active={index <= currentIndex}
          />
        ))}
      </ul>
    </article>
  )
}

StepProgress.displayName = 'Components.StepProgress'
