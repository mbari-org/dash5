import React from 'react'
import clsx from 'clsx'
import { Button, ButtonProps } from './Button'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface AccessoryButtonProps extends ButtonProps {
  className?: string
  style?: React.CSSProperties
  label: string
  secondary?: string
  icon?: IconProp
  reverse?: boolean
  isActive?: boolean
  isSecondaryActive?: boolean
}

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
  className,
  icon,
  label,
  secondary,
  reverse,
  isActive,
  isSecondaryActive,
  ...props
}) => {
  return (
    <Button
      {...props}
      appearance="secondary"
      className={clsx(
        className,
        'flex items-center',
        reverse && 'flex-row-reverse'
      )}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className={clsx('my-auto text-stone-800', reverse ? 'ml-3' : 'mr-3')}
          aria-label="supporting icon"
        />
      )}
      <div className="flex-shrink-0 flex-grow ">
        <span className={clsx(isActive && 'text-teal-500')}>{label}</span>
        {secondary && (
          <>
            {' / '}
            <span className={clsx(isSecondaryActive && 'text-teal-500')}>
              {secondary}
            </span>
          </>
        )}
      </div>
    </Button>
  )
}

AccessoryButton.displayName = 'Components.AccessoryButton'
