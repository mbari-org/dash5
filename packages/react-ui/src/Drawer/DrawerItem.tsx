import React from 'react'
import { IconDefinition } from '@fortawesome/fontawesome-common-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { IconProp } from '@fortawesome/fontawesome-svg-core'

export interface DrawerItemProps {
  name: string
  icon: IconDefinition
  onClick?: () => void
}

const style = {
  button:
    'cursor-pointer rounded flex text-white text-lg font-semibold p-2 font-display w-full m-0 hover:bg-black hover:bg-opacity-5 transition-colors duration-250 ease-out',
  icon: 'mx-auto',
  iconWrap: 'flex w-24 p-0 mx-0 my-auto',
  text: 'ml-3 mr-auto',
}

export const DrawerItem: React.FC<DrawerItemProps> = ({
  name,
  icon,
  onClick,
}) => {
  const handleClick: React.MouseEventHandler = (e) => {
    e.preventDefault()
    e.stopPropagation()
    onClick?.()
  }

  return (
    <button onClick={handleClick} disabled={!onClick} className={style.button}>
      <p className={style.iconWrap}>
        <FontAwesomeIcon icon={icon as IconProp} className={style.icon} />
      </p>
      <span className={style.text}>{name}</span>
    </button>
  )
}

DrawerItem.displayName = 'Drawer.DrawerItem'
