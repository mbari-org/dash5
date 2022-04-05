import React from 'react'
import clsx from 'clsx'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronDown, faExpandArrows } from '@fortawesome/pro-solid-svg-icons'
import { IconProp } from '@fortawesome/fontawesome-svg-core'
import { swallow } from '@mbari/utils'

export interface AccordionHeaderProps {
  className?: string
  style?: React.CSSProperties
  label: string
  secondaryLabel?: string
  ariaLabel?: string
  onExpand?: () => void
  onToggle: (open: boolean) => void
  open?: boolean
}

const styles = {
  container: 'flex font-display',
  open: 'bg-primary-600 text-white',
  closed: 'bg-white text-stone-800',
  secondary: 'my-auto ml-3 text-sm italic',
  textButton: 'text-md flex flex-grow px-3 py-2',
  expandButton: 'pl-6 pr-2',
  chevronButton: 'pl-2 pr-4',
}

export const AccordionHeader: React.FC<AccordionHeaderProps> = ({
  className,
  style,
  label,
  secondaryLabel,
  ariaLabel,
  onExpand,
  onToggle,
  open,
}) => {
  const handleToggle = swallow(() => {
    onToggle(!open)
  })

  return (
    <div
      style={style}
      className={clsx(
        styles.container,
        className,
        open ? styles.open : styles.closed
      )}
      aria-label={ariaLabel || ''}
    >
      <button className={styles.textButton}>
        <span className={clsx(open && 'font-semibold')}>{label}</span>{' '}
        <span className={clsx(styles.secondary, !open && 'opacity-60')}>
          {secondaryLabel}
        </span>
      </button>
      {onExpand && (
        <button className={styles.expandButton} onClick={swallow(onExpand)}>
          <FontAwesomeIcon
            icon={faExpandArrows as IconProp}
            title="expand icon"
          />
        </button>
      )}
      <button className={styles.chevronButton} onClick={handleToggle}>
        <FontAwesomeIcon icon={faChevronDown as IconProp} />
      </button>
    </div>
  )
}

AccordionHeader.displayName = 'Components.AccordionHeader'
