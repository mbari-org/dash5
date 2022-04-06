import React from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { faEllipsisV, faTimes } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { AccessoryButton } from '../Navigation/AccessoryButton'
import { IconButton } from '../Navigation'

export interface DocCellProps {
  className?: string
  style?: React.CSSProperties
  onSelect: () => void
  onSelectMore: () => void
  onSelectMission: (id: string) => void
  time: string
  date: string
  label: string
  missions: Mission[]
}

interface Mission {
  name: string
  id: string
}

const styles = {
  container: 'flex items-center bg-white font-display',
  accButton: 'font-semibold text-gray-700 flex border-gray-300 !w-full',
  iconButton: 'absolute right-4 my-auto',
}

export const DocCell: React.FC<DocCellProps> = ({
  className,
  onSelect,
  onSelectMission,
  onSelectMore,
  time,
  date,
  label,
  missions,
}) => {
  return (
    <article className={clsx(styles.container, className)}>
      <ul className="ml-2 p-4 text-gray-500">
        <li aria-label="time">{time}</li>
        <li aria-label="date">{date}</li>
      </ul>
      <div className="p-4">
        <button
          className="font-light text-primary-600"
          onClick={swallow(onSelect)}
        >
          {label}
        </button>
        <ul className="grid grid-cols-2 gap-1">
          {missions.map(({ name, id }) => (
            <li key={id}>
              <AccessoryButton
                className={styles.accButton}
                label={name}
                icon={faTimes as IconProp}
                onClick={swallow(() => onSelectMission(id))}
                reverse={true}
              />
            </li>
          ))}
        </ul>
      </div>
      <IconButton
        icon={faEllipsisV}
        ariaLabel={'More options'}
        onClick={onSelectMore}
        className={styles.iconButton}
      />
    </article>
  )
}

DocCell.displayName = 'Components.DocCell'
