import React from 'react'
import { Button } from '../Navigation'
import { Modal, ModalProps } from './Modal'

export interface DialogProps extends ModalProps {
  cancelLabel?: string
  confirmLabel?: string
  message: string
  onCancel?: () => void
  onConfirm: () => void
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  message,
  cancelLabel,
  confirmLabel,
  onConfirm: handleConfirm,
  onCancel: handleCancel,
  ...modalProps
}) => {
  console.log('Dialog.render', handleCancel)
  return (
    <Modal {...modalProps}>
      <p className="text-md mb-4 px-2">{message}</p>
      <div className="grid grid-cols-2 gap-4">
        {handleCancel ? (
          <Button appearance="secondary" onClick={handleCancel}>
            {cancelLabel ?? 'Cancel'}
          </Button>
        ) : null}
        <Button appearance="primary" onClick={handleConfirm}>
          {confirmLabel ?? 'Confirm'}
        </Button>
      </div>
    </Modal>
  )
}

Dialog.displayName = 'Dialog'
