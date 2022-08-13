import React from 'react'
import { Modal, ModalProps } from './Modal'

export interface DialogProps extends ModalProps {
  cancelButtonText?: string
  confirmButtonText?: string
  message: string | JSX.Element
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
      <section className="text-md">{message}</section>
    </Modal>
  )
}

Dialog.displayName = 'Dialog'
