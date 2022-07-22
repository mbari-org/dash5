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
  missions?: Mission[]
}

interface Mission {
  name: string
  id: string
}

const styles = {
  container: 'grid grid-cols-9 gap-2 bg-white font-display flex-grow',
  accButton:
    'text-sm font-semibold text-gray-700 flex border-gray-300 !text-left mb-1',
  iconButton: 'mt-2',
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
  const labelAsArray = label.split(' ')
  const truncatedLabel = labelAsArray
    .filter((word, i) => {
      if (i < 3) return word
      if (labelAsArray[2] === '-' && i === 3) return word
    })
    .join(' ')

  return (
    <div className={clsx('flex bg-white p-2 pr-0', className)}>
      <article className={clsx(styles.container)}>
        <ul className="col-span-3 ml-2 pt-2 text-sm text-gray-500">
          <li aria-label="time">{time}</li>
          <li aria-label="date">{date}</li>
        </ul>
        <div className="col-span-6 pt-2 text-sm">
          <button
            className="w-full truncate text-left font-light text-primary-600"
            onClick={swallow(onSelect)}
          >
            {truncatedLabel}
          </button>
          <ul className="flex flex-col">
            {missions?.map(({ name, id }) => (
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
      </article>
      <IconButton
        icon={faEllipsisV}
        ariaLabel={'More options'}
        onClick={onSelectMore}
        className={styles.iconButton}
        size={'text-2xl'}
      />
    </div>
  )
}

DocCell.displayName = 'Components.DocCell'
