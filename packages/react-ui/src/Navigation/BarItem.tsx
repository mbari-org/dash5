import React, { FC, useState } from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { Icon, IconRendererMode } from '../Navigation'
import { ToolTip, ToolTipAlignment, ToolTipDirection } from './ToolTip'
import clsx from 'clsx'

export type BarItemAppearance = 'button' | 'icon'

export interface BarItemProps {
  /**
   * An optional tool tip for the item
   */
  toolTip?: string
  /**
   * An optional keyboard short cut to indicate in the tooltip
   */
  shortCut?: string
  /**
   * An optional direction to adjust how the tool tip is presented
   */
  toolTipDirection?: ToolTipDirection
  /**
   * An optional alignment to adjust how the tool tip is presented
   */
  toolTipAlignment?: ToolTipAlignment
  /**
   * The icon for the bar item
   */
  icon?: IconDefinition
  /**
   * An optional label rendered adjacent or in favor of the icon.
   */
  label?: string
  /**
   * Indicates whether or not the button can be clicked.
   */
  disabled?: boolean
  /**
   * Indicates whether or not to render the circular background even when the button is not hovered over.
   */
  indicated?: boolean
  /**
   * A callback that is triggered when the item is clicked.
   */
  onClick?(): void
  /**
   * The icon mode used to prioritize the button.
   */
  mode?: IconRendererMode
  /**
   * The background to utilize if the button is indicated.
   */
  indicatorMode?: IconRendererMode
  /**
   * The default style to use when rendering the bar item button.
   */
  appearance?: BarItemAppearance
  /**
   * Any tailwind classes to override default appearance / behavior.
   */
  className?: string
}

const style = {
  buttonItem:
    'relative text-indigo-500 border border-indigo-500 text-xs lg:text-sm px-1 lg:px-2 my-auto h-8 xl:h-10 first:rounded-l-lg first:border-r-0 last:rounded-r-lg last:border-l-0 hover:bg-stone-200',
  baseItem:
    'outline-none active:outline-none border-0 my-auto h-8 w-8 lg:w-10 lg:h-10 hover:bg-stone-200 rounded-full relative transition ease-out duration-200 flex-shrink-0',
  disabledItem: 'opacity-50 cursor-not-allowed pointer-events-none',
  negatedIndicatedItem: 'bg-stone-200 hover:bg-stone-300',
  primaryIndicatedItem: 'bg-emerald-500 hover:bg-emerald-500-dark',
  secondaryIndicatedItem: 'bg-indigo-500 hover:bg-indigo-700',
}

const styleForItem = ({
  indicated,
  disabled,
  indicatorMode,
  appearance,
}: {
  indicated?: boolean
  disabled?: boolean
  indicatorMode?: IconRendererMode
  appearance?: BarItemAppearance
}) => {
  if (appearance === 'button') {
    return style.buttonItem
  }

  return clsx(
    style.baseItem,
    indicated && indicatorMode === 'primary' && style.primaryIndicatedItem,
    indicated && indicatorMode === 'secondary' && style.secondaryIndicatedItem,
    indicated &&
      ['default', 'negative'].includes(indicatorMode ?? '') &&
      style.negatedIndicatedItem,
    disabled && style.disabledItem
  )
}

export const BarItem: FC<BarItemProps> = ({
  children,
  className,
  disabled,
  onClick,
  icon,
  label,
  toolTip,
  toolTipDirection,
  toolTipAlignment,
  shortCut,
  mode = 'primary',
  indicated,
  indicatorMode = 'negative',
  appearance = 'icon',
}) => {
  const [hover, setHover] = useState(false)
  const handleClick: React.MouseEventHandler = (e) => {
    e.preventDefault()
    if (!disabled) {
      onClick?.()
    }
  }
  const isButton = appearance === 'button'
  return (
    <button
      onClick={handleClick}
      style={isButton ? {} : { outlineColor: 'rgba(0,0,0,0)' }}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
      className={clsx(
        !disabled && 'cursor-pointer',
        styleForItem({ indicated, disabled, indicatorMode, appearance }),
        className
      )}
    >
      {icon ? (
        <div
          className={clsx(
            'm-auto flex',
            appearance === 'button'
              ? 'text-md px-1'
              : 'text-md lg:text-md xl:text-xl'
          )}
        >
          <Icon icon={icon} mode={mode} />
        </div>
      ) : label ? (
        <span className="m-auto">{label}</span>
      ) : (
        <div className="m-auto flex">{children}</div>
      )}
      {toolTip ? (
        <ToolTip
          label={toolTip}
          direction={toolTipDirection}
          align={toolTipAlignment}
          active={hover}
          shortCut={shortCut}
        />
      ) : null}
    </button>
  )
}

BarItem.displayName = 'Navigation.BarItem'
