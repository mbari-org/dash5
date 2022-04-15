import React from 'react'
import clsx from 'clsx'

export interface StepProgressProps {
  className?: string
  style?: React.CSSProperties
  steps: string[]
  currentIndex: number
}

const styles = {
  container: 'bg-white p-2 font-display overflow-x-auto',
  step: 'mr-2 flex flex-grow justify-center py-2 px-4 sm:text-sm md:text-md lg:text-lg xl:text-xl',
  active: 'bg-primary-600 text-white',
  inactive: 'bg-stone-200 text-stone-500 opacity-90',
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
          <li
            key={`${step}${index}`}
            className={clsx(
              styles.step,
              index <= currentIndex ? styles.active : styles.inactive
            )}
          >
            <span>{index + 1}</span>
            {'.'}
            <span className="truncate pl-2">{step}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

StepProgress.displayName = 'Components.StepProgress'
