import React from 'react'
import clsx from 'clsx'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface DropdownProps {
  className?: string
  style?: React.CSSProperties
  currentValue?: string
  description?: string
  options: DropDownOption[]
}

interface DropDownOption {
  label: string
  onSelect: () => void
  icon?: IconDefinition
  disabled?: boolean
}

const styles = {
  container:
    'rounded-md bg-white font-display flex drop-shadow-lg border-solid border-stone-300 border-2',
  header: 'py-3 pl-4',
  options: 'py-2 pl-4 flex w-full items-center text-left',
}

export const Dropdown: React.FC<DropdownProps> = ({
  className,
  currentValue,
  description,
  options,
}) => {
  return (
    <article className={clsx(styles.container, className)}>
      <ul className="w-full">
        {(currentValue || description) && (
          <li className={styles.header}>
            <div aria-label="description">{description}</div>
            <div aria-label="current value" className="font-medium">
              {currentValue}
            </div>
          </li>
        )}
        {options.map(({ label, disabled, onSelect, icon }, index) => (
          <li key={index}>
            <hr />
            <button
              aria-label="option"
              className={clsx(styles.options, disabled && 'opacity-30')}
              onClick={swallow(onSelect)}
              disabled={disabled}
            >
              {icon && <FontAwesomeIcon icon={icon} className="pr-2 text-xs" />}
              {label}
            </button>
          </li>
        ))}
      </ul>
    </article>
  )
}

Dropdown.displayName = 'Components.Dropdown'
