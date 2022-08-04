import React, { useRef } from 'react'
import clsx from 'clsx'
import { swallow } from '@mbari/utils'
import { faEllipsisV, faTimes } from '@fortawesome/pro-regular-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { AccessoryButton } from '../Navigation/AccessoryButton'
import { IconButton } from '../Navigation'

export interface Attachment {
  id: number | string
  name: string
  type: 'vehicle' | 'deployment'
}
export interface DocCellProps {
  className?: string
  style?: React.CSSProperties
  onSelect: () => void
  onSelectAttachment: (attachment: Attachment) => void
  onMoreClick: (
    id: { docInstanceId: number; docId: number },
    rect?: DOMRect
  ) => void
  time: string
  date: string
  label: string
  attachments?: Attachment[]
  docInstanceId: number
  docId: number
}

const styles = {
  container: 'grid grid-cols-9 gap-2 bg-white font-display flex-grow',
  accButton:
    'text-sm font-semibold text-gray-700 flex border-gray-300 !text-left mb-1',
  iconButton: 'mt-2 relative',
}

export const DocCell: React.FC<DocCellProps> = ({
  className,
  onSelect,
  onSelectAttachment,
  time,
  date,
  label,
  attachments,
  onMoreClick,
  docInstanceId,
  docId,
}) => {
  const moreButtonRef = useRef<HTMLDivElement | null>(null)
  const labelAsArray = label.split(' ')
  const truncatedLabel = labelAsArray
    .filter((word, i) => {
      if (i < 3) return word
      if (labelAsArray[2] === '-' && i === 3) return word
    })
    .join(' ')

  const handleMoreClick = () => {
    onMoreClick(
      { docInstanceId, docId },
      moreButtonRef.current?.getBoundingClientRect()
    )
  }

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
            {attachments?.map((attachment) => (
              <li key={attachment.id}>
                <AccessoryButton
                  className={styles.accButton}
                  label={attachment.name}
                  icon={faTimes as IconProp}
                  onClick={swallow(() => onSelectAttachment(attachment))}
                  reverse={true}
                />
              </li>
            ))}
          </ul>
        </div>
      </article>
      <div className={styles.iconButton} ref={moreButtonRef}>
        <IconButton
          icon={faEllipsisV}
          ariaLabel={'More options'}
          onClick={handleMoreClick}
          size={'text-2xl'}
        />
      </div>
    </div>
  )
}

DocCell.displayName = 'Components.DocCell'
