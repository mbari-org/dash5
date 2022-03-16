import React, { FC } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import clsx from 'clsx'

export type IconRendererMode = 'default' | 'primary' | 'secondary' | 'negative'

export interface IconDefinitions {
  /**
   * The FontAwesome icon definition to be utilized.
   */
  icon: IconDefinition
  /**
   * The determines the color of the icon.
   */
  mode: IconRendererMode
}

const style = {
  base: 'flex m-auto',
  default: 'text-current',
  primary: 'text-emerald-600',
  secondary: 'text-indigo-600 hover:text-primary-dark',
  negative: 'text-white',
}

export const Icon: FC<IconDefinitions> = ({ icon, mode }) => {
  return (
    <FontAwesomeIcon
      className={clsx(
        style.base,
        mode === 'primary' && style.primary,
        mode === 'secondary' && style.secondary,
        mode === 'negative' && style.negative,
        mode === 'default' && style.default
      )}
      icon={icon as IconProp}
    />
  )
}

Icon.displayName = 'Navigation.Icon'
