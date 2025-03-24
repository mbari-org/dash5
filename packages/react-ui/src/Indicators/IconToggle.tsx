import React, { useState } from 'react'
import {
  ToolTip,
  ToolTipAlignment,
  ToolTipDirection,
} from '../Navigation/ToolTip'
import clsx from 'clsx'

interface IconToggleProps {
  className?: string
  iconLeft: JSX.Element
  iconRight: JSX.Element
  isToggled: boolean // isToggled is true when the icon on the right is selected
  onToggle: (toggled: boolean) => void
  ariaLabelRight?: string
  ariaLabelLeft?: string
  tooltip?: string
  tooltipAlignment?: ToolTipAlignment
  toolTipDirection?: ToolTipDirection
}

const styles = {
  container:
    'relative flex h-10 cursor-pointer items-center rounded-md border border-gray-300 bg-gray-200/60',
  slider:
    'absolute rounded-md border border-black bg-white shadow-md transition-transform duration-300',
  list: 'relative z-10 flex w-full',
  icon: 'flex h-full items-center justify-center transition-colors duration-1000',
  active: 'text-black',
  inactive: 'text-gray-500',
}

export const IconToggle: React.FC<IconToggleProps> = ({
  className,
  iconLeft,
  iconRight,
  isToggled,
  onToggle,
  ariaLabelRight = 'Toggle is on',
  ariaLabelLeft = 'Toggle is off',
  tooltip,
  tooltipAlignment = 'center',
  toolTipDirection = 'below',
}) => {
  const [hoverTimeout, setHoverTimeout] = useState<any>()
  const [hover, setHover] = useState(false)

  const handleMouseOver = (e: React.MouseEvent<HTMLElement>) => {
    if (tooltip) {
      setHoverTimeout(setTimeout(() => setHover(true), 500))
    }
  }
  const handleMouseOut = (e: React.MouseEvent<HTMLElement>) => {
    if (tooltip) {
      clearTimeout(hoverTimeout)
      setHover(false)
    }
  }

  return (
    <article
      className={clsx(styles.container, className)}
      style={{ width: '84px' }}
      role="button"
      aria-pressed={isToggled}
      aria-label={isToggled ? ariaLabelRight : ariaLabelLeft}
      onClick={() => onToggle(!isToggled)}
      onMouseEnter={handleMouseOver}
      onMouseLeave={handleMouseOut}
    >
      <div
        className={styles.slider}
        style={{
          width: '42px',
          top: '-1px',
          bottom: '-1px',
          left: '-1px',
          transform: isToggled ? 'translateX(42px)' : 'translateX(0)',
        }}
      />
      <ul className={styles.list}>
        <li
          className={clsx(
            styles.icon,
            isToggled ? styles.inactive : styles.active
          )}
          style={{ width: '42px' }}
        >
          {iconLeft}
        </li>
        <li
          className={clsx(
            styles.icon,
            isToggled ? styles.active : styles.inactive
          )}
          style={{ width: '42px' }}
        >
          {iconRight}
        </li>
      </ul>
      {tooltip && (
        <ToolTip
          label={tooltip}
          active={hover}
          direction={toolTipDirection}
          align={tooltipAlignment}
        />
      )}
    </article>
  )
}

IconToggle.displayName = 'Icons.IconToggle'
