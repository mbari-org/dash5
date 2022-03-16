import React, { FC, useState } from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { Icon } from './Icon'
import { ToolTip } from './ToolTip'
import clsx from 'clsx'

export interface TabProps {
  /**
   * The FontAwesome icon definition to be utilized.
   */
  icon: IconDefinition
  /**
   * The determines if the tab is selected.
   */
  selected?: boolean
  /**
   * The determines if the tab should expand to fill the parent container (flexbox).
   */
  grow?: boolean
  /**
   * An optional tool tip for the item
   */
  toolTip?: string
  /**
   * A callback fired when the tab is clicked.
   */
  onClick: () => void
  /**
   * Indicates the tab should be compact in appearance.
   */
  compact?: boolean
}

const style = {
  tab: 'outline-none active:outline-none px-2 flex-shrink-0 relative flex',
  default: 'bg-stone-200 hover:bg-stone-300',
  selected: 'bg-indigo-500 hover:bg-indigo-500',
}

export const Tab: FC<TabProps> = ({
  icon,
  selected,
  onClick,
  grow,
  toolTip,
  compact,
}) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    onClick()
  }
  const [hover, setHover] = useState(false)
  return (
    <button
      style={{ outlineColor: 'rgba(0,0,0,0)' }}
      className={clsx(
        style.tab,
        selected ? style.selected : style.default,
        compact ? 'py-1' : 'py-4',
        grow && 'flex-grow'
      )}
      onClick={handleClick}
      onMouseOver={() => setHover(true)}
      onMouseOut={() => setHover(false)}
    >
      <Icon mode={selected ? 'negative' : 'default'} icon={icon} />
      {toolTip ? (
        <ToolTip label={toolTip} direction="below" active={hover} />
      ) : null}
    </button>
  )
}

Tab.displayName = 'Navigation.Tab'
