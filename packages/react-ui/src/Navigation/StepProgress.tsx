import React from 'react'
import clsx from 'clsx'

export interface StepProgressProps {
  className?: string
  style?: React.CSSProperties
  steps: Step[]
}

interface Step {
  id: string
  title: string
  inProgress: boolean
}

const styles = {
  container: 'bg-white p-2 font-display',
  step: 'mr-2 flex flex-grow justify-center py-2 px-4 text-xl',
  active: 'bg-primary-600 text-white',
  inactive: 'bg-stone-200 text-stone-500 opacity-90',
}

export const StepProgress: React.FC<StepProgressProps> = ({
  className,
  steps,
}) => {
  return (
    <article className={clsx(styles.container, className)}>
      <ul className="flex overflow-visible">
        {steps.map(({ title, inProgress }, index) => (
          <li
            key={index}
            className={clsx(
              styles.step,
              inProgress ? styles.active : styles.inactive
            )}
          >
            <span>{index + 1}</span>
            {'.'}
            <span className="truncate pl-2">{title}</span>
          </li>
        ))}
      </ul>
    </article>
  )
}

StepProgress.displayName = 'Components.StepProgress'
