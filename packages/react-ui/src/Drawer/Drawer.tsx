import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface DrawerProps {
  open?: boolean
  title?: string
  onDismiss?: () => void
}

const style = {
  container:
    'fixed left-0 top-0 w-96 bg-emerald-500 flex flex-col pt-4 md:pt-12 px-4 pb-4 z-40 h-screen text-white',
  title: 'flex text-2xl font-display font-semibold mb-8 ml-8',
  button: 'w-12 h-12 mr-2 flex hover:bg-emerald-700 rounded-full',
  icon: 'm-auto',
  overlay:
    'fixed top-0 left-0 w-screen h-screen z-30 bg-indigo-500 bg-opacity-10',
}

export const Drawer: React.FC<DrawerProps> = ({
  title,
  open,
  children,
  onDismiss,
}) => {
  const handleDismiss: React.MouseEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onDismiss?.()
  }

  const handleDrawerClick: React.MouseEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }

  return open ? (
    <div className={style.overlay} onClick={handleDismiss}>
      <nav className={style.container} onClick={handleDrawerClick}>
        <h1 className={style.title}>
          <button className={style.button} onClick={handleDismiss}>
            <FontAwesomeIcon
              icon={faTimes as IconProp}
              className={style.icon}
            />
          </button>{' '}
          {title ? <span className="my-auto ml-6">{title}</span> : null}
        </h1>
        {children}
      </nav>
    </div>
  ) : null
}

Drawer.displayName = 'Drawer.Drawer'
