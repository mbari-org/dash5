import React from 'react'
import clsx from 'clsx'
import { Button, ButtonProps } from './Button'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export interface AccessoryButtonProps extends ButtonProps {
  className?: string
  style?: React.CSSProperties
  label: string
  icon?: IconProp
  reverse?: boolean
}

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
  className,
  icon,
  label,
  reverse,
  ...props
}) => {
  return (
    <Button
      {...props}
      appearance="secondary"
      className={clsx(className, 'flex', reverse && 'flex-row-reverse')}
    >
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className={clsx('my-auto text-stone-800', reverse ? 'ml-3' : 'mr-3')}
          aria-label="supporting icon"
        />
      )}
      {label}
    </Button>
  )
}

AccessoryButton.displayName = 'Components.AccessoryButton'
