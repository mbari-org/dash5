import { AsyncSubmitHandler } from '@sumocreations/forms'
import React from 'react'
import { SendNote, SendNoteValues } from '../Forms/SendNote'
import { Modal, ModalProps } from '../Modal'

type ModalPropsWithoutTitle = Omit<ModalProps, 'title'>

export interface SendNoteModalProps extends ModalPropsWithoutTitle {
  vehicleName: string
  onSubmit: AsyncSubmitHandler<SendNoteValues>
}

export const SendNoteModal: React.FC<SendNoteModalProps> = ({
  vehicleName,
  onSubmit,
  ...modalProps
}) => (
  <Modal {...modalProps} title={`Add note for ${vehicleName}`} form="noteForm">
    <SendNote onSubmit={onSubmit} id="noteForm" hideSubmit />
  </Modal>
)

SendNoteModal.displayName = 'Modals.SendNoteModal'
