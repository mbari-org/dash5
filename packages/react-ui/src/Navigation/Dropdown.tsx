import React from 'react'
import clsx from 'clsx'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { swallow } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface DropdownProps {
  className?: string
  style?: React.CSSProperties
  header?: JSX.Element
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
  cellPadding: 'py-4 pl-4',
  options: 'flex w-full items-center text-left hover:bg-stone-100',
}

export const Dropdown: React.FC<DropdownProps> = ({
  className,
  style,
  header,
  options,
}) => {
  return (
    <article style={style} className={clsx(styles.container, className)}>
      <ul className="w-full">
        {header && <li className={styles.cellPadding}>{header}</li>}
        {options.map(({ label, disabled, onSelect, icon }, index) => (
          <li key={index}>
            <hr />
            <button
              aria-label="option"
              className={clsx(styles.options, styles.cellPadding)}
              onClick={swallow(onSelect)}
              disabled={disabled}
            >
              <span>
                {icon && (
                  <FontAwesomeIcon
                    icon={icon}
                    className={clsx('pr-2 text-xs', disabled && 'opacity-30')}
                  />
                )}
              </span>
              <span className={clsx(disabled && 'opacity-30')}>{label}</span>
            </button>
          </li>
        ))}
      </ul>
    </article>
  )
}

Dropdown.displayName = 'Components.Dropdown'
