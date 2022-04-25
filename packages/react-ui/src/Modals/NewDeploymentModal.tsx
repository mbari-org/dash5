import React from 'react'
import {
  NewDeploymentForm,
  NewDeploymentFormValues,
} from '../Forms/NewDeploymentForm'
import { AsyncSubmitHandler } from '@sumocreations/forms'
import { Modal, ModalProps } from '../Modal/Modal'

type ModalPropsWithOutTitle = Omit<ModalProps, 'title'>
export interface NewDeploymentModalProps extends ModalPropsWithOutTitle {
  vehicleName: string
  onSubmit: AsyncSubmitHandler<NewDeploymentFormValues>
}

export const NewDeploymentModal: React.FC<NewDeploymentModalProps> = ({
  vehicleName,
  onSubmit,
  ...modalProps
}) => {
  return (
    <Modal
      {...modalProps}
      title={`New ${vehicleName} deployment`}
      form="newDeploymentForm"
    >
      <NewDeploymentForm
        onSubmit={onSubmit}
        id="newDeploymentForm"
        hideSubmit
      />
    </Modal>
  )
}

NewDeploymentModal.displayName = 'Modals.NewDeploymentModal'
