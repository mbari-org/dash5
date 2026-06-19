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
  leftExtraButtons?: ExtraButton[]
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
  leftExtraButtons,
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
              ? extraButtons.map(({ buttonText, ...button }, index) => {
                  return (
                    <Button
                      key={`${index}${buttonText}`}
                      {...button}
                      className="mr-2 h-full"
                    >
                      {buttonText}
                    </Button>
                  )
                })
              : null}
            <Button
              appearance="primary"
              onClick={handleConfirm ? swallow(handleConfirm) : undefined}
              disabled={disableConfirm}
              type={form ? 'submit' : 'button'}
              form={form}
            >
              {confirmButtonText}
            </Button>
          </li>
        )}
        {handleCancel && (
          <li className={clsx(styles.item, 'gap-2')}>
            <Button
              appearance="secondary"
              onClick={swallow(handleCancel)}
              disabled={disableCancel}
            >
              {cancelButtonText}
            </Button>
            {leftExtraButtons?.map(({ buttonText, ...button }, index) => (
              <Button key={`left-${index}-${buttonText}`} {...button}>
                {buttonText}
              </Button>
            ))}
          </li>
        )}
      </ol>
    </nav>
  )
}

Footer.displayName = 'Components.Footer'
