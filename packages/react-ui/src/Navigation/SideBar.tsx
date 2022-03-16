import React, { FC } from 'react'
import clsx from 'clsx'

export type SideBarMode = 'expanded' | 'hidden' | 'compact'
export type SideBarAppearance = 'default' | 'navigator'
export type SideBarAlignment = 'left' | 'right'

export interface SideBarProps {
  /**
   * Indicates the alignment or placement of the sidebar border.
   */
  appearance?: SideBarAppearance
  /**
   * Indicates the alignment or placement of the sidebar border.
   */
  alignment?: SideBarAlignment
  /**
   * Determines the width / appearance of the sidebar.
   */
  mode?: SideBarMode
  /**
   * An optional heading to inject above the sidebar content.
   */
  renderHeading?: () => JSX.Element
  /**
   * Inject any style overrides.
   */
  style?: React.CSSProperties
  /**
   * Inject any additional tailwind classes.
   */
  className?: string
}

const style = {
  bar: 'flex flex-col relative',
  expandedBar: 'overflow-visible w-full sm:w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5',
  compactBar: 'overflow-visible w-auto',
  hiddenBar: 'w-0 overflow-hidden',
}

export const SideBar: FC<SideBarProps> = ({
  mode = 'compact',
  appearance = 'default',
  alignment = 'right',
  children,
  renderHeading,
  className,
  style: styleFromProps,
}) => {
  return (
    <div
      className={clsx([
        style.bar,
        mode === 'compact' && style.compactBar,
        mode === 'expanded' && style.expandedBar,
        mode === 'hidden' && style.hiddenBar,
        alignment === 'left' ? 'border-r' : 'border-l',
        appearance === 'navigator' && 'border-stone-300 bg-indigo-500',
        appearance !== 'navigator' && 'border-stone-300 bg-stone-100',
        className,
      ])}
      style={styleFromProps}
    >
      {renderHeading ? (
        <div className="mb-1 flex w-full">{renderHeading()}</div>
      ) : null}
      <nav className={clsx(style.bar, 'h-full p-1')}>{children}</nav>
    </div>
  )
}

SideBar.displayName = 'Navigation.SideBar'
