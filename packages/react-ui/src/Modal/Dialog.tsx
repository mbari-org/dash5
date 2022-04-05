import React from 'react'
import { Modal, ModalProps } from './Modal'

export interface DialogProps extends ModalProps {
  cancelButtonText?: string
  confirmButtonText?: string
  message: string
  onCancel?: (() => void) | null
  onConfirm?: (() => void) | null
}

export const Dialog: React.FC<DialogProps> = ({
  children,
  message,
  ...modalProps
}) => {
  return (
    <Modal {...modalProps}>
      <p className="text-md">{message}</p>
    </Modal>
  )
}

Dialog.displayName = 'Dialog'
