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
}

export const AccessoryButton: React.FC<AccessoryButtonProps> = ({
  className,
  icon,
  label,
  ...props
}) => {
  return (
    <Button {...props} appearance="secondary">
      {icon && (
        <FontAwesomeIcon
          icon={icon}
          className="my-auto mr-3 text-stone-800"
          aria-label="supporting icon"
        />
      )}
      {label}
    </Button>
  )
}

AccessoryButton.displayName = 'Components.AccessoryButton'
