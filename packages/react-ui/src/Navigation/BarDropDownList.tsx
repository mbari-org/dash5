import React, { useState } from 'react'
import clsx from 'clsx'
import { remCalc, wait } from 'utils'

const CONTAINER_STYLE = 'mx-1 my-auto relative'
const RESULT_STYLES =
  'bg-white flex min-w-full flex-col border-2 border-t-0 shadow rounded-b overflow-y-auto absolute mt-0 top-100 z-40'
const LEFT_STYLES = 'left-0'
const RIGHT_STYLES = 'right-0'
const OVERLAY_STYLES = 'fixed top-0 left-0 w-screen h-screen z-10 opacity-0'
const RESULT_ITEM_STYLES = 'border-b border-stone-300 text-left text-sm'

export type BarDropDownListToggleRenderFn = (
  active: boolean,
  onClick: React.MouseEventHandler
) => JSX.Element

export interface BarDropDownListProps {
  name: string
  className?: string
  children: (dismiss: () => void) => JSX.Element[]
  toggle: BarDropDownListToggleRenderFn
  position?: 'left' | 'right'
  onDismiss?: () => void
}

export const BarDropDownList: React.FC<BarDropDownListProps> = ({
  name,
  className,
  children,
  toggle,
  position = 'left',
  onDismiss,
}) => {
  const [active, setActive] = useState(false)
  const handleToggle: React.MouseEventHandler = (e) => {
    e?.preventDefault()
    setActive(!active)
  }
  const delayedDismiss = async () => {
    await wait(0.2)
    setActive(false)
    onDismiss?.()
  }
  return (
    <div className={clsx(className, CONTAINER_STYLE)}>
      {toggle(active, handleToggle)}
      {active ? (
        <>
          <ul
            className={clsx(
              RESULT_STYLES,
              position === 'left' ? LEFT_STYLES : RIGHT_STYLES
            )}
            style={{ maxHeight: remCalc(256) }}
          >
            {children(delayedDismiss).map((child, index) => (
              <li
                className={RESULT_ITEM_STYLES}
                onClick={delayedDismiss}
                key={`dropdown${name}Option${index}`}
              >
                {child}
              </li>
            ))}
          </ul>
          <button className={OVERLAY_STYLES} onClick={delayedDismiss}>
            Dismiss Dropdown
          </button>
        </>
      ) : null}
    </div>
  )
}

BarDropDownList.displayName = 'Navigation.BarDropDownList'
