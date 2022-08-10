import React from 'react'
import clsx from 'clsx'
import { Button, ButtonProps } from '../Navigation'
import { swallow } from '@mbari/utils'

export interface FooterProps {
  className?: string
  style?: React.CSSProperties
  confirmButtonText?: string | JSX.Element
  cancelButtonText?: string | JSX.Element
  extraButtons?: ExtraButton[]
  form?: string
  onConfirm?: (() => void) | null
  onCancel?: (() => void) | null
  disableCancel?: boolean
  disableConfirm?: boolean
}

export interface ExtraButton extends ButtonProps {
  buttonText: string
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
  extraButtons,
  onCancel: handleCancel,
  onConfirm: handleConfirm,
  disableCancel,
  disableConfirm,
  form,
}) => {
  return (
    <nav className={clsx(styles.bar, className)}>
      <ol className={styles.list}>
        {(handleConfirm || form) && (
          <li className={clsx(styles.item, 'ml-auto')}>
            {extraButtons?.length
              ? extraButtons.map((button, index) => {
                  return (
                    <Button
                      key={`${index}${button.buttonText}`}
                      {...button}
                      className="mr-2 h-full"
                    >
                      {button.buttonText}
                    </Button>
                  )
                })
              : null}
            <Button
              appearance="primary"
              onClick={handleConfirm ? swallow(handleConfirm) : undefined}
              disabled={disableConfirm}
              aria-label="Confirm"
              type={form ? 'submit' : 'button'}
              form={form}
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
