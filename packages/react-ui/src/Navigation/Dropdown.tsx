import React, { useRef } from 'react'
import clsx from 'clsx'
import { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { swallow, useOnClickOutside } from '@mbari/utils'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface DropdownProps {
  className?: string
  style?: React.CSSProperties
  header?: JSX.Element | string
  options: DropDownOption[]
  scrollable?: boolean
  onDismiss?: () => void
}

export interface DropDownOption {
  label: JSX.Element | string
  onSelect: () => void
  icon?: IconDefinition
  disabled?: boolean
}

const styles = {
  container:
    'rounded-md bg-white font-display flex drop-shadow-lg border-solid border-stone-300 border',
  cellPadding: 'py-3 pl-4',
  options: 'flex w-full items-center text-left hover:bg-stone-100',
  sticky: 'sticky top-0 bg-white/90 rounded z-10',
}

export const Dropdown: React.FC<DropdownProps> = ({
  className,
  style,
  header,
  options,
  scrollable,
  onDismiss: handleDismiss = () => undefined,
}) => {
  const ref = useRef<HTMLElement | null>(null)
  useOnClickOutside(ref, handleDismiss)
  return (
    <>
      <article
        style={style}
        className={clsx(styles.container, className)}
        ref={ref}
      >
        <ul className={clsx('w-full', scrollable && 'overflow-y-auto')}>
          {header && (
            <li className={clsx(styles.cellPadding, styles.sticky)}>
              {header}
            </li>
          )}
          {options.map(({ label, disabled, onSelect, icon }, index) => (
            <li key={index}>
              <hr />
              <button
                aria-label="option"
                className={clsx(styles.options, styles.cellPadding)}
                onClick={swallow(onSelect)}
                disabled={disabled}
                data-testid={`dropdown-option-${index}`}
              >
                <span>
                  {icon && (
                    <FontAwesomeIcon
                      icon={icon}
                      className={clsx('pr-2 text-xs', disabled && 'opacity-30')}
                    />
                  )}
                </span>
                <span className={clsx('w-full', disabled && 'opacity-30')}>
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </article>
    </>
  )
}

Dropdown.displayName = 'Components.Dropdown'
