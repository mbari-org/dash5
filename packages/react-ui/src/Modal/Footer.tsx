import React from 'react'
import clsx from 'clsx'
import { Button } from '../Navigation'
import { swallow } from '@mbari/utils'

export interface FooterProps {
  className?: string
  style?: React.CSSProperties
  confirmButtonText?: string
  cancelButtonText?: string
  onConfirm?: (() => void) | null
  onCancel?: (() => void) | null
  disableCancel?: boolean
  disableConfirm?: boolean
}

const styles = {
  bar: 'py-2 px-4 flex bg-secondary-300',
  list: 'flex flex-grow flex-row-reverse items-center justify-between',
  item: 'flex my-auto self-center',
  cancel: 'ml-auto',
}

export const Footer: React.FC<FooterProps> = ({
  className,
  confirmButtonText = 'Confirm',
  cancelButtonText = 'Cancel',
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  disableCancel,
  disableConfirm,
}) => {
  return (
    <nav className={clsx(styles.bar, className)}>
      <ol className={styles.list}>
        {handleConfirm && (
          <li className={clsx(styles.item, 'ml-auto')}>
            <Button
              appearance="primary"
              onClick={swallow(handleConfirm)}
              disabled={disableConfirm}
              aria-label="Confirm"
            >
              {confirmButtonText}
            </Button>
          </li>
        )}
        {handleCancel && (
          <li className={styles.item}>
            <Button
              appearance="secondary"
              onClick={swallow(handleCancel)}
              disabled={disableCancel}
              aria-label="Cancel"
            >
              {cancelButtonText}
            </Button>
          </li>
        )}
      </ol>
    </nav>
  )
}

Footer.displayName = 'Components.Footer'
