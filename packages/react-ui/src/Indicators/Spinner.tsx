import { IconProp, SizeProp } from '@fortawesome/fontawesome-svg-core'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as React from 'react'
import clsx from 'clsx'

export interface SpinnerProps {
  /**
   * The size of the spinner. Defaults to 1x
   */
  size?: SizeProp
  /**
   * Any additional CSS classes to apply to the containing element.
   */
  className?: string
}

export const Spinner: React.FC<SpinnerProps> = ({ className, size = '1x' }) => (
  <p className={clsx(className, 'flex flex-shrink flex-grow-0')}>
    <span className="m-auto block animate-spin">
      <FontAwesomeIcon icon={faCircleNotch as IconProp} size={size} />
    </span>
  </p>
)

Spinner.displayName = 'Indicators.Spinner'
