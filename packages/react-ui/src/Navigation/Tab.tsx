import React, { FC } from 'react'
import clsx from 'clsx'

export interface TabProps {
  /**
   * The determines if the tab is selected.
   */
  selected?: boolean
  /**
   * The label for this tab.
   */
  label: string | JSX.Element
  /**
   * A callback fired when the tab is clicked.
   */
  onClick: () => void
  /**
   * Apply any additional styles.
   */
  className?: string
  /**
   * Apply any additional styles.
   */
  style?: React.CSSProperties
}

const styles = {
  tab: 'outline-none text-md active:outline-none px-4 py-2 flex-shrink-0 relative flex border-t border-l border-r border-stone-300',
  default: 'bg-stone-200 hover:bg-stone-300',
  selected: 'bg-white',
}

export const Tab: FC<TabProps> = ({
  label,
  selected,
  onClick,
  className,
  style,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick()
  }

  return (
    <button
      style={style}
      className={clsx(
        styles.tab,
        selected ? styles.selected : styles.default,
        className
      )}
      onClick={handleClick}
    >
      {label}
    </button>
  )
}

Tab.displayName = 'Navigation.Tab'
