import React, { useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconDefinition } from '@fortawesome/pro-regular-svg-icons'
import { ToolTip, ToolTipAlignment, ToolTipDirection } from './ToolTip'
import clsx from 'clsx'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface IconButtonProps {
  tooltip?: string
  tooltipAlignment?: ToolTipAlignment
  toolTipDirection?: ToolTipDirection
  icon: IconDefinition
  disabled?: boolean
  inactive?: boolean
  onClick?: (target: HTMLButtonElement) => void
  className?: string
  style?: React.CSSProperties
  noPadding?: boolean
  ariaLabel: string
  /**
   * The tailwind text size class to apply to the icon.
   */
  size?:
    | 'text-xs'
    | 'text-sm'
    | 'text-md'
    | 'text-lg'
    | 'text-xl'
    | 'text-2xl'
    | 'text-3xl'
    | 'text-4xl'
    | 'text-5xl'
}

const style = {
  button: 'rounded-full flex-shrink-0 leading-none',
  buttonHover: 'hover:bg-primary-600 hover:bg-opacity-10',
  inactive: 'opacity-50',
  disabled: 'opacity-25 pointer-events-none',
}

export const IconButton: React.FC<IconButtonProps> = ({
  disabled,
  icon,
  onClick: clickHandlerFromProps,
  className,
  style: styleFromProps,
  tooltip,
  tooltipAlignment = 'center',
  toolTipDirection = 'below',
  inactive,
  noPadding,
  ariaLabel,
  size = 'text-lg',
}) => {
  const [hoverTimeout, setHoverTimeout] = useState<any>()
  const [hover, setHover] = useState(false)

  const handleMouseOver: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (tooltip) {
      setHoverTimeout(setTimeout(() => setHover(true), 500))
    }
  }
  const handleMouseOut: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    if (tooltip) {
      clearTimeout(hoverTimeout)
      setHover(false)
    }
  }
  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (clickHandlerFromProps) {
      clickHandlerFromProps(e.currentTarget)
    }
  }
  return (
    <button
      className={clsx([
        style.button,
        (className ?? '').indexOf('absolute') < 0 && 'relative',
        (className ?? '').indexOf('hover:bg') < 0 && style.buttonHover,
        !noPadding && 'p-2',
        size,
        size === 'text-xs' && 'h-7 w-7',
        size === 'text-sm' && 'h-8 w-8',
        size === 'text-md' && 'h-9 w-9',
        size === 'text-lg' && 'h-10 w-10',
        size === 'text-xl' && 'h-11 w-11',
        size === 'text-2xl' && 'h-12 w-12',
        size === 'text-3xl' && 'h-14 w-14',
        className,
        disabled && !inactive && style.disabled,
        inactive && style.inactive,
      ])}
      onClick={handleClick}
      style={styleFromProps}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
      aria-label={ariaLabel}
    >
      <FontAwesomeIcon icon={icon as IconProp} />
      {tooltip ? (
        <ToolTip
          label={tooltip}
          active={hover}
          direction={toolTipDirection}
          align={tooltipAlignment}
        />
      ) : null}
    </button>
  )
}

IconButton.displayName = 'Navigation.IconButton'
